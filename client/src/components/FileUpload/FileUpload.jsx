import { useRef, useState } from "react";
import "./FileUpload.css";

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const toastRef = useRef(null);
  const controller = useRef(null);
  const fileInputRef = useRef(null); // Reference for the file input element

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setProgress(0); // Reset progress on new file selection
    setStatus("");
  };

  const handleFileUpload = () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const chunkSize = 5 * 1024 * 1024; // 5MB
    const totalChunks = Math.ceil(selectedFile.size / chunkSize);
    console.log(`Total Chunks: ${totalChunks}`);
    let chunkNumber = 0;
    let start = 0;
    let end = chunkSize;

    controller.current = new AbortController();
    const signal = controller.current.signal;

    const uploadNextChunk = async () => {
      if (start < selectedFile.size) {
        end = Math.min(start + chunkSize, selectedFile.size);
        const chunk = selectedFile.slice(start, end);
        console.log(
          `Uploading chunk ${chunkNumber + 1}: size ${chunk.size} bytes`
        );
        const formData = new FormData();
        formData.append("file", chunk);
        formData.append("chunkNumber", chunkNumber);
        formData.append("totalChunks", totalChunks);
        formData.append("originalname", selectedFile.name);

        try {
          const response = await fetch("http://localhost:5000/api/upload", {
            method: "POST",
            body: formData,
            signal: signal,
          });
          const data = await response.json();
          console.log(data);
          const temp = `Chunk ${
            chunkNumber + 1
          }/${totalChunks} uploaded successfully`;
          setStatus(temp);
          setProgress(((chunkNumber + 1) / totalChunks) * 100);
          chunkNumber++;
          start = end;
          uploadNextChunk();
        } catch (error) {
          if (error.name === "AbortError") {
            setStatus("File upload canceled");
            setProgress(0);
          } else {
            console.error("Error uploading chunk:", error);
          }
        }
      } else {
        setSelectedFile(null);
        setStatus("File upload completed");
        setProgress(100);
        setUploading(false);
        showToast("File upload completed");
      }
    };

    setUploading(true);
    uploadNextChunk();
  };

  const handleCancelUpload = async () => {
    if (controller.current) {
      controller.current.abort();
    }

    if (selectedFile) {
      const response = await fetch("http://localhost:5000/api/delete_chunks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName: selectedFile.name }),
      });

      if (response.ok) {
        console.log("Chunks deleted successfully");
        setStatus("Upload canceled and chunks deleted");
        setProgress(0);
        setSelectedFile(null);
        showToast("Upload canceled");
      } else {
        console.error("Failed to delete chunks");
      }
    }
  };

  const handleRemoveFile = () => {
    if (window.confirm("Are you sure you want to remove the selected file?")) {
      setSelectedFile(null);
      setStatus("");
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear the file input value
      }
    }
  };

  const showToast = (message) => {
    toastRef.current.innerText = message;
    toastRef.current.classList.add("show");
    setTimeout(() => {
      toastRef.current.classList.remove("show");
    }, 3000);
  };

  return (
    <div className="file-upload-container">
      <h2>Upload Files</h2>
      <input
        type="file"
        onChange={handleFileChange}
        ref={fileInputRef} // Attach the ref to the input
      />
      <div className="button-group">
        {selectedFile && !uploading && (
          <button className="remove-file-button" onClick={handleRemoveFile}>
            Remove File
          </button>
        )}
        <button
          className="upload-button"
          onClick={handleFileUpload}
          disabled={uploading || !selectedFile}
        >
          Upload File
        </button>
        {uploading && (
          <button onClick={handleCancelUpload} className="cancel-button">
            Cancel Upload
          </button>
        )}
      </div>
      {progress ? (
        <div className="progress-bar-wrapper">
          <div className="progress-bar-container">
            <div
              className={`progress-bar ${progress === 100 ? "complete" : ""}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-percentage">{progress.toFixed(2)}%</span>
        </div>
      ) : null}
      <h3>{status}</h3>
      <div ref={toastRef} className="toast"></div>
    </div>
  );
};

export default FileUpload;
