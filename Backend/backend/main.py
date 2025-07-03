from fastapi import FastAPI, Request
from pydantic import BaseModel
from SistemRAG import generate_response, search_similar_questions  # importa desde tu sistema actual
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://udea-topaz.vercel.app"],  # o ["*"] si es temporal
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Carga tu DataFrame original desde disco (donde están las preguntas/respuestas)
df = pd.read_json("few_shot_examples.json")  # o como lo hayas guardado

class QuestionRequest(BaseModel):
    question: str

@app.post("/ask")
def ask_question(req: QuestionRequest):
    indices = search_similar_questions(req.question)
    contexto = "\n".join([f"Pregunta: {df.iloc[i]['Preguntas']}\nRespuesta: {df.iloc[i]['Respuestas']}" for i in indices])
    respuesta = generate_response(req.question, contexto)
    return {"respuesta": respuesta}
