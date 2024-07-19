import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHUNK_DIR = os.path.join(BASE_DIR, "..", "chunks")
UPLOAD_DIR = os.path.join(BASE_DIR, "..", "uploads")

os.makedirs(CHUNK_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_chunk(chunk, file_name, chunk_number):
    chunk_file_path = os.path.join(CHUNK_DIR, f"{file_name}.part_{chunk_number}")

    with open(chunk_file_path, "wb") as f:
        f.write(chunk)


def merge_chunks(file_name, total_chunks):
    merged_file_path = os.path.join(UPLOAD_DIR, file_name)

    with open(merged_file_path, "wb") as merged_file:
        for i in range(total_chunks):
            chunk_file_path = os.path.join(CHUNK_DIR, f"{file_name}.part_{i}")
            with open(chunk_file_path, "rb") as chunk_file:
                merged_file.write(chunk_file.read())
            os.remove(chunk_file_path)

    merged_file_size = os.path.getsize(merged_file_path)
    print("Chunks merged successfully")
    print(f"Final file size: {merged_file_size} bytes")


def delete_chunks(file_name):
    for chunk_file in os.listdir(CHUNK_DIR):
        if chunk_file.startswith(file_name):
            os.remove(os.path.join(CHUNK_DIR, chunk_file))
    print("Chunks deleted successfully")
