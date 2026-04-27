from pymongo import MongoClient
from google import genai
from google.genai import types


genai_client = genai.Client(api_key="")

client = MongoClient("")
collection = client["f1_rag"]["docs"]

def get_embedding(text):
    response = genai_client.models.embed_content(
        model="gemini-embedding-2",
        contents=text,
        config = types.EmbedContentConfig(output_dimensionality=768),
        
    )
    return [float(x) for x in response.embeddings[0].values]

#print(len(get_embedding("test")))
#query_emb = get_embedding("2026 F1 rules")

# print(type(query_emb))
# print(type(query_emb[0]))
# print(len(query_emb))

def search(query):
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
                "text": 1,
                "score": { "$meta": "vectorSearchScore" }
            }
        }
    ])

    return list(results)

# doc = collection.find_one()

# print("Stored vector length:", len(doc["embedding"]))
# print("Stored sample:", doc["embedding"][:5])

# query_emb = get_embedding("2026 F1 rules")
# print("Query sample:", query_emb[:5])

# if __name__ == "__main__":
#     results = search("2026 F1 schedule")

#     for r in results:
#         print(r["text"])
#         print("Score:", r["score"])

# print(collection.count_documents({}))
# doc = collection.find_one()
# print(doc.keys())

# print(type(doc["embedding"][0]))  # 👈 ADD THIS
# print(doc["embedding"][:5])   

if __name__ == "__main__":
    results = search("2026 F1 new power units")

    print("Number of results:", len(results))  # 👈 add this

    for r in results:
        print("Score:", r.get("score"))
        print(r.get("text"))
        print("-" * 50)
    if results:
        print(results[0])
    else:
        print("No results found")