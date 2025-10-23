import anyio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from chat_manipulation.services import load_history

app = FastAPI()

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

@app.post("/chat")
async def get_chats():
    return []

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
            # Jeśli funkcja clear_history zwróci False
            return JSONResponse(status_code=500, content={"error": "Nie udało się wyczyścić historii."})
    except Exception as e:
        print(f"Błąd w endpoincie /api/history: {e}")
        return JSONResponse(status_code=500, content={"error": "Wystąpił błąd serwera podczas czyszczenia historii."})



