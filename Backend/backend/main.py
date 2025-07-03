from fastapi import FastAPI, Request
from pydantic import BaseModel
from SistemRAG import generate_response, search_similar_questions
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://udea-topaz.vercel.app"],  # Puedes cambiar a ["*"] durante desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar preguntas/respuestas
df = pd.read_json("few_shot_examples.json")  # Asegúrate que exista este archivo

class QuestionRequest(BaseModel):
    question: str

@app.post("/ask")
def ask_question(req: QuestionRequest):
    try:
        indices = search_similar_questions(req.question)

        # Validar que los índices sean válidos
        valid_indices = [i for i in indices if 0 <= i < len(df)]

        if not valid_indices:
            return {"respuesta": "No se encontraron respuestas relacionadas."}

        contexto = "\n".join([
            f"Pregunta: {df.iloc[i]['Preguntas']}\nRespuesta: {df.iloc[i]['Respuestas']}"
            for i in valid_indices
        ])

        respuesta = generate_response(req.question, contexto)
        return {"respuesta": respuesta}

    except Exception as e:
        print(f"Error procesando la pregunta: {e}")
        return {"respuesta": "Ocurrió un error procesando tu pregunta."}
