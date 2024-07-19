from flask import Blueprint, jsonify, request
from utils.file_utils import delete_chunks, merge_chunks, save_chunk

upload_bp = Blueprint("upload_bp", __name__)


@upload_bp.route("/api/upload", methods=["POST"])
def upload_large_file():
    chunk = request.files["file"].read()
    chunk_number = int(request.form["chunkNumber"])
    total_chunks = int(request.form["totalChunks"])
    file_name = request.form["originalname"]

    save_chunk(chunk, file_name, chunk_number)

    if chunk_number == total_chunks - 1:
        merge_chunks(file_name, total_chunks)

    return jsonify({"message": "Chunk uploaded successfully"}), 200


# ************************* DELETE CHUNKS ****************************************


@upload_bp.route("/api/delete_chunks", methods=["POST"])
def delete_chunks_route():
    data = request.get_json()
    file_name = data["fileName"]
    delete_chunks(file_name)
    return jsonify({"message": "Chunks deleted successfully"}), 200
