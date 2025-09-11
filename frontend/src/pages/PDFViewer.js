import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pdfAPI } from '../services/api';
import { useHighlights } from '../hooks/useHighlights';
import PDFViewerComponent from '../components/PDFViewerComponent';

const PDFViewer = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [selectedColor, setSelectedColor] = useState('#ffeb3b');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { highlights, addHighlight, updateHighlight, deleteHighlight } = useHighlights(uuid);

  useEffect(() => {
    fetchPDF();
  }, [uuid]);

  const fetchPDF = async () => {
    try {
      setLoading(true);
      const response = await pdfAPI.get(`/${uuid}`);
      setPdf(response.data.pdf);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load PDF');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleTextSelect = async (text, position, pageNumber) => {
    const result = await addHighlight({
      pageNumber,
      text,
      position,
      color: selectedColor
    });

    if (!result.success) {
      setError(result.message);
    }
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const colorOptions = [
    '#ffeb3b', // Yellow
    '#ff9800', // Orange
    '#f44336', // Red
    '#4caf50', // Green
    '#2196f3', // Blue
    '#9c27b0'  // Purple
  ];

  if (loading) {
    return (
      <div className="pdf-viewer">
        <div className="container">
          <div className="loading">Loading PDF...</div>
        </div>
      </div>
    );
  }

  if (!pdf) {
    return (
      <div className="pdf-viewer">
        <div className="container">
          <div className="error">PDF not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      <div className="container">
        <div className="viewer-controls">
          <h2>{pdf.originalName}</h2>
          
          <div className="viewer-actions">
            <button onClick={() => navigate('/')} className="btn">
              Back to Library
            </button>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="highlight-toolbar">
          <span>Highlight Color:</span>
          <div className="color-picker">
            {colorOptions.map(color => (
              <div
                key={color}
                className={`color-option ${selectedColor === color ? 'active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
        </div>

        <div className="page-controls">
          <button 
            onClick={goToPreviousPage} 
            disabled={currentPage <= 1}
            className="btn"
          >
            Previous
          </button>
          
          <span>Page {currentPage}</span>
          
          <button 
            onClick={goToNextPage}
            className="btn"
          >
            Next
          </button>
        </div>

        <div className="zoom-controls">
          <button onClick={zoomOut} className="btn">Zoom Out</button>
          <span>Scale: {(scale * 100).toFixed(0)}%</span>
          <button onClick={zoomIn} className="btn">Zoom In</button>
        </div>

        <PDFViewerComponent
          file={`${process.env.REACT_APP_API_BASE_URL}/uploads/${pdf.filename}`}
          highlights={highlights}
          onTextSelect={handleTextSelect}
          currentPage={currentPage}
          scale={scale}
        />
      </div>
    </div>
  );
};

export default PDFViewer;