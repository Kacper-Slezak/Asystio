import uvicorn
import os
import anyio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from groq import Groq

from chat_manipulation.services import load_history, clear_history, add_to_history

app = FastAPI()

api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    print("BŁĄD KRYTYCZNY: Nie znaleziono klucza GROQ_API_KEY...")
    exit()

client = Groq(api_key=api_key)

class ChatMessageIn(BaseModel):
    text: str

origins = [
    "http://localhost",
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping")
async def check_status():
    return {"status": "ok"}


@app.get("/api/history")
async def get_history():
    history = load_history() 
    return JSONResponse(content={"messages": history})

@app.delete("/api/history")
async def delete_history():
    try:
        success = clear_history()
        if success:
            return JSONResponse(content={"message": "Historia czatu została wyczyszczona."})
        else:
            return JSONResponse(status_code=500, content={"error": "Nie udało się wyczyścić historii."})
    except Exception as e:
        print(f"Błąd w endpoincie /api/history: {e}")
        return JSONResponse(status_code=500, content={"error": "Wystąpił błąd serwera podczas czyszczenia historii."})

@app.post("/api/chat")
async def post_chat_message(message: ChatMessageIn):
    try:
        add_to_history("user", message.text)
        
        system_prompt = (
            "You are a helpful and patient English tutor. "
            "Your goal is to have a natural conversation with the user in English. "
            "Always respond in English. "
            "If the user makes a small grammar mistake, gently correct it in your response."
        )

        messages_for_api = [
            {"role": "system", "content": system_prompt}
        ]

        history = load_history()
        for msg in history:
            messages_for_api.append({
                "role": msg["sender"],
                "content": msg["text"]
            })

        chat_completion = client.chat.completions.create(
            messages=messages_for_api,
            model="llama-3.3-70b-versatile", 
        )

        ai_response_text = chat_completion.choices[0].message.content
        
        ai_message = add_to_history("assistant", ai_response_text)

        return JSONResponse(content={
            "response_text": ai_message["text"],
            "timestamp": ai_message["timestamp"]
        })
        
    except Exception as e:
        print(f"Wystąpił błąd API: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Błąd podczas komunikacji z API Groq."}
        )

if __name__ == "_main_":
    uvicorn.run(app, host="127.0.0.1", port=8000)

