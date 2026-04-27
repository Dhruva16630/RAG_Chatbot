from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pymongo import MongoClient
from google import genai
from google.genai import types


# CONFIG
PDF_PATH = "F1Data.pdf"
MONGO_URI = ""
DB_NAME = "f1_rag"
COLLECTION = "docs"


client = genai.Client(api_key="")

# 1. Extract
def extract_pdf_text(file_path):
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

# 2. Chunk
def split_text(text):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    return splitter.split_text(text)

# 3. Embedding
def get_embedding(text):
    response = client.models.embed_content(
        model="gemini-embedding-2",
        contents=text,
        config = types.EmbedContentConfig(output_dimensionality=768)
    )
    return [float(x) for x in response.embeddings[0].values]

# 4. Store
def store(chunks):
    client = MongoClient(MONGO_URI)
    collection = client[DB_NAME][COLLECTION]

    docs = []
    for i, chunk in enumerate(chunks):
        emb = get_embedding(chunk)

        docs.append({
            "chunk_id": i,
            "text": chunk,
            "embedding": emb
        })

    collection.insert_many(docs)
    print("✅ Stored in DB")


if __name__ == "__main__":
    text = extract_pdf_text(PDF_PATH)
    chunks = split_text(text)
    store(chunks)