from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from query import get_embedding
from pymongo import MongoClient
from google import genai

genai_client = genai.Client(api_key="")


MONGO_URI = ""
DB_NAME = "f1_rag"
COLLECTION = "docs"


client = MongoClient(MONGO_URI)
collection = client[DB_NAME][COLLECTION]

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str



def search(query: str):
    query_emb = get_embedding(query)

    results = collection.aggregate([
        {
            "$vectorSearch": {
                "index": "vector_index",
                "path": "embedding",
                "queryVector": query_emb,
                "numCandidates": 900,
                "limit": 5
            }
        },
        {
            "$project": {
                "_id":0,
                "text": 1,
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ])

    return list(results)





import time

@app.post("/query")
def query_api(request: QueryRequest):
    try:
        
        query = request.query.replace("\n", " ").strip()

        if not query:
            return {
                "answer": "Please enter a valid query.",
                "sources": []
            }

        
        results = search(query)
        
        if not results:
            return {
                "answer": "No relevant information found.",
                "sources": []
            }

        context = "\n\n---\n\n".join(
            [f"Source {i+1}:\n{r.get('text', '')[:300]}" for i, r in enumerate(results)]
        )

        prompt = f"""
        You are an F1 assistant.

        Answer the question using ONLY the context below.
        If the answer is not present, say:
        "I don't have enough information to answer that."

        Keep answers concise and clear.
        Use markdown formatting where helpful.

        Context:
        {context}
        Question: {query}
        """

       
        try:
            response = genai_client.models.generate_content(
                model="gemini-3-flash-preview",
                contents=prompt
            )
            answer = response.text

        except Exception as e:
            print("Gemini error:", e)

            
            try:
                time.sleep(2)
                response = genai_client.models.generate_content(
                    model="gemini-3-flash-preview",
                    contents=prompt
                )
                answer = response.text

            except Exception as e2:
                print("Retry failed:", e2)

                
                answer = (
                    " Model is busy. Showing relevant information instead:\n\n"
                    + context
                )

        
        clean_sources = [
            {
                "text": r.get("text"),
                "score": r.get("score")
            }
            for r in results
        ]

        return {
            "answer": answer,
            "sources": clean_sources
        }

    except Exception as e:
        print("Server error:", e)

        return {
            "answer": " Something went wrong. Please try again.",
            "sources": []
        }