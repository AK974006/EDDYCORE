import httpx
import os
from dotenv import load_dotenv
import json

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY")

async def test_api():
    print("=" * 60)
    print("TESTING OPENROUTER API")
    print("=" * 60)
    print(f"\nAPI Key: {API_KEY[:25]}..." if API_KEY else "❌ No API Key found!")
    print(f"API Key Length: {len(API_KEY) if API_KEY else 0}")
    
    if not API_KEY:
        print("\n❌ ERROR: OPENROUTER_API_KEY not found in .env file!")
        return
    
    # Test with Google Gemma 3 27B (free)
    model = "google/gemma-3-27b-it:free"
    print(f"\nTesting Model: {model}")
    print("-" * 60)
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5173",
                    "X-Title": "EDDYCORE - Eddie AI Test"
                },
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": "You are Eddie, a helpful AI assistant."},
                        {"role": "user", "content": "Say hello in one short sentence."}
                    ],
                    "max_tokens": 100
                }
            )
            
            print(f"\nStatus Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("\nSUCCESS!")
                print("-" * 60)
                print(f"Model Used: {data.get('model', 'N/A')}")
                ai_response = data['choices'][0]['message']['content']
                print(f"Response: {ai_response}")
                print("\nTest PASSED - Eddie AI is working!")
            else:
                print(f"\nERROR: {response.status_code}")
                print("-" * 60)
                try:
                    error_data = response.json()
                    print("Error Details:")
                    print(json.dumps(error_data, indent=2))
                except:
                    print("Raw Error Response:")
                    print(response.text)
                    
    except httpx.TimeoutException:
        print("\n❌ REQUEST TIMED OUT")
        print("The API took too long to respond. This might be normal for free models.")
    except Exception as e:
        print(f"\n❌ EXCEPTION: {type(e).__name__}")
        print(f"Message: {str(e)}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_api())
