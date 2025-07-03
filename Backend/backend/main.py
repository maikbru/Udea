from fastapi import FastAPI, Request
from pydantic import BaseModel
from sistemRAG import generate_response, search_similar_questions  # importa desde tu sistema actual
import pandas as pd
import json

app = FastAPI()

# Carga tu DataFrame original desde disco (donde están las preguntas/respuestas)
df = pd.read_json("preguntas_respuestas.json")  # o como lo hayas guardado

class QuestionRequest(BaseModel):
    question: str

@app.post("/ask")
def ask_question(req: QuestionRequest):
    indices = search_similar_questions(req.question)
    contexto = "\n".join([f"Pregunta: {df.iloc[i]['Preguntas']}\nRespuesta: {df.iloc[i]['Respuestas']}" for i in indices])
    respuesta = generate_response(req.question, contexto)
    return {"respuesta": respuesta}
