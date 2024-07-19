import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHUNK_DIR = os.path.join(BASE_DIR, "chunks")
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

os.makedirs(CHUNK_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)
