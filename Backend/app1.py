"""
Este script es para hacer el indexado
Si se ejecuta este codigo se crea un archivo llamadao faiss_index.index
"""
import pandas as pd
import numpy as np
from openai import OpenAI
import faiss
from dotenv import load_dotenv
import os

# Configuración
load_dotenv()  # Carga las variables del archivo .env
EXCEL_FILE = "PreguntasYRespuestas.xlsx"
INDEX_FILE = "faiss_index.index"
EMBEDDING_MODEL = "text-embedding-3-large"

def get_embeddings(texts, client, model=EMBEDDING_MODEL):
    """Obtiene embeddings para una lista de textos"""
    texts = [str(text) for text in texts]
    response = client.embeddings.create(input=texts, model=model)
    return [np.array(embedding.embedding) for embedding in response.data]

def create_faiss_index(embeddings):
    """Crea un índice FAISS a partir de los embeddings"""
    dimension = len(embeddings[0])
    index = faiss.IndexFlatL2(dimension)
    embeddings_matrix = np.vstack(embeddings).astype('float32')
    index.add(embeddings_matrix)
    return index

def main():
    # Leer el archivo Excel
    df = pd.read_excel(EXCEL_FILE)
    
    # Combinar preguntas, respuestas y temas
    df['text_to_embed'] = df.apply(
        lambda row: f"Pregunta: {row['Preguntas']}\nRespuesta: {row['Respuestas']}\nTema: {row['Tema']}", 
        axis=1
    )
    
    # Inicializar cliente de OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    # Obtener embeddings
    print("Generando embeddings...")
    embeddings = get_embeddings(df['text_to_embed'].tolist(), client)
    
    # Crear índice FAISS
    print("Creando índice FAISS...")
    index = create_faiss_index(embeddings)
    
    # Guardar el índice
    faiss.write_index(index, INDEX_FILE)
    print(f"Índice FAISS guardado en {INDEX_FILE}")

if __name__ == "__main__":
    main()