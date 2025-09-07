# backend/services/chat_service.py
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from backend.models.chat import Chat
from backend.utils.db import get_db

# Initialize Gemini model
chat_model = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro",
    google_api_key=os.getenv("AIzaSyCxshzsYpoQ-YBJL4dsML2T8Fm81auJ-qU"),
    temperature=0.7
)

def get_chat_response(user_id, user_message):
    """
    Fetch user personality from DB, generate chatbot response with Gemini,
    and save conversation history.
    """
    db = get_db()

    # Fetch user
    user = db.users.find_one({"_id": user_id})
    if not user:
        return "User not found. Please re-login."

    personality_type = user.get("personality_type", "Unknown")

    # Prompt template
    template = """
    You are a supportive mental wellness chatbot.
    The user has personality type: {personality_type}.
    Respond with empathy, encouragement, and helpful strategies.

    User: {user_message}
    Chatbot:
    """
    prompt = ChatPromptTemplate.from_template(template)
    chain = prompt | chat_model

    # Generate response
    response = chain.invoke({
        "user_message": user_message,
        "personality_type": personality_type
    }).content

    # Save chat history
    chat_entry = Chat(user_id, user_message, response)
    db.chats.insert_one(chat_entry.to_dict())

    return response
