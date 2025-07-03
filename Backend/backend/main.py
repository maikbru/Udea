from fastapi import FastAPI
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

# Cargar preguntas/respuestas
df = pd.read_json("few_shot_examples.json")

class QuestionRequest(BaseModel):
    question: str

@app.post("/ask")
def ask_question(req: QuestionRequest):
    try:
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

        respuesta = generate_response(req.question, contexto)
        return {"respuesta": respuesta}

    except Exception as e:
        print(f"Error procesando la pregunta: {e}")
        return {"respuesta": "Ocurrió un error procesando tu pregunta."}
