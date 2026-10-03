import asyncio
import os
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
# Using the same model as backend/eddie.py
MODEL = "amazon/nova-2-lite-v1:free"

async def chat_with_eddie():
    print("=" * 60)
    print("EDDIE AI - TERMINAL MODE")
    print("=" * 60)
    
    if not OPENROUTER_API_KEY:
        print("❌ ERROR: OPENROUTER_API_KEY not set in .env")
        return

    print(f"Model: {MODEL}")
    print("Type 'exit' or 'quit' to stop.\n")

    history = [
        {
            "role": "system",
            "content": "You are Eddie, an advanced AI assistant. You are helpful, concise, and friendly."
        }
    ]

    async with httpx.AsyncClient(timeout=60.0) as client:
        while True:
            user_input = input("YOU: ")
            if user_input.lower() in ['exit', 'quit']:
                print("Eddie: Goodbye!")
                break
            
            # Add user message
            history.append({"role": "user", "content": user_input})
            
            # Prepare payload
            payload = {
                "model": MODEL,
                "messages": history[-10:], # Keep last 10 messages context
                "max_tokens": 500,
                "temperature": 0.7
            }
            
            print("Eddie: (Thinking...)")
            
            try:
                response = await client.post(
                    OPENROUTER_API_URL,
                    headers={
                        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:5173",
                        "X-Title": "EDDYCORE - Eddie CLI"
                    },
                    json=payload
                )
                
                if response.status_code == 200:
                    data = response.json()
                    ai_text = data['choices'][0]['message']['content']
                    
                    # Print response
                    # Overwrite the "(Thinking...)" line if possible, or just print new line
                    print(f"Eddie: {ai_text}\n")
                    
                    # Add to history
                    history.append({"role": "assistant", "content": ai_text})
                else:
                    print(f"❌ Error {response.status_code}: {response.text}")
                    
            except Exception as e:
                print(f"❌ Connection Error: {str(e)}")

if __name__ == "__main__":
    try:
        asyncio.run(chat_with_eddie())
    except KeyboardInterrupt:
        print("\nEddie: Session terminated.")
