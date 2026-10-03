import os
from dotenv import load_dotenv
from supabase import create_client
import json

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = "ak"

print("=" * 60)
print("DEBUGGING SUPABASE FILE LISTING")
print("=" * 60)

try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("\n1. Client created successfully")
    
    print(f"\n2. Listing files from bucket: {BUCKET_NAME}")
    response = supabase.storage.from_(BUCKET_NAME).list()
    
    print(f"\n3. Response received")
    print(f"   Type: {type(response)}")
    print(f"   Is list: {isinstance(response, list)}")
    print(f"   Length: {len(response) if response else 0}")
    
    if response:
        print(f"\n4. Iterating through response:")
        for i, item in enumerate(response):
            print(f"\n   --- Item {i+1} ---")
            print(f"   Type: {type(item)}")
            
            # Try different ways to access data
            if hasattr(item, 'name'):
                print(f"   item.name = {item.name}")
            if hasattr(item, 'id'):
                print(f"   item.id = {item.id}")
            if hasattr(item, 'metadata'):
                print(f"   item.metadata = {item.metadata}")
            if hasattr(item, '__dict__'):
                print(f"   item.__dict__ = {item.__dict__}")
            if isinstance(item, dict):
                print(f"   item (dict) = {item}")
                
    else:
        print("\n4. Response is empty or None")
        
    # Also try to get bucket info
    print(f"\n5. Getting bucket info...")
    buckets = supabase.storage.list_buckets()
    print(f"   Available buckets:")
    for bucket in buckets:
        print(f"   - {bucket.name} (public: {bucket.public})")
        
except Exception as e:
    print(f"\nERROR: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
