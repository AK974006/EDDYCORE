import os
from dotenv import load_dotenv
from supabase import create_client
import json

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

response = supabase.storage.from_("ak").list(path="")

print(f"Total items: {len(response)}")
print("\n")

for i, item in enumerate(response):
    print(f"=== ITEM {i+1} ===")
    print(f"Type: {type(item)}")
    print(f"Dir: {dir(item)}")
    print(f"Repr: {repr(item)}")
    if hasattr(item, '__dict__'):
        print(f"Dict: {item.__dict__}")
    print("\n")
