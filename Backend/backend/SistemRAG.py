import faiss
import numpy as np
from openai import OpenAI
from dotenv import load_dotenv
import os
import json

# Configuración
load_dotenv()
INDEX_FILE = "faiss_index.index"
FEW_SHOT_FILE = "few_shot_examples.json"
EMBEDDING_MODEL = "text-embedding-3-large"
CHAT_MODEL = "gpt-3.5-turbo"  # Modelo económico

# Cargar el índice FAISS
index = faiss.read_index(INDEX_FILE)

# Cargar ejemplos few-shot
with open(FEW_SHOT_FILE, 'r', encoding='utf-8') as f:
    few_shot_examples = json.load(f)

# Inicializar cliente OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_embedding(text, model=EMBEDDING_MODEL):
    """Obtiene embedding para un texto"""
    text = str(text)
    response = client.embeddings.create(input=[text], model=model)
    return np.array(response.data[0].embedding).astype('float32')

def search_similar_questions(query, k=3):
    """Busca preguntas similares en el índice FAISS"""
    query_embedding = get_embedding(query).reshape(1, -1)
    distances, indices = index.search(query_embedding, k)
    return indices[0].tolist()

def format_few_shot_examples():
    """Formatea los ejemplos para el prompt"""
    examples_text = ""
    for example in few_shot_examples:
        examples_text += f"\nPregunta: {example['Preguntas']}\nRespuesta: {example['Respuestas']}\n"
    return examples_text

def generate_response(user_query, context):
    """Genera una respuesta usando el modelo de chat"""
    prompt = f"""Eres un asistente experto que responde preguntas basado en el contexto proporcionado.

Ejemplos de preguntas y respuestas:
{format_few_shot_examples()}

Contexto relevante:
{context}

Pregunta: {user_query}
Respuesta:"""
    
    response = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": "Eres un asistente útil que responde preguntas basado unicamente en los datos de entrenamiento. No investes nada."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.0
    )
    
    return response.choices[0].message.content

def main():
    print("Sistema RAG - Asistente de Preguntas y Respuestas")
    print("Escribe 'salir' para terminar.\n")
    
    while True:
        user_query = input("\nTu pregunta: ")
        
        if user_query.lower() == 'salir':
            break
        
        # Buscar contexto relevante
        similar_indices = search_similar_questions(user_query)
        print(f"\nBuscando información relevante... (Resultados encontrados: {len(similar_indices)})")
        
        # Aquí deberías tener una forma de recuperar los textos originales
        # Por simplicidad, asumimos que tienes acceso al DataFrame original
        # En una implementación real, deberías cargar tus datos originales
        context = "[Contexto de ejemplo] Por favor, implementa la carga de tus datos originales aquí"
        
        # Generar respuesta
        response = generate_response(user_query, context)
        print("\nRespuesta:", response)

if __name__ == "__main__":
    main()