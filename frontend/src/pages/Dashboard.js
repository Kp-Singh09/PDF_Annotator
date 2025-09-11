import React, { useState, useEffect } from 'react';
import { pdfAPI } from '../services/api';
import PDFUpload from '../components/PDFUpload';
import PDFList from '../components/PDFList';

const Dashboard = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPDFs();
  }, []);

  const fetchPDFs = async () => {
    try {
      setLoading(true);
      const response = await pdfAPI.get('/my-pdfs');
      setPdfs(response.data.pdfs);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load PDFs');
    } finally {
      setLoading(false);
    }
  };

  const handlePDFUpload = (newPDF) => {
    setPdfs(prev => [newPDF, ...prev]);
  };

  const handlePDFDelete = async (pdfUuid) => {
    if (!window.confirm('Are you sure you want to delete this PDF?')) {
      return;
    }

    try {
      await pdfAPI.delete(`/${pdfUuid}`);
      setPdfs(prev => prev.filter(pdf => pdf.uuid !== pdfUuid));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete PDF');
    }
  };

  const handlePDFRename = async (pdfId, newName) => {
    try {
      const response = await pdfAPI.put(`/${pdfs.find(p => p._id === pdfId).uuid}/rename`, {
        originalName: newName
      });
      
      setPdfs(prev => 
        prev.map(pdf => pdf._id === pdfId ? response.data.pdf : pdf)
      );
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to rename PDF');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="loading">Loading your PDFs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <h1>My PDF Library</h1>
        
        {error && <div className="error">{error}</div>}
        
        <div className="upload-section">
          <PDFUpload onUpload={handlePDFUpload} />
        </div>
        
        <PDFList 
          pdfs={pdfs} 
          onDelete={handlePDFDelete}
          onRename={handlePDFRename}
        />
      </div>
    </div>
  );
};

export default Dashboard;