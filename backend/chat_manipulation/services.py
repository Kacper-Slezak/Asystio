import json
import os
from datetime import datetime
from backend.config import HISTORY_FILE, MAX_HISTORY_LENGTH

def load_history():
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []
    
def save_history(history):
    with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
        json.dump(history, f, indent=2, ensure_ascii=False)

def add_to_history(sender: str, text: str):
    history = load_history()
    new_message = {
        "sender": sender, # "sender" jest mapowane na "role" w API
        "text": text,     # "text" jest mapowane na "content" w API
        "timestamp": datetime.now().isoformat()
    }
    history.append(new_message)

    history = history[-MAX_HISTORY_LENGTH:]
    
    save_history(history)
    
    return new_message  

def clear_history():
    try:
        save_history([])
        return True
    except Exception:
        print("Error clearing history")
        return False
