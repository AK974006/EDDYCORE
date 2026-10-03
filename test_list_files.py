import os
from dotenv import load_dotenv
from supabase import create_client
import json

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = os.getenv("SUPABASE_BUCKET", "ak")

print("Testing Supabase File Listing")
print(f"Bucket: {BUCKET_NAME}")

try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("Client created")
    
    # List files in bucket
    print(f"\nListing files in bucket '{BUCKET_NAME}'...")
    response = supabase.storage.from_(BUCKET_NAME).list()
    
    print(f"\nResponse type: {type(response)}")
    print(f"Response: {response}")
    
    if response:
        print(f"\nNumber of items: {len(response)}")
        for i, item in enumerate(response):
            print(f"\n--- Item {i+1} ---")
            print(f"Type: {type(item)}")
            if hasattr(item, '__dict__'):
                print(f"Attributes: {item.__dict__}")
            else:
                print(f"Value: {item}")
    else:
        print("\nNo items returned or response is None")
        
except Exception as e:
    print(f"\nERROR: {e}")
    import traceback
    traceback.print_exc()
