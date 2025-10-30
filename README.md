# Asystio

Asystio to inteligentny asystent czatowy zaprojektowany jako cierpliwy nauczyciel języka angielskiego. Aplikacja umożliwia prowadzenie naturalnej konwersacji, oferując jednocześnie delikatne korekty błędów gramatycznych. Projekt wykorzystuje rozpoznawanie mowy (Speech-to-Text) do wprowadzania głosowego.

Aplikacja zbudowana jest w architekturze full-stack:

  * **Backend:** Python z frameworkiem **FastAPI**, obsługujący logikę czatu, zarządzanie historią (w pliku `history.json`) oraz integrację z API **Groq** (model `llama-3.3-70b-versatile`).
  * **Frontend:** **React**, wykorzystujący komponenty `react-chat-elements` do interfejsu oraz `react-speech-recognition` do obsługi mowy.

## Kluczowe Funkcje

  * Prowadzenie rozmowy tekstowej z asystentem AI.
  * Wprowadzanie zapytań głosowych (Speech-to-Text) w języku angielskim.
  * Systemowy prompt instruujący AI, by pełniło rolę nauczyciela angielskiego i korygowało błędy.
  * Wczytywanie i zapisywanie historii konwersacji.
  * Możliwość wyczyszczenia historii czatu.

-----

## Instrukcja Uruchomienia

### Wymagania Wstępne

Przed uruchomieniem projektu upewnij się, że masz zainstalowane następujące narzędzia:

1.  **Node.js i npm:** Niezbędne do uruchomienia frontendu React.
2.  **Python (wersja 3.8+):** Niezbędny do uruchomienia backendu FastAPI.
3.  **Klucz API Groq:** Backend wymaga klucza API do komunikacji z modelem językowym. Klucz ten musi być ustawiony jako zmienna środowiskowa.

-----

### Krok 1: Konfiguracja i uruchomienie Backendu

Backend należy uruchomić jako pierwszy, aby frontend mógł się z nim połączyć.

1.  **Otwórz terminal** i przejdź do katalogu `backend`:

    ```bash
    cd sciezka/do/projektu/backend
    ```

2.  **Utwórz wirtualne środowisko** (zalecane):

    ```bash
    python -m venv venv
    ```

3.  **Aktywuj wirtualne środowisko:**

      * Na Windows (CMD):
        ```bash
        .\venv\Scripts\activate
        ```
      * Na macOS/Linux (Bash):
        ```bash
        source venv/bin/activate
        ```

4.  **Zainstaluj wymagane pakiety** Pythona:

    ```bash
    pip install -r requirements.txt
    ```

    (Zainstaluje to `fastapi`, `uvicorn` i `groq`).

5.  **Ustaw zmienną środowiskową `GROQ_API_KEY`:**

      * Na Windows (CMD):
        ```bash
        set GROQ_API_KEY=TWOJ_KLUCZ_API_GROQ
        ```
      * Na macOS/Linux (Bash):
        ```bash
        export GROQ_API_KEY="TWOJ_KLUCZ_API_GROQ"
        ```
      * Na Windows (PowerShall):
        ```bash
        $env:GROQ_API_KEY="TWOJ_KLUCZ_API_GROQ"
        ```

    *Uwaga: Aplikacja nie uruchomi się bez tego klucza.*

6.  **Uruchom serwer FastAPI:**

    ```bash
    uvicorn main:app --host 127.0.0.1 --port 8000
    ```

    (Serwer będzie działał pod adresem `http://127.0.0.1:8000`).

**Pozostaw ten terminal uruchomiony.**

-----

### Krok 2: Konfiguracja i uruchomienie Frontendu

1.  **Otwórz drugi (nowy) terminal** i przejdź do katalogu `frontend`:

    ```bash
    cd sciezka/do/projektu/frontend
    ```

2.  **Zainstaluj zależności Node.js:**

    ```bash
    npm install
    ```

    (Zainstaluje to m.in. `react`, `react-chat-elements` i `react-speech-recognition`).

3.  **Uruchom aplikację React:**

    ```bash
    npm start
    ```

    (Spowoduje to uruchomienie serwera deweloperskiego React).

4.  Aplikacja powinna automatycznie otworzyć się w przeglądarce pod adresem `http://localhost:3000` (lub podobnym).

Frontend jest skonfigurowany do komunikacji z backendem za pomocą proxy na adres `http://127.0.0.1:8000`.

### Krok 3: Korzystanie z aplikacji

  * Otwórz `http://localhost:3000` w przeglądarce (jeśli nie otworzyło się automatycznie).
  * Możesz teraz rozmawiać z asystentem, pisząc na klawiaturze lub używając przycisków "Talk" (mów) i "Stop and Send" (zatrzymaj i wyślij).
