from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import RedirectResponse, FileResponse
import os
try:
    from supabase import create_client, Client
except ImportError:
    # Handle environment where supabase is not installed (e.g. Python 3.14 compatibility)
    print("WARNING: supabase package not found. Cloud storage features will be disabled.")
    create_client = None
    class Client: pass
from dotenv import load_dotenv
import time
from io import BytesIO
from PIL import Image, ImageStat

load_dotenv()

router = APIRouter()

# Supabase Configuration
# Default to the provided Supabase project URL if not set in environment
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ukjofmkyobtdrzovwfcg.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = os.getenv("SUPABASE_BUCKET", "ak")

# Initialize Supabase Client (optional)
supabase: Client = None

# Local fallback storage directory (used when Supabase not configured)
# Use the main `storage` folder so files placed in the project are visible in the app.
LOCAL_STORAGE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "storage"))
os.makedirs(LOCAL_STORAGE_DIR, exist_ok=True)

def get_supabase():
    global supabase
    # If URL looks invalid or placeholder, skip Supabase and use local fallback
    if not SUPABASE_URL or "your_supabase_url" in (SUPABASE_URL or ""):
        return None

    # If key is not provided, log and fallback to local storage
    if not SUPABASE_KEY:
        print("Supabase key (SUPABASE_KEY) not set; using local storage fallback")
        return None

    if not supabase:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    return supabase

@router.get("/files", response_model=list)
async def list_files():
    """
    List files from Supabase cloud storage ONLY.
    Local files are handled by File Explorer app.
    """
    debug_log = []
    def log(msg):
        print(msg)
        debug_log.append(f"{time.strftime('%H:%M:%S')} - {msg}")
        try:
            with open("storage_debug.log", "a") as f:
                f.write(f"{time.strftime('%H:%M:%S')} - {msg}\n")
        except:
            pass

    try:
        log("--- list_files called ---")
        client = get_supabase()
        
        if not client:
            log("State: Supabase client not configured")
            return []
        
        # Get cloud files from Supabase
        try:
            # Try listing with empty path (root of bucket)
            log(f"Action: Listing files from bucket: {BUCKET_NAME}")
            response = client.storage.from_(BUCKET_NAME).list(path="")
            
            log(f"Response Type: {type(response)}")
            log(f"Response Length: {len(response) if response else 0}")
            
            # Check if response is valid
            if not response:
                log("Result: No files found in Supabase bucket (empty response)")
                return []
            
            cloud_files = []
            
            for idx, file in enumerate(response):
                try:
                    # Parse dictionary directly since validation confirmed dict type
                    file_name = None
                    if isinstance(file, dict):
                        file_name = file.get('name')
                    elif hasattr(file, 'name'):
                        file_name = file.name
                    
                    if not file_name or file_name == '.emptyFolderPlaceholder':
                        continue
                        
                    log(f"Item {idx}: Found file '{file_name}'")
                    
                    # Get metadata safely
                    size = 0
                    updated_at = None
                    
                    if isinstance(file, dict):
                        meta = file.get('metadata', {})
                        if isinstance(meta, dict):
                            size = meta.get('size', 0)
                        updated_at = file.get('updated_at')
                    else:
                        # Fallback for objects
                        if hasattr(file, 'metadata'):
                            meta = file.metadata
                            if isinstance(meta, dict):
                                size = meta.get('size', 0)
                            elif hasattr(meta, 'size'):
                                size = meta.size
                        updated_at = getattr(file, 'updated_at', None)
                    
                    cloud_item = {
                        'name': file_name,
                        'size': int(size) if size else 0,
                        'modified': updated_at,
                        'type': 'file' if '.' in file_name else 'directory',
                        'source': 'cloud'
                    }
                    cloud_files.append(cloud_item)
                except Exception as inner_e:
                    log(f"Error parsing item {idx}: {inner_e}")
            
            log(f"Total processed files: {len(cloud_files)}")
            return cloud_files
            
        except Exception as e:
            log(f"Supabase Inner Storage Error: {e}")
            import traceback
            log(traceback.format_exc())
            return []
            
    except Exception as e:
        log(f"Outer Storage Error: {e}")
        return []

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        client = get_supabase()
        file_content = await file.read()

        # If uploaded file is an image, try to auto-crop black borders (top/bottom/left/right)
        try:
            if file.content_type and file.content_type.startswith('image/'):
                def remove_black_bars(image_bytes):
                    try:
                        img = Image.open(BytesIO(image_bytes)).convert('RGB')
                    except Exception:
                        return image_bytes

                    w, h = img.size
                    gray = img.convert('L')

                    # compute per-row brightness
                    row_means = []
                    for y in range(h):
                        row = gray.crop((0, y, w, y + 1))
                        row_means.append(ImageStat.Stat(row).mean[0])

                    # compute per-column brightness
                    col_means = []
                    for x in range(w):
                        col = gray.crop((x, 0, x + 1, h))
                        col_means.append(ImageStat.Stat(col).mean[0])

                    median_row = sorted(row_means)[len(row_means) // 2] if row_means else 0
                    median_col = sorted(col_means)[len(col_means) // 2] if col_means else 0

                    # thresholds relative to median to allow dark images with slightly darker borders
                    row_thresh = median_row * 0.5
                    col_thresh = median_col * 0.5

                    top = 0
                    while top < h and row_means[top] < row_thresh:
                        top += 1
                    bottom = h
                    while bottom > 0 and row_means[bottom - 1] < row_thresh:
                        bottom -= 1

                    left = 0
                    while left < w and col_means[left] < col_thresh:
                        left += 1
                    right = w
                    while right > 0 and col_means[right - 1] < col_thresh:
                        right -= 1

                    # Ensure we don't crop away the whole image and require at least 4px margin
                    if left < right - 4 and top < bottom - 4:
                        # Only crop when there is a meaningful border to remove
                        if top > 0 or bottom < h or left > 0 or right < w:
                            cropped = img.crop((left, top, right, bottom))
                            out = BytesIO()
                            fmt = img.format if img.format else ('PNG' if file.content_type == 'image/png' else 'JPEG')
                            cropped.save(out, format=fmt)
                            return out.getvalue()
                    return image_bytes

                file_content = remove_black_bars(file_content)
        except Exception:
            # if processing fails, continue with original bytes
            pass

        if client:
            # Upload to Supabase cloud storage ONLY
            client.storage.from_(BUCKET_NAME).upload(
                path=file.filename,
                file=file_content,
                file_options={"content-type": file.content_type, "upsert": "true"}
            )
            return {"filename": file.filename, "status": "uploaded_to_cloud"}
        else:
            # If Supabase is not configured, return error
            raise HTTPException(
                status_code=503, 
                detail="Cloud storage not configured. Please set up Supabase credentials."
            )
    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/files/{filename}")
async def delete_file(filename: str):
    """
    Delete file from Supabase cloud storage ONLY.
    """
    try:
        client = get_supabase()
        
        if not client:
            raise HTTPException(
                status_code=503,
                detail="Cloud storage not configured"
            )
        
        try:
            client.storage.from_(BUCKET_NAME).remove([filename])
            return {"status": "deleted_from_cloud", "filename": filename}
        except Exception as e:
            print(f"Delete error: {e}")
            raise HTTPException(status_code=404, detail=f"File not found in cloud storage: {filename}")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/{filename}")
async def download_file(filename: str):
    try:
        client = get_supabase()
        if client:
            try:
                # Create a signed URL valid for 60 seconds
                response = client.storage.from_(BUCKET_NAME).create_signed_url(filename, 60)
                return RedirectResponse(url=response['signedURL'])
            except Exception:
                # fallback to local
                pass

        # Local fallback: serve file directly
        fpath = os.path.join(LOCAL_STORAGE_DIR, filename)
        if os.path.exists(fpath):
            return FileResponse(fpath, filename=filename)
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=404, detail="File not found or error generating link")
