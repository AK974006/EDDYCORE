import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = "ak"

print("Testing Supabase - Checking for files")

try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Try listing with path=""
    print("\n1. Listing root (path=''):")
    response1 = supabase.storage.from_(BUCKET_NAME).list(path="")
    print(f"   Found {len(response1) if response1 else 0} items")
    if response1:
        for item in response1:
            name = getattr(item, 'name', 'NO NAME')
            print(f"   - {name}")
    
    # Try listing without path parameter
    print("\n2. Listing without path parameter:")
    response2 = supabase.storage.from_(BUCKET_NAME).list()
    print(f"   Found {len(response2) if response2 else 0} items")
    if response2:
        for item in response2:
            name = getattr(item, 'name', 'NO NAME')
            print(f"   - {name}")
    
    # Check if they uploaded to a folder
    print("\n3. Checking common folder names:")
    for folder in ['uploads', 'files', 'documents', 'images']:
        try:
            response3 = supabase.storage.from_(BUCKET_NAME).list(path=folder)
            if response3:
                print(f"   Folder '{folder}': {len(response3)} items")
                for item in response3:
                    name = getattr(item, 'name', 'NO NAME')
                    print(f"     - {name}")
        except:
            pass
            
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
