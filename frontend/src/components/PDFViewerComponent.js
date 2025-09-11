import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewerComponent = ({ 
  file, 
  highlights, 
  onTextSelect, 
  currentPage,
  scale 
}) => {
  const [numPages, setNumPages] = useState(null);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
  }, []);

  const handleTextSelection = useCallback((event) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const pageElement = event.target.closest('.react-pdf__Page');
      
      if (pageElement) {
        const pageRect = pageElement.getBoundingClientRect();
        const position = {
          x: (rect.left - pageRect.left) / scale,
          y: (rect.top - pageRect.top) / scale,
          width: rect.width / scale,
          height: rect.height / scale
        };
        
        onTextSelect(selectedText, position, currentPage);
      }
    }
    
    selection.removeAllRanges();
  }, [currentPage, scale, onTextSelect]);

  const renderHighlight = (highlight, index) => {
    if (highlight.pageNumber !== currentPage) return null;

    return (
      <div
        key={index}
        style={{
          position: 'absolute',
          left: `${highlight.position.x}px`,
          top: `${highlight.position.y}px`,
          width: `${highlight.position.width}px`,
          height: `${highlight.position.height}px`,
          backgroundColor: highlight.color || '#ffeb3b',
          opacity: 0.3,
          pointerEvents: 'none',
          zIndex: 1
        }}
        title={highlight.text}
      />
    );
  };

  return (
    <div className="pdf-container">
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<div className="loading">Loading PDF...</div>}
      >
        <div onMouseUp={handleTextSelection} style={{ position: 'relative' }}>
          <Page
            pageNumber={currentPage}
            scale={scale}
            loading={<div className="loading">Loading page...</div>}
          />
          {highlights.map(renderHighlight)}
        </div>
      </Document>
      
      {numPages && (
        <div className="text-center mt-20">
          Page {currentPage} of {numPages}
        </div>
      )}
    </div>
  );
};

export default PDFViewerComponent;