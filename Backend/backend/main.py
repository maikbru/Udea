from fastapi import FastAPI
import psycopg2
import requests
from bs4 import BeautifulSoup
from pydantic import BaseModel
from SistemRAG import generate_response, search_similar_questions
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import os
from typing import List, Literal, Optional
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

def guardar_mensaje(empresa_id: str, rol: str, mensaje: str):
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
            port=os.getenv("DB_PORT")
        )
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO mensajes (empresa_id, mensaje) VALUES (%s, %s)",
            (empresa_id, mensaje)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error al guardar mensaje: {e}")

def scrape_links(links: List[str]) -> str:
    texto_total = ""
    for url in links:
        try:
            response = requests.get(url, timeout=10)
            if response.status_code != 200:
                print(f"❌ No se pudo acceder a {url} (status {response.status_code})")
                continue

            soup = BeautifulSoup(response.content, "html.parser")

            # Elimina contenido basura
            for tag in soup(["script", "style", "noscript", "svg", "img", "header", "footer", "nav"]):
                tag.decompose()

            texto = soup.get_text(separator="\n", strip=True)
            lineas = [linea.strip() for linea in texto.splitlines() if len(linea.strip()) > 30]
            texto_limpio = "\n\n".join(lineas[:50])  # máximo 50 líneas por link
            texto_total += f"\n\n=== CONTENIDO DE {url} ===\n\n{texto_limpio}"

        except Exception as e:
            print(f"⚠️ Error al hacer scraping de {url}: {e}")
            continue

    return texto_total

# Cargar preguntas/respuestas
df = pd.read_json("few_shot_examples.json")

class Message(BaseModel):
    role: Literal['user', 'bot']
    text: str

class QuestionRequest(BaseModel):
    question: str
    empresa_id: str
    history: Optional[List[Message]] = []

@app.post("/ask")
def ask_question(req: QuestionRequest):
    try:
        guardar_mensaje(req.empresa_id, 'user', req.question)
        links = get_links_from_db(req.empresa_id)
        scraped_context = scrape_links(links if isinstance(links, list) else [links])
        results = search_similar_questions(req.question)

        print("Resultados FAISS:", results)
        print("Tamaño del DataFrame:", len(df))

        threshold = 2.0
        valid_pairs = [
            (int(i), float(d)) for i, d in results
            if 0 <= int(i) < len(df) and float(d) < threshold
        ]

        contexto_faiss = "\n".join([
            f"Pregunta: {df.iloc[i]['Preguntas']}\nRespuesta: {df.iloc[i]['Respuestas']}"
            for i, _ in valid_pairs
        ]) if valid_pairs else ""

        # 🔁 Construir el historial en texto plano
        historial = ""
        for m in req.history:
            historial += f"{m.role.upper()}: {m.text}\n"
        historial += f"USER: {req.question}\n"

        # 🧠 Generar respuesta con todo el contexto
        full_context = contexto_faiss + "\n" + scraped_context + "\n" + historial
        respuesta = generate_response(req.question, full_context)

        return {"respuesta": respuesta}

    except Exception as e:
        print(f"Error procesando la pregunta: {e}")
        return {"respuesta": "Ocurrió un error procesando tu pregunta."}