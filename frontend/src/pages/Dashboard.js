import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { pdfAPI } from '../services/api';
import {
    Container, Box, Typography, Button, List, ListItem, ListItemText,
    CircularProgress, Alert, IconButton, Menu, MenuItem, Dialog,
    DialogActions, DialogContent, DialogContentText, DialogTitle, TextField
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const Dashboard = () => {
    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // State for menu and dialogs
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentPdf, setCurrentPdf] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [renameOpen, setRenameOpen] = useState(false);
    const [newName, setNewName] = useState('');

    const fetchPdfs = async () => {
        try {
            setLoading(true);
            // Use the correct endpoint '/my-pdfs' as defined in your backend
            const response = await pdfAPI.get('/my-pdfs');
            setPdfs(response.data.pdfs);
            setError('');
        } catch (err) {
            setError('Failed to fetch PDFs. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPdfs();
    }, []);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        // The backend upload middleware expects the key 'pdf'
        formData.append('pdf', file);

        try {
            setUploading(true);
            setError('');
            // The upload route is '/upload'
            await pdfAPI.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await fetchPdfs(); // Refresh the list after upload
        } catch (err) {
            setError('Failed to upload PDF. Please try again.');
            console.error(err);
        } finally {
            setUploading(false);
            // Reset the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleMenuClick = (event, pdf) => {
        setAnchorEl(event.currentTarget);
        setCurrentPdf(pdf);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setCurrentPdf(null);
    };

    const handleOpenDelete = () => {
        setDeleteOpen(true);
        handleMenuClose();
    };

    const handleCloseDelete = () => {
        setDeleteOpen(false);
    };

    const handleDelete = async () => {
        if (!currentPdf) return;
        try {
            // The delete route uses the PDF's database _id
            await pdfAPI.delete(`/${currentPdf._id}`);
            await fetchPdfs();
            handleCloseDelete();
        } catch (err) {
            setError('Failed to delete PDF.');
            console.error(err);
        }
    };

    const handleOpenRename = () => {
        if (currentPdf) {
            setNewName(currentPdf.name);
            setRenameOpen(true);
        }
        handleMenuClose();
    };

    const handleCloseRename = () => {
        setRenameOpen(false);
        setNewName('');
    };

    const handleRename = async () => {
        if (!currentPdf || !newName) return;
        try {
            // The rename route uses the PDF's database _id
            await pdfAPI.put(`/${currentPdf._id}`, { name: newName });
            await fetchPdfs();
            handleCloseRename();
        } catch (err) {
            setError('Failed to rename PDF.');
            console.error(err);
        }
    };

    const handlePdfClick = (uuid) => {
        navigate(`/pdf/${uuid}`);
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    My PDF Library
                </Typography>
                <Button
                    variant="contained"
                    component="label"
                    disabled={uploading}
                >
                    Upload PDF
                    <input
                        type="file"
                        hidden
                        accept="application/pdf"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                    />
                </Button>
                {uploading && <CircularProgress size={24} sx={{ ml: 2 }} />}
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <List sx={{ mt: 2 }}>
                        {pdfs.length > 0 ? pdfs.map((pdf) => (
                            <ListItem
                                key={pdf.uuid}
                                secondaryAction={
                                    <IconButton edge="end" aria-label="options" onClick={(e) => handleMenuClick(e, pdf)}>
                                        <MoreVertIcon />
                                    </IconButton>
                                }
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': { backgroundColor: 'action.hover' },
                                    mb: 1,
                                    boxShadow: 1,
                                    borderRadius: 1
                                }}
                            >
                                <PictureAsPdfIcon sx={{ mr: 2, color: 'action.active' }} />
                                <ListItemText
                                    primary={pdf.name}
                                    secondary={`Uploaded on: ${new Date(pdf.createdAt).toLocaleDateString()}`}
                                    onClick={() => handlePdfClick(pdf.uuid)}
                                />
                            </ListItem>
                        )) : (
                            <Typography sx={{ mt: 2 }}>No PDFs found. Upload one to get started!</Typography>
                        )}
                    </List>
                )}
            </Box>

            {/* Menu for PDF options */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleOpenRename}>Rename</MenuItem>
                <MenuItem onClick={handleOpenDelete} sx={{ color: 'error.main' }}>Delete</MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteOpen} onClose={handleCloseDelete}>
                <DialogTitle>Delete PDF</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete "{currentPdf?.name}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDelete}>Cancel</Button>
                    <Button onClick={handleDelete} color="error">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Rename Dialog */}
            <Dialog open={renameOpen} onClose={handleCloseRename}>
                <DialogTitle>Rename PDF</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="New Name"
                        type="text"
                        fullWidth
                        variant="standard"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRename}>Cancel</Button>
                    <Button onClick={handleRename}>Rename</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Dashboard;