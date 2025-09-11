import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { highlightsAPI, pdfAPI } from '../services/api';
import { SketchPicker } from 'react-color';

// MUI Components & Icons
import { Box, CircularProgress, Typography, Alert, Paper, IconButton, Tooltip, Popover, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ColorLensIcon from '@mui/icons-material/ColorLens';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DEFAULT_HIGHLIGHT_COLORS = ['rgba(255, 255, 0, 0.4)', 'rgba(173, 216, 230, 0.4)', 'rgba(144, 238, 144, 0.4)', 'rgba(255, 182, 193, 0.4)'];

const PDFViewer = () => {
    const { uuid } = useParams();
    const navigate = useNavigate();

    // State for PDF rendering
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.5);
    const [pdfFileUrl, setPdfFileUrl] = useState(null);
    const viewerRef = useRef(null);

    // State for data and UI
    const [highlights, setHighlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for highlighting functionality
    const [selectedColor, setSelectedColor] = useState(DEFAULT_HIGHLIGHT_COLORS[0]);
    const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
    
    // State for deleting highlights
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [highlightToDelete, setHighlightToDelete] = useState(null);

    useEffect(() => {
        // This is the main data fetching logic.
        const fetchAllData = async () => {
            if (!uuid) return; // Don't run if the uuid isn't available yet

            try {
                setLoading(true);
                
                // 1. Fetch the PDF details from the backend.
                const pdfResponse = await pdfAPI.get(`/${uuid}`);

                // 2. THE FIX: Your backend sends data in the format { success: true, pdf: {...} }.
                //    We must access `pdfResponse.data.pdf` to get the actual PDF object.
                const pdfData = pdfResponse.data.pdf;

                // 3. Check if pdfData exists before trying to use it.
                if (pdfData && pdfData.filename) {
                    setPdfFileUrl(`${process.env.REACT_APP_API_BASE_URL}/uploads/${pdfData.filename}`);
                } else {
                    throw new Error("PDF data is invalid or missing.");
                }

                // 4. Fetch the highlights for this PDF.
                const highlightsResponse = await highlightsAPI.get(`/${uuid}`);
                setHighlights(highlightsResponse.data.highlights || []);

            } catch (err) {
                console.error("Error fetching data:", err);
                setError('Could not load the requested PDF and its highlights.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchAllData();
    }, [uuid]);

    const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

    // --- Highlighting Logic ---

    const handleTextSelection = async (e) => {
        if (e.target.dataset.highlightId) return; // Prevent new highlight on top of old

        const selection = window.getSelection();
        if (!selection.rangeCount || selection.isCollapsed) return;
        const text = selection.toString().trim();
        if (!text) return;

        const viewerRect = viewerRef.current.getBoundingClientRect();
        const range = selection.getRangeAt(0);
        const rangeRect = range.getBoundingClientRect();
        
        const position = {
            x1: rangeRect.left - viewerRect.left, y1: rangeRect.top - viewerRect.top,
            x2: rangeRect.right - viewerRect.left, y2: rangeRect.bottom - viewerRect.top,
            width: viewerRect.width, height: viewerRect.height,
        };
        const newHighlight = { pdfUuid: uuid, text, position, pageNumber, color: selectedColor, intensity: 1 };
        try {
            const response = await highlightsAPI.post('/', newHighlight);
            setHighlights(prev => [...prev, response.data.highlight]);
        } catch (err) { setError('Failed to save highlight.'); }
        
        selection.removeAllRanges();
    };

    const handleHighlightClick = async (highlightId) => {
        try {
            const response = await highlightsAPI.put(`/${highlightId}/intensity`);
            const updatedHighlight = response.data.highlight;
            setHighlights(prev => prev.map(h => h._id === highlightId ? updatedHighlight : h));
        } catch (err) { setError('Failed to update highlight intensity.'); }
    };

    const handleHighlightRightClick = (e, highlightId) => {
        e.preventDefault();
        setHighlightToDelete(highlightId);
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteHighlight = async () => {
        if (!highlightToDelete) return;
        try {
            await highlightsAPI.delete(`/${highlightToDelete}`);
            setHighlights(prev => prev.filter(h => h._id !== highlightToDelete));
        } catch (err) { setError('Failed to delete highlight.'); }
        
        handleCloseDeleteConfirm();
    };

    const handleCloseDeleteConfirm = () => {
        setDeleteConfirmOpen(false);
        setHighlightToDelete(null);
    };

    const getDynamicHighlightColor = (colorStr, intensity = 1) => {
        if (!colorStr) return 'rgba(255, 255, 0, 0.4)';
        const baseOpacity = 0.4;
        const finalOpacity = Math.min(baseOpacity * intensity, 1.0);
        return colorStr.replace(/, \d\.\d+\)/, `, ${finalOpacity})`);
    };

    const renderHighlights = () => highlights
        .filter(h => h.pageNumber === pageNumber)
        .map(h => (
            <div
                key={h._id}
                data-highlight-id={h._id}
                title={h.text}
                onClick={() => handleHighlightClick(h._id)}
                onContextMenu={(e) => handleHighlightRightClick(e, h._id)}
                style={{
                    position: 'absolute', cursor: 'pointer', zIndex: 10,
                    left: `${(h.position.x1 / h.position.width) * 100}%`,
                    top: `${(h.position.y1 / h.position.height) * 100}%`,
                    width: `${((h.position.x2 - h.position.x1) / h.position.width) * 100}%`,
                    height: `${((h.position.y2 - h.position.y1) / h.position.height) * 100}%`,
                    background: getDynamicHighlightColor(h.color, h.intensity),
                }}
            />
        ));

    // --- UI Handlers ---
    const handleColorPickerClick = (e) => setColorPickerAnchor(e.currentTarget);
    const handleColorPickerClose = () => setColorPickerAnchor(null);
    const handleColorChange = (color) => setSelectedColor(`rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, 0.4)`);
    
    // --- Render Logic ---
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
    
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Toolbar */}
            <Paper elevation={3} sx={{ position: 'sticky', top: 10, zIndex: 100, p: 1, mb: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                <Tooltip title="Back"><IconButton onClick={() => navigate('/dashboard')}><ArrowBackIcon /></IconButton></Tooltip>
                <Tooltip title="Prev Page"><span><IconButton onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1}><NavigateBeforeIcon /></IconButton></span></Tooltip>
                <Typography>Page {pageNumber} / {numPages}</Typography>
                <Tooltip title="Next Page"><span><IconButton onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages}><NavigateNextIcon /></IconButton></span></Tooltip>
                <Tooltip title="Zoom Out"><span><IconButton onClick={() => setScale(s => Math.max(0.5, s - 0.2))} disabled={scale <= 0.5}><ZoomOutIcon /></IconButton></span></Tooltip>
                <Typography>{Math.round(scale * 100)}%</Typography>
                <Tooltip title="Zoom In"><span><IconButton onClick={() => setScale(s => Math.min(3, s + 0.2))} disabled={scale >= 3}><ZoomInIcon /></IconButton></span></Tooltip>
                
                <Box sx={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid #ccc', ml: 1, pl: 1 }}>
                    {DEFAULT_HIGHLIGHT_COLORS.map(color => (<Tooltip title="Set color" key={color}><IconButton onClick={() => setSelectedColor(color)}><Box sx={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: color, border: selectedColor === color ? '2px solid #1976d2' : '1px solid #ccc' }}/></IconButton></Tooltip>))}
                    <Tooltip title="More Colors"><IconButton onClick={handleColorPickerClick}><ColorLensIcon /></IconButton></Tooltip>
                </Box>
            </Paper>

            <Popover open={Boolean(colorPickerAnchor)} anchorEl={colorPickerAnchor} onClose={handleColorPickerClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}><SketchPicker color={selectedColor} onChangeComplete={handleColorChange} /></Popover>
    
            <div ref={viewerRef} onMouseUp={handleTextSelection} style={{ position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                {pdfFileUrl ? (
                    <Document file={pdfFileUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadError={() => setError('Failed to load PDF.')}>
                        <Page pageNumber={pageNumber} scale={scale} />
                    </Document>
                ) : <CircularProgress />}
                {renderHighlights()}
            </div>

            <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}><DialogTitle>Delete Highlight?</DialogTitle><DialogContent><DialogContentText>Are you sure you want to delete this highlight?</DialogContentText></DialogContent><DialogActions><Button onClick={handleCloseDeleteConfirm}>Cancel</Button><Button onClick={confirmDeleteHighlight} color="error">Delete</Button></DialogActions></Dialog>
        </Box>
    );
};

export default PDFViewer;