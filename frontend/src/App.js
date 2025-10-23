import React, { useState, useEffect, useRef} from "react";
import { MessageBox, Input } from 'react-chat-elements';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// --- Moduł Serwisu API ---
// Zgodnie z planem (Faza 3), zastępujemy mocki prawdziwymi wywołaniami.
// Kacper i Kiryl muszą wystawić te endpointy.
const apiService = {
  getHistory: async () => {
    // Backend ma zwrócić 10 ostatnich wiadomości
    try {
      const response = await fetch('/api/history'); // Założony endpoint
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      // Mapujemy dane z backendu na format wymagany przez react-chat-elements
      return data.messages.map(msg => ({
        position: msg.sender === 'user' ? 'right' : 'left',
        type: 'text',
        title: msg.sender === 'user' ? 'Ty' : 'Asystent',
        text: msg.text,
        date: new Date(msg.timestamp),
      }));
    } catch (error) {
      console.error("Błąd podczas ładowania historii:", error);
      // W przypadku błędu, zwracamy wiadomość powitalną (Faza 2: mock)
      return [
        {
          position: 'left',
          type: 'text',
          title: 'Asystent',
          text: 'Witaj! Jak mogę Ci dzisiaj pomóc?',
          date: new Date(),
        }
      ];
    }
  },
  
  sendMessage: async (messageText) => {
    // Wysyłamy wiadomość do backendu
    try {
      const response = await fetch('/api/chat', { // Założony endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: messageText }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json(); // Backend (OpenAI) zwraca odpowiedź
      
      // Zwracamy odpowiedź w formacie komponentu
      return {
        position: 'left',
        type: 'text',
        title: 'Asystent',
        text: data.response_text,
        date: new Date(data.timestamp),
      };
    } catch (error) {
      console.error("Błąd podczas wysyłania wiadomości:", error);
      return {
        position: 'left',
        type: 'text',
        title: 'Błąd Systemu',
        text: 'Nie udało się uzyskać odpowiedzi od serwera.',
        date: new Date(),
      };
    }
  }
};
// --- Koniec Modułu Serwisu API ---
function App() {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);

    const chatListEndRef = useRef(null);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        setInputValue(transcript);
    }, [transcript]);

    useEffect(() => {
        chatListEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isAiTyping]);
      // Ładowanie historii wiadomości przy starcie aplikacji (Faza 3)
    useEffect(() => {
        const loadHistory = async () => {
        const historyMessages = await apiService.getHistory();
        setMessages(historyMessages);
        };
        loadHistory();
    }, []);

    // Automatyczne przewijanie czatu na dół przy nowej wiadomości
    useEffect(() => {
        chatListEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    // Obsługa wysyłania wiadomości
    const handleSend = async () => {
        if (!inputValue.trim()) return; // Nie wysyłaj pustych

        // 1. Dodaj wiadomość użytkownika (Optymistyczne UI)
        const userMessage = {
        position: 'right',
        type: 'text',
        title: 'Ty',
        text: inputValue,
        date: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        
        // 2. Wyczyść input i transkrypt STT
        const messageToSend = inputValue;
        setInputValue('');
        resetTranscript();

        // 3. Pokaż wskaźnik pisania bota
        setIsAiTyping(true);

        // 4. Wyślij do API i czekaj na odpowiedź (Faza 3)
        const aiResponse = await apiService.sendMessage(messageToSend);

        // 5. Ukryj wskaźnik i dodaj odpowiedź bota
        setIsAiTyping(false);
        setMessages(prev => [...prev, aiResponse]);
    };

    // Obsługa STT
    const startListening = () => SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
    
    const stopListeningAndSend = () => {
        SpeechRecognition.stopListening();
        // Czekamy chwilę, aby 'transcript' zdążył się zaktualizować przed wysłaniem
        setTimeout(() => {
        handleSend();
        }, 100); // Mały bufor
    };

            // Tę funkcję możesz podpiąć pod przycisk "Zacznij od nowa"
    async function resetChat() {
        try {
            const response = await fetch('/api/history', {
                method: 'DELETE' // Ważna jest metoda DELETE
            });

            if (response.ok) {
                console.log("Historia czatu wyczyszczona!");

                    // Tutaj powinieneś również wyczyścić widok czatu w HTML
                    // na przykład:
                    // document.getElementById('chat-messages-container').innerHTML = '';

                alert("Chat został zresetowany!");
            } else {
                console.error("Błąd podczas resetowania czatu.");
                alert("Nie udało się zresetować czatu.");
            }
        } catch (error) {
            console.error("Błąd sieci:", error);
        }
    }

    if (!browserSupportsSpeechRecognition) {
        return <div className="app-container">Twoja przeglądarka nie wspiera Speech-to-Text.</div>;
    }

    return (
        <div className="app-container">
        <div className="header">
            <h2>Asystio</h2>
        </div>

        {/* Kontrolki STT - Wymaganie MVP nr 3 */}
        <div className="stt-controls">
            <button onClick={startListening} disabled={listening}>
            Talk 🎙️
            </button>
            <button onClick={stopListeningAndSend} disabled={!listening}>
            Stop and Send
            </button>
            {listening && <span> Słucham...</span>}
            <button> New chat </button>
        </div>

        {/* Lista wiadomości - Wymaganie MVP nr 1 i 2 */}
        <div className="chat-list-container">
            {messages.map((msg, index) => (
            <MessageBox
                key={index}
                position={msg.position}
                type={msg.type}
                title={msg.title}
                text={msg.text}
                date={msg.date}
            />
            ))}
            {/* Wskaźnik pisania AI */}
            {isAiTyping && (
            <MessageBox
                position="left"
                type="text"
                title="Asystent"
                text="..." // 'react-chat-elements' nie ma wbudowanego "typing"
            />
            )}
            <div ref={chatListEndRef} />
        </div>

        {/* Input - Wymaganie MVP nr 1 */}
        <div className="input-container">
            <Input
            placeholder="Napisz wiadomość lub użyj mikrofonu..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            rightButtons={
                <button 
                className="rce-button" 
                onClick={handleSend}
                style={{backgroundColor: '#006692', color: 'white'}}
                >
                Send
                </button>
            }
            />
        </div>
        <div className="footer-info">
            @IO_2025
        </div>
        </div>
    );
}

export default App;