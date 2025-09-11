# services/embeddings_service.py
import os
import pinecone
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# 1. Initialize the embeddings model using your API Key
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/text-embedding-004",
    google_api_key=os.getenv("GOOGLE_API_KEY")
)


try:
    pinecone.init(
    api_key=os.getenv("PINECONE_API_KEY"),
    environment=os.getenv("PINECONE_ENVIRONMENT")
)

# Make sure to replace "your-index-name" with your actual index name
    index_name = os.getenv("PINECONE_INDEX")
    index = pinecone.Index(index_name)
except Exception as e:
    print(f"error connecting to pinecone: {e}")
    index = None