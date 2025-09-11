import React from 'react';
import { Link } from 'react-router-dom';
import { formatFileSize, formatDate } from '../utils/helpers';

const PDFList = ({ pdfs, onDelete, onRename }) => {
  const [renamingId, setRenamingId] = React.useState(null);
  const [newName, setNewName] = React.useState('');

  const handleRenameStart = (pdf) => {
    setRenamingId(pdf._id);
    setNewName(pdf.originalName);
  };

  const handleRenameSubmit = async (pdfId) => {
    try {
      await onRename(pdfId, newName);
      setRenamingId(null);
      setNewName('');
    } catch (error) {
      console.error('Rename failed:', error);
    }
  };

  const handleRenameCancel = () => {
    setRenamingId(null);
    setNewName('');
  };

  if (pdfs.length === 0) {
    return (
      <div className="card text-center">
        <p>No PDFs uploaded yet. Upload your first PDF to get started!</p>
      </div>
    );
  }

  return (
    <div className="pdf-grid">
      {pdfs.map((pdf) => (
        <div key={pdf._id} className="pdf-card">
          {renamingId === pdf._id ? (
            <div>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="form-control"
                autoFocus
              />
              <div className="pdf-actions">
                <button
                  onClick={() => handleRenameSubmit(pdf._id)}
                  className="btn btn-success"
                >
                  Save
                </button>
                <button
                  onClick={handleRenameCancel}
                  className="btn btn-danger"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3>{pdf.originalName}</h3>
              <p>Size: {formatFileSize(pdf.size)}</p>
              <p>Uploaded: {formatDate(pdf.createdAt)}</p>
              <div className="pdf-actions">
                <Link
                  to={`/pdf/${pdf.uuid}`}
                  className="btn btn-primary"
                >
                  View & Annotate
                </Link>
                <button
                  onClick={() => onDelete(pdf.uuid)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleRenameStart(pdf)}
                  className="btn"
                >
                  Rename
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default PDFList;