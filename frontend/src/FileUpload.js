import React, { useState } from "react";
import axios from "axios";

function FileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [downloadLink, setDownloadLink] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", selectedFile);
  
    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob", // important for downloading file as blob
      });
  
      // Generate a URL for the zip file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadLink(url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("File upload failed!");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Upload an XLSX File</h2>
      <input type="file" accept=".xlsx" onChange={handleFileChange} />
      <button onClick={handleUpload} style={styles.uploadButton}>
        Upload
      </button>

      {downloadLink && (
        <div style={styles.downloadSection}>
          <h3>Download the ZIP file:</h3>
          <a href={downloadLink} download="files.zip">
            Click to download ZIP
          </a>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  uploadButton: {
    margin: "10px",
    padding: "8px 12px",
    background: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  downloadSection: {
    marginTop: "20px",
  },
};

export default FileUpload;