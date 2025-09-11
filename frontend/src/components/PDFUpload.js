import React, { useState } from 'react';
import { pdfAPI } from '../services/api';

const PDFUpload = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a PDF file');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await pdfAPI.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      onUpload(response.data.pdf);
      setFile(null);
      e.target.reset();
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h3>Upload PDF</h3>
      <form onSubmit={handleUpload}>
        <div className="form-group">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
        
        {error && <div className="error">{error}</div>}
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={uploading || !file}
        >
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </form>
    </div>
  );
};

export default PDFUpload;