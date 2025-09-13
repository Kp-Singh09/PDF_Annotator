import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { highlightsAPI, pdfAPI, drawingsAPI } from '../services/api';
import { SketchPicker } from 'react-color';

import {
    Box, CircularProgress, Typography, Alert, Paper, IconButton, Tooltip, Popover,
    Stack, Divider, TextField, Button, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import BrushIcon from '@mui/icons-material/Brush';
import AutoFixNormalIcon from '@mui/icons-material/AutoFixNormal';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PanToolIcon from '@mui/icons-material/PanTool';
import EditIcon from '@mui/icons-material/Edit';


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ERASER_CURSOR_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJibGFjayI+PHBhdGggZD0iTTE4LjM3IDIuMjRMMTUuNDIgNS4yMWwtMy41NC0zLjU0Yy0uMzktLjM5LTEuMDItLjM5LTEuNDEgMGwtMi44MyAyLjgzYy0uMzkuMzktLjM5IDEuMDIgMCAxLjQybDMuNTQgMy41NEw0LjI0IDE2LjgzYy0uNzguNzgtLjc4IDIuMDQgMCAyLjgybDQuMjQgNC4yNGMuNzguNzggMi4wNC43OCAyLjgyIDBsMTAuMDMtMTAuMDNjLjM5LS4zOS4zOS0xLjAyIDAtMS40MWwtMi44My0yLjgzYy0uMzgtLjM5LTEuMDEtLjM5LTEuNDEgMHptLTIuMTIgNC4yNGwtMS40MS0xLjQxIDUuNjYtNS42NiAxLjQxIDEuNDEtNS42NiA1LjY2em0tMS40MSA2LjM3bDIuODMgMi44My03Ljc4IDcuNzgtMi44My0yLjgyIDcuNzgtNy43OHoiLz48L3N2Zz4=";

const DEFAULT_HIGHLIGHT_COLORS = ['rgba(255, 229, 57, 0.5)', 'rgba(120, 224, 143, 0.5)', 'rgba(255, 107, 107, 0.5)', 'rgba(10, 189, 227, 0.5)'];
const MENU_COLORS = ['rgba(255, 229, 57, 0.5)', 'rgba(120, 224, 143, 0.5)', 'rgba(255, 107, 107, 0.5)', 'rgba(10, 189, 227, 0.5)', 'rgba(155, 89, 182, 0.5)'];

const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};

const PDFViewer = () => {
    const { uuid } = useParams();
    const navigate = useNavigate();

    const [pdf, setPdf] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.5);
    const [pdfFileUrl, setPdfFileUrl] = useState(null);
    const [highlights, setHighlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const viewerRef = useRef(null);
    const [selectedColor, setSelectedColor] = useState(DEFAULT_HIGHLIGHT_COLORS[0]);
    const [colorPickerAnchor, setColorPickerAnchor] = useState(null);
    const [menuState, setMenuState] = useState({ anchorEl: null, highlightId: null });

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(-1);
    const [isSearching, setIsSearching] = useState(false);

    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [currentNote, setCurrentNote] = useState('');
    const [activeHighlightForNote, setActiveHighlightForNote] = useState(null);

    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawings, setDrawings] = useState([]);
    const [currentPath, setCurrentPath] = useState([]);
    const [drawingColor, setDrawingColor] = useState('#ff0000');
    
    const [drawingMode, setDrawingMode] = useState(false);
    const [eraserMode, setEraserMode] = useState(false);
    const [drawingShape, setDrawingShape] = useState('freehand');

    const [startPoint, setStartPoint] = useState(null);
    const [selectedDrawing, setSelectedDrawing] = useState(null);
    const [isMoving, setIsMoving] = useState(false);
    
    const [showDrawingTools, setShowDrawingTools] = useState(false);

    const fetchAnnotations = useCallback(async () => {
        if (!uuid) return;
        try {
            const [highlightsRes, drawingsRes] = await Promise.all([
                highlightsAPI.get(`/${uuid}`),
                drawingsAPI.get(`/${uuid}`)
            ]);
            setHighlights(highlightsRes.data.highlights || []);
            setDrawings(drawingsRes.data.drawings || []);
        } catch (err) {
            setError('Could not load annotations.');
        }
    }, [uuid]);

    useEffect(() => {
        const fetchPdf = async () => {
            if (!uuid) return;
            try {
                setLoading(true);
                const pdfResponse = await pdfAPI.get(`/${uuid}`);
                const pdfData = pdfResponse.data.pdf;
                if (pdfData && pdfData.filename) {
                    setPdfFileUrl(`${process.env.REACT_APP_API_BASE_URL}/uploads/${pdfData.filename}`);
                    await fetchAnnotations();
                } else {
                    throw new Error("PDF data invalid.");
                }
            } catch (err) {
                setError('Could not load PDF.');
            } finally {
                setLoading(false);
            }
        };
        fetchPdf();
    }, [uuid, fetchAnnotations]);

    const onDocumentLoadSuccess = (pdfDoc) => {
        setPdf(pdfDoc);
        setNumPages(pdfDoc.numPages);
    };

    const drawArrow = (ctx, fromX, fromY, toX, toY, scale) => {
        const headlen = 10 * scale;
        const angle = Math.atan2(toY - fromY, toX - fromX);
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    };
    
    const redrawCanvas = useCallback((currentMousePos = null) => {
        const canvas = canvasRef.current;
        if (!canvas || !viewerRef.current) return;
        const ctx = canvas.getContext('2d');
        const { width, height } = viewerRef.current.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        contextRef.current = ctx;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const pageDrawings = drawings.filter(d => d.pageNumber === pageNumber);

        pageDrawings.forEach(drawing => {
            ctx.beginPath();
            ctx.strokeStyle = drawing.color;
            ctx.lineWidth = drawing.lineWidth * scale;

            if (selectedDrawing && selectedDrawing._id === drawing._id) {
                ctx.strokeStyle = '#007bff';
                ctx.setLineDash([5, 5]);
            } else {
                ctx.setLineDash([]);
            }

            switch(drawing.shape) {
                case 'rectangle':
                    ctx.rect(drawing.startX * scale, drawing.startY * scale, (drawing.endX - drawing.startX) * scale, (drawing.endY - drawing.startY) * scale);
                    break;
                case 'circle':
                    const radius = Math.sqrt(Math.pow(drawing.endX - drawing.startX, 2) + Math.pow(drawing.endY - drawing.startY, 2));
                    ctx.arc(drawing.startX * scale, drawing.startY * scale, radius * scale, 0, 2 * Math.PI);
                    break;
                case 'arrow':
                    drawArrow(ctx, drawing.startX * scale, drawing.startY * scale, drawing.endX * scale, drawing.endY * scale, scale);
                    break;
                default:
                    drawing.path.forEach((point, index) => {
                        const x = point.x * scale;
                        const y = point.y * scale;
                        if (index === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    });
                    break;
            }
            ctx.stroke();
        });
        
        ctx.setLineDash([]);

        if (isDrawing && startPoint && currentMousePos && drawingShape !== 'freehand') {
            ctx.beginPath();
            ctx.strokeStyle = drawingColor;
            ctx.lineWidth = 2 * scale;
            const startX = startPoint.x;
            const startY = startPoint.y;
            const endX = currentMousePos.x;
            const endY = currentMousePos.y;

            switch(drawingShape) {
                case 'rectangle':
                    ctx.rect(startX, startY, endX - startX, endY - startY);
                    break;
                case 'circle':
                    const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                    ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
                    break;
                case 'arrow':
                    drawArrow(ctx, startX, startY, endX, endY, 1);
                    break;
                default: break;
            }
            ctx.stroke();
        }

    }, [drawings, pageNumber, scale, isDrawing, startPoint, drawingShape, drawingColor, selectedDrawing]);

    useEffect(() => {
        redrawCanvas();
    }, [redrawCanvas]);

    const isPointInShape = (x, y, drawing) => {
        const { shape, startX, startY, endX, endY, path } = drawing;
        const tolerance = 5 / scale;
    
        switch (shape) {
            case 'rectangle':
                const minX = Math.min(startX, endX);
                const maxX = Math.max(startX, endX);
                const minY = Math.min(startY, endY);
                const maxY = Math.max(startY, endY);
                return x >= minX - tolerance && x <= maxX + tolerance && y >= minY - tolerance && y <= maxY + tolerance;
            case 'circle':
                const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                const dist = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
                return Math.abs(dist - radius) < tolerance;
            case 'arrow':
            case 'freehand':
                const points = shape === 'arrow' ? [{x: startX, y: startY}, {x: endX, y: endY}] : path;
                for (let i = 0; i < points.length - 1; i++) {
                    const p1 = points[i];
                    const p2 = points[i + 1];
                    const dist = distToSegment({x, y}, p1, p2);
                    if (dist < tolerance) return true;
                }
                return false;
            default:
                return false;
        }
    };
    
    const distToSegment = (p, v, w) => {
        const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
        if (l2 === 0) return Math.sqrt((p.x - v.x) ** 2 + (p.y - v.y) ** 2);
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        const projX = v.x + t * (w.x - v.x);
        const projY = v.y + t * (w.y - v.y);
        return Math.sqrt((p.x - projX) ** 2 + (p.y - projY) ** 2);
    };

    const handleMouseDown = (e) => {
        if (!drawingMode || !contextRef.current) return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isMoving) {
            const scaledX = x / scale;
            const scaledY = y / scale;
            const clickedDrawing = drawings.find(d => d.pageNumber === pageNumber && isPointInShape(scaledX, scaledY, d));
            if (clickedDrawing) {
                setSelectedDrawing(clickedDrawing);
                setStartPoint({ x, y, originalDrawing: clickedDrawing });
            } else {
                setSelectedDrawing(null);
            }
            return;
        }

        if (!eraserMode) {
            setIsDrawing(true);
            setStartPoint({ x, y });
            
            if (drawingShape === 'freehand') {
                contextRef.current.beginPath();
                contextRef.current.strokeStyle = drawingColor;
                contextRef.current.lineWidth = 2 * scale;
                contextRef.current.moveTo(x, y);
                setCurrentPath([{ x, y }]);
            }
        }
    };
    
    const handleMouseMove = (e) => {
        if (!isDrawing && !isMoving) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // --- THIS IS THE FIX ---
        if (isMoving && selectedDrawing && startPoint) {
            const dx = (x - startPoint.x) / scale;
            const dy = (y - startPoint.y) / scale;
            const { originalDrawing } = startPoint;

            const movedDrawing = { ...selectedDrawing };
            if (movedDrawing.shape === 'freehand') {
                movedDrawing.path = originalDrawing.path.map(p => ({ x: p.x + dx, y: p.y + dy }));
            } else {
                movedDrawing.startX = originalDrawing.startX + dx;
                movedDrawing.startY = originalDrawing.startY + dy;
                movedDrawing.endX = originalDrawing.endX + dx;
                movedDrawing.endY = originalDrawing.endY + dy;
            }
            setDrawings(drawings.map(d => d._id === movedDrawing._id ? movedDrawing : d));
            return;
        }
        
        if (isDrawing) {
            if (drawingShape === 'freehand') {
                contextRef.current.lineTo(x, y);
                contextRef.current.stroke();
                setCurrentPath(prev => [...prev, { x, y }]);
            } else {
                redrawCanvas({ x, y });
            }
        }
    };
    
    const handleMouseUp = async (e) => {
        if (isMoving && selectedDrawing) {
            setIsMoving(false);
            setStartPoint(null);
            try {
                const { _id, path, startX, startY, endX, endY } = selectedDrawing;
                await drawingsAPI.put(`/${_id}`, { path, startX, startY, endX, endY });
            } catch (err) {
                setError("Failed to move drawing.");
                setDrawings(drawings.map(d => d._id === selectedDrawing._id ? startPoint.originalDrawing : d));
            }
            return;
        }

        if (!isDrawing) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const endX = (e.clientX - rect.left) / scale;
        const endY = (e.clientY - rect.top) / scale;
        const startX = startPoint.x / scale;
        const startY = startPoint.y / scale;

        let drawingData;
        if (drawingShape === 'freehand') {
            if (currentPath.length < 2) {
                setIsDrawing(false);
                setCurrentPath([]);
                return;
            }
            contextRef.current.closePath();
            const scaledPath = currentPath.map(p => ({ x: p.x / scale, y: p.y / scale }));
            drawingData = { shape: 'freehand', path: scaledPath };
        } else {
            drawingData = { shape: drawingShape, startX, startY, endX, endY };
        }
        
        const finalDrawingData = {
            ...drawingData,
            pdfUuid: uuid,
            pageNumber,
            color: drawingColor,
            lineWidth: 2,
        };

        try {
            const response = await drawingsAPI.post('/', finalDrawingData);
            setDrawings(prev => [...prev, response.data.drawing]);
        } catch (err) {
            setError("Failed to save drawing.");
        } finally {
            setIsDrawing(false);
            setCurrentPath([]);
            setStartPoint(null);
            redrawCanvas();
        }
    };
    
    const handleCanvasClick = async (e) => {
        if (!eraserMode) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;
        const clickedDrawing = drawings.find(d => d.pageNumber === pageNumber && isPointInShape(x, y, d));
        if (clickedDrawing) {
            try {
                await drawingsAPI.delete(`/${clickedDrawing._id}`);
                setDrawings(prev => prev.filter(d => d._id !== clickedDrawing._id));
            } catch (err) {
                setError('Failed to delete drawing.');
            }
        }
    };
    
    const handleTextSelection = async () => {
        const selection = window.getSelection();
        if (drawingMode || !selection.rangeCount || selection.isCollapsed || !selection.toString().trim()) {
            return;
        }
        const text = selection.toString().trim();
        const pageElement = viewerRef.current.querySelector(`.react-pdf__Page[data-page-number="${pageNumber}"]`);
        if (!pageElement) return;
        const pageRect = pageElement.getBoundingClientRect();
        const clientRects = Array.from(selection.getRangeAt(0).getClientRects());
        const positions = clientRects.map(rect => ({
            x1: (rect.left - pageRect.left) / scale,
            y1: (rect.top - pageRect.top) / scale,
            width: rect.width / scale,
            height: rect.height / scale,
        }));
        const newHighlight = { pdfUuid: uuid, text, position: positions, pageNumber, color: selectedColor };
        try {
            const response = await highlightsAPI.post('/', newHighlight);
            setHighlights(prev => [...prev, response.data.highlight]);
        } catch (err) {
            setError('Failed to save highlight.');
        } finally {
            selection.removeAllRanges();
        }
    };

    const handleHighlightClick = (e, highlightId) => { e.preventDefault(); e.stopPropagation(); setMenuState({ anchorEl: e.currentTarget, highlightId }); };
    const handleMenuClose = () => { setMenuState({ anchorEl: null, highlightId: null }); };
    const handleMenuColorChange = async (color) => { if (!menuState.highlightId) return; try { setHighlights(prev => prev.map(h => h._id === menuState.highlightId ? { ...h, color } : h)); handleMenuClose(); await highlightsAPI.put(`/${menuState.highlightId}`, { color }); } catch (err) { setError('Failed to update color.'); } };
    const handleMenuDelete = async () => { if (!menuState.highlightId) return; const idToDelete = menuState.highlightId; try { setHighlights(prev => prev.filter(h => h._id !== idToDelete)); handleMenuClose(); await highlightsAPI.delete(`/${idToDelete}`); } catch (err) { setError('Failed to delete highlight.'); } };
    const handleOpenNoteDialog = () => { const activeHighlight = highlights.find(h => h._id === menuState.highlightId); if (activeHighlight) { setActiveHighlightForNote(activeHighlight); setCurrentNote(activeHighlight.note || ''); setNoteDialogOpen(true); } handleMenuClose(); };
    const handleCloseNoteDialog = () => { setNoteDialogOpen(false); setCurrentNote(''); setActiveHighlightForNote(null); };
    const handleSaveNote = async () => { if (!activeHighlightForNote) return; try { setHighlights(prev => prev.map(h => h._id === activeHighlightForNote._id ? { ...h, note: currentNote } : h )); await highlightsAPI.put(`/${activeHighlightForNote._id}`, { note: currentNote }); handleCloseNoteDialog(); } catch (err) { setError('Failed to save note.'); } };
    const handleColorPickerClick = (e) => setColorPickerAnchor(e.currentTarget);
    const handleColorPickerClose = () => setColorPickerAnchor(null);
    const handleColorChange = (color) => setSelectedColor(`rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, 0.5)`);
    
    const handleSearch = async () => {
        if (!searchQuery || !pdf) {
            setSearchResults([]);
            setCurrentResultIndex(-1);
            return;
        }
        setIsSearching(true);
        const results = [];
        const query = searchQuery.toLowerCase();
        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const viewport = page.getViewport({ scale: 1 });
            const pageText = textContent.items.map(item => item.str).join("").toLowerCase();
            let lastIndex = -1;
            while ((lastIndex = pageText.indexOf(query, lastIndex + 1)) !== -1) {
                let charCount = 0;
                let firstItem = null, lastItem = null;
                for (const item of textContent.items) {
                    const itemEndIndex = charCount + item.str.length;
                    if (!firstItem && lastIndex < itemEndIndex) firstItem = item;
                    if (firstItem && lastIndex + query.length - 1 < itemEndIndex) {
                        lastItem = item;
                        break;
                    }
                    charCount = itemEndIndex;
                }
                if (firstItem && lastItem) {
                    const left = firstItem.transform[4];
                    const top_baseline = firstItem.transform[5];
                    const right = lastItem.transform[4] + lastItem.width;
                    const height = firstItem.height;
                    results.push({ page: i, position: { x1: left, y1: viewport.height - top_baseline - height, width: right - left, height: height, } });
                }
            }
        }
        setSearchResults(results);
        if (results.length > 0) {
            setCurrentResultIndex(0);
            setPageNumber(results[0].page);
        } else {
            setCurrentResultIndex(-1);
        }
        setIsSearching(false);
    };
    
    const navigateToResult = (index) => { if (index < 0 || index >= searchResults.length) return; setCurrentResultIndex(index); setPageNumber(searchResults[index].page); };
    const goToPreviousResult = () => navigateToResult(currentResultIndex - 1);
    const goToNextResult = () => navigateToResult(currentResultIndex + 1);
    const handleZoomInputChange = (e) => { const value = e.target.value; if (value === '') { setScale(''); return; } const percentage = parseInt(value, 10); if (!isNaN(percentage) && percentage > 0) setScale(percentage / 100); };
    
    const toggleDrawingTools = () => {
        const newShowState = !showDrawingTools;
        setShowDrawingTools(newShowState);
        if (!newShowState) {
            setDrawingMode(false);
            setEraserMode(false);
            setIsMoving(false);
            setSelectedDrawing(null);
        }
    };

    const setDrawingTool = (shape) => {
        setDrawingMode(true);
        setEraserMode(false);
        setIsMoving(false);
        setDrawingShape(shape);
        setSelectedDrawing(null);
    };

    const setEraserTool = () => {
        setDrawingMode(true);
        setEraserMode(true);
        setIsMoving(false);
        setSelectedDrawing(null);
    };

    const setMoveTool = () => {
        setDrawingMode(true);
        setEraserMode(false);
        setIsMoving(true);
    };
    
    const renderHighlights = () => {
        const pageHighlights = highlights.filter(h => h.pageNumber === pageNumber);
        return pageHighlights.flatMap((highlight) =>
            highlight.position.map((pos, index) => (
                <Tooltip key={`${highlight._id}-${index}`} title={highlight.note || ''} arrow placement="top">
                    <div
                        onClick={(e) => handleHighlightClick(e, highlight._id)}
                        style={{
                            position: 'absolute',
                            left: `${pos.x1 * scale}px`,
                            top: `${pos.y1 * scale}px`,
                            width: `${pos.width * scale}px`,
                            height: `${pos.height * scale}px`,
                            backgroundColor: highlight.color || 'rgba(255, 255, 0, 0.5)',
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            zIndex: 2,
                            border: menuState.highlightId === highlight._id ? '1px dashed #333' : 'none',
                        }}
                    />
                </Tooltip>
            ))
        );
    };

    const renderSearchResults = () => {
        if (!searchResults.length) return null;
        return searchResults.filter(r => r.page === pageNumber).map((result, index) => {
            if (!result.position) return null;
            return (
                <div
                    key={`search-result-${index}`}
                    style={{
                        position: 'absolute',
                        left: `${result.position.x1 * scale}px`,
                        top: `${result.position.y1 * scale}px`,
                        width: `${result.position.width * scale}px`,
                        height: `${result.position.height * scale}px`,
                        backgroundColor: index === currentResultIndex ? 'rgba(255, 165, 0, 0.6)' : 'rgba(255, 255, 0, 0.4)',
                        border: index === currentResultIndex ? '2px solid orange' : '1px solid #ff0',
                        pointerEvents: 'none',
                        zIndex: 10,
                    }}
                />
            );
        });
    };

    if (loading && !pdfFileUrl) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
    
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Paper elevation={3} sx={{ position: 'sticky', top: 10, zIndex: 100, p: 1, mb: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                <Tooltip title="Back to Dashboard"><IconButton onClick={() => navigate('/dashboard')}><ArrowBackIcon /></IconButton></Tooltip>
                <Tooltip title="Previous Page"><span><IconButton onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1}><NavigateBeforeIcon /></IconButton></span></Tooltip>
                <Typography sx={{userSelect: 'none', mx: 1 }}>Page {pageNumber} / {numPages}</Typography>
                <Tooltip title="Next Page"><span><IconButton onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))} disabled={!numPages || pageNumber >= numPages}><NavigateNextIcon /></IconButton></span></Tooltip>
                <Tooltip title="Zoom Out"><span><IconButton onClick={() => setScale(s => Math.max(0.25, s - 0.1))} disabled={scale <= 0.25}><ZoomOutIcon /></IconButton></span></Tooltip>
                <TextField size="small" variant="outlined" value={scale === '' ? '' : Math.round(scale * 100)} onChange={handleZoomInputChange} onBlur={(e) => { if(e.target.value === '') setScale(1); }} inputProps={{ style: { textAlign: 'center', width: '40px' } }} sx={{ mx: 1 }} />
                <Typography>%</Typography>
                <Tooltip title="Zoom In"><span><IconButton onClick={() => setScale(s => Math.min(5, s + 0.1))} disabled={scale >= 5}><ZoomInIcon /></IconButton></span></Tooltip>
                
                <Box sx={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid #ccc', ml: 1, pl: 1 }}>
                    {DEFAULT_HIGHLIGHT_COLORS.map(color => (<Tooltip title="Set highlight color" key={color}><IconButton onClick={() => setSelectedColor(color)}><Box sx={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: color, border: selectedColor === color ? '2px solid #1976d2' : '1px solid #ccc' }} /></IconButton></Tooltip>))}
                    <Tooltip title="More Colors"><IconButton onClick={handleColorPickerClick}><ColorLensIcon /></IconButton></Tooltip>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid #ccc', ml: 1, pl: 1 }}>
                    <TextField size="small" variant="outlined" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} disabled={isSearching} />
                    <Tooltip title="Search"><span><IconButton onClick={handleSearch} disabled={isSearching}><SearchIcon /></IconButton></span></Tooltip>
                    <Tooltip title="Previous"><span><IconButton onClick={goToPreviousResult} disabled={currentResultIndex <= 0}><ArrowUpwardIcon /></IconButton></span></Tooltip>
                    <Tooltip title="Next"><span><IconButton onClick={goToNextResult} disabled={currentResultIndex >= searchResults.length - 1}><ArrowDownwardIcon /></IconButton></span></Tooltip>
                    {searchResults.length > 0 && <Typography variant="body2" sx={{ ml: 1 }}>{currentResultIndex + 1} of {searchResults.length}</Typography>}
                    {isSearching && <CircularProgress size={24} sx={{ ml: 1 }} />}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', borderLeft: '1px solid #ccc', ml: 1, pl: 1 }}>
                    <Tooltip title={showDrawingTools ? "Exit Drawing Mode" : "Enter Drawing Mode"}>
                        <IconButton onClick={toggleDrawingTools} color={showDrawingTools ? 'primary' : 'default'}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Paper>

            {showDrawingTools && (
                <Paper elevation={3} sx={{ position: 'sticky', top: 74, zIndex: 99, p: 1, mb: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                    <Tooltip title="Move/Select"><IconButton onClick={setMoveTool} color={isMoving ? 'primary' : 'default'}><PanToolIcon /></IconButton></Tooltip>
                    <Tooltip title="Freehand"><IconButton onClick={() => setDrawingTool('freehand')} color={!isMoving && !eraserMode && drawingShape === 'freehand' ? 'primary' : 'default'}><BrushIcon /></IconButton></Tooltip>
                    <Tooltip title="Rectangle"><IconButton onClick={() => setDrawingTool('rectangle')} color={!isMoving && !eraserMode && drawingShape === 'rectangle' ? 'primary' : 'default'}><CropSquareIcon /></IconButton></Tooltip>
                    <Tooltip title="Circle"><IconButton onClick={() => setDrawingTool('circle')} color={!isMoving && !eraserMode && drawingShape === 'circle' ? 'primary' : 'default'}><RadioButtonUncheckedIcon /></IconButton></Tooltip>
                    <Tooltip title="Arrow"><IconButton onClick={() => setDrawingTool('arrow')} color={!isMoving && !eraserMode && drawingShape === 'arrow' ? 'primary' : 'default'}><ArrowForwardIcon /></IconButton></Tooltip>
                    <Tooltip title="Eraser"><IconButton onClick={setEraserTool} color={eraserMode ? 'primary' : 'default'}><AutoFixNormalIcon /></IconButton></Tooltip>
                    
                    {!isMoving && !eraserMode && (
                        <input type="color" value={drawingColor} onChange={(e) => setDrawingColor(e.target.value)} style={{ marginLeft: '8px', cursor: 'pointer', border: 'none', width: '28px', height: '28px', padding: 0 }} />
                    )}
                </Paper>
            )}

            <Popover open={Boolean(colorPickerAnchor)} anchorEl={colorPickerAnchor} onClose={handleColorPickerClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}><SketchPicker color={selectedColor} onChangeComplete={handleColorChange} /></Popover>
    
            <div 
                ref={viewerRef} 
                onMouseUp={drawingMode ? handleMouseUp : handleTextSelection}
                style={{ position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            >
                {pdfFileUrl && (
                    <>
                        <Document file={pdfFileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                            <Page 
                                pageNumber={pageNumber} 
                                scale={scale} 
                                renderAnnotationLayer={false} 
                                renderTextLayer={!drawingMode}
                            >
                                {renderHighlights()}
                                {renderSearchResults()}
                            </Page>
                        </Document>
                        <canvas
                           ref={canvasRef}
                           onMouseDown={handleMouseDown}
                           onMouseMove={handleMouseMove}
                           onMouseLeave={isMoving ? handleMouseUp : null}
                           onClick={handleCanvasClick}
                           style={{
                               position: 'absolute',
                               top: 0,
                               left: 0,
                               width: '100%',
                               height: '100%',
                               zIndex: drawingMode ? 5 : -1,
                               cursor: eraserMode ? `url(${ERASER_CURSOR_URL}) 4 18, auto` : (isMoving ? 'move' : (drawingMode ? 'crosshair' : 'default')),
                           }}
                        />
                    </>
                )}
            </div>

            <Popover open={Boolean(menuState.anchorEl)} anchorEl={menuState.anchorEl} onClose={handleMenuClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }} sx={{ '& .MuiPaper-root': { borderRadius: 2, boxShadow: 3 } }}>
                <Stack direction="row" spacing={0.5} sx={{ p: 0.5 }}>
                    {MENU_COLORS.map(color => ( <IconButton key={color} size="small" onClick={() => handleMenuColorChange(color)}> <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: color }} /> </IconButton> ))}
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }}/>
                    <Tooltip title="Add/Edit Note"><IconButton size="small" onClick={handleOpenNoteDialog}><NoteAddIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete Highlight"><IconButton size="small" onClick={handleMenuDelete}><DeleteIcon fontSize="small" color="error" /></IconButton></Tooltip>
                </Stack>
            </Popover>

            <Dialog open={noteDialogOpen} onClose={handleCloseNoteDialog} fullWidth maxWidth="sm">
                <DialogTitle>Add/Edit Note</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}> Add a note for the highlight: <Typography component="span" fontStyle="italic" color="text.secondary">" {truncateText(activeHighlightForNote?.text, 100)} "</Typography></DialogContentText>
                    <TextField autoFocus margin="dense" id="note" label="Your Note" type="text" fullWidth variant="outlined" multiline rows={4} value={currentNote} onChange={(e) => setCurrentNote(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseNoteDialog}>Cancel</Button>
                    <Button onClick={handleSaveNote} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PDFViewer;