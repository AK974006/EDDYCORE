import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ukjofmkyobtdrzovwfcg.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = "eddycore-files"

print("Using SUPABASE_URL:", SUPABASE_URL)
print("SUPABASE_KEY set:", bool(SUPABASE_KEY))

if not SUPABASE_KEY:
    print("No SUPABASE_KEY provided — will attempt unauthenticated client (may fail)")

try:
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Client created. Listing buckets...")
    try:
        buckets = client.storage.list_buckets()
        print("Buckets:")
        for b in buckets:
            print(" -", b.get('name'))
    except Exception as e:
        print("Error listing buckets:", e)

    print("Attempting to list objects in bucket:", BUCKET_NAME)
    try:
        objs = client.storage.from_(BUCKET_NAME).list()
        print("Objects returned:", objs)
    except Exception as e:
        print("Error listing objects in bucket:", e)

except Exception as e:
    print("Failed to create Supabase client:", e)
