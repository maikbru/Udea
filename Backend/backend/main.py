from fastapi import FastAPI
import psycopg2
import requests
from bs4 import BeautifulSoup
from pydantic import BaseModel
from SistemRAG import generate_response, search_similar_questions
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://udea-topaz.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
def get_links_from_db(empresa_id):
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        port=os.getenv("DB_PORT")
    )
    cursor = conn.cursor()
    cursor.execute("SELECT link_data FROM empresa_config WHERE empresa_id = %s", (empresa_id,))
    result = cursor.fetchone()
    conn.close()
    if result:
        return result[0]  # Suponiendo que es JSON
    return []

def scrape_links(links):
    texts = []
    for url in links:
        try:
            response = requests.get(url, timeout=10)
            soup = BeautifulSoup(response.content, "html.parser")
            texts.append(soup.get_text())
        except Exception as e:
            print(f"Error al hacer scraping de {url}: {e}")
    return "\n".join(texts)
# Cargar preguntas/respuestas
df = pd.read_json("few_shot_examples.json")

class QuestionRequest(BaseModel):
    question: str
    empresa_id: str

@app.post("/ask")
def ask_question(req: QuestionRequest):
    try:
        links = get_links_from_db(req.empresa_id)
        scraped_context = scrape_links(links)
        results = search_similar_questions(req.question)
        print("Resultados FAISS:", results)
        print("Tamaño del DataFrame:", len(df))

        # Ajustar o eliminar el threshold según los valores observados
        threshold = 2.0
        valid_pairs = [
            (int(i), float(d)) for i, d in results
            if 0 <= int(i) < len(df) and float(d) < threshold
        ]

        if not valid_pairs:
            return {"respuesta": "No se encontraron respuestas relacionadas."}

        contexto = "\n".join([
            f"Pregunta: {df.iloc[i]['Preguntas']}\nRespuesta: {df.iloc[i]['Respuestas']}"
            for i, _ in valid_pairs
        ])

        respuesta = generate_response(req.question, contexto + scraped_context)
        return {"respuesta": respuesta}

    except Exception as e:
        print(f"Error procesando la pregunta: {e}")
        return {"respuesta": "Ocurrió un error procesando tu pregunta."}
