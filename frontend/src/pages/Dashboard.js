// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// We still import pdfAPI, but we'll use it differently
import { pdfAPI } from '../services/api';

// MUI Components
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    CircularProgress,
    Alert,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Fab
} from '@mui/material';

// MUI Icons
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const Dashboard = () => {
    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    
    const [renameOpen, setRenameOpen] = useState(false);
    const [currentPdf, setCurrentPdf] = useState(null);
    const [newName, setNewName] = useState('');

    const [deleteOpen, setDeleteOpen] = useState(false);

    const navigate = useNavigate();

    const fetchPdfs = async () => {
        try {
            setLoading(true);
            // CHANGE: Use pdfAPI.get() with the correct endpoint
            const response = await pdfAPI.get('/my-pdfs');
            // Your backend returns { success: true, pdfs: [...] }
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
        // Your backend expects the file under the key 'pdf'
        formData.append('pdf', file);

        try {
            setUploading(true);
            setError('');
            // CHANGE: Use pdfAPI.post() with the correct endpoint and config
            await pdfAPI.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await fetchPdfs();
        } catch (err) {
            setError(err.response?.data?.message || 'File upload failed. Please try again.');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!currentPdf) return;
        try {
            // Your backend delete route uses the UUID
            await pdfAPI.delete(`/${currentPdf.uuid}`);
            await fetchPdfs();
            handleCloseDelete();
        } catch (err) {
            setError('Failed to delete PDF.');
            console.error(err);
        }
    };

    const handleRename = async () => {
        if (!currentPdf || !newName) return;
        try {
            // Your backend rename route uses the UUID
            await pdfAPI.put(`/${currentPdf.uuid}/rename`, { originalName: newName });
            await fetchPdfs();
            handleCloseRename();
        } catch (err) {
            setError('Failed to rename PDF.');
            console.error(err);
        }
    };

    // ... (rest of the file is the same)
    const handleClickOpenRename = (pdf) => {
        setCurrentPdf(pdf);
        setNewName(pdf.originalName.replace('.pdf', ''));
        setRenameOpen(true);
    };
    const handleCloseRename = () => setRenameOpen(false);

    const handleClickOpenDelete = (pdf) => {
        setCurrentPdf(pdf);
        setDeleteOpen(true);
    };
    const handleCloseDelete = () => setDeleteOpen(false);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom component="div">
                My PDF Library
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                {pdfs.length > 0 ? (
                    pdfs.map((pdf) => (
                        <Grid item xs={12} sm={6} md={4} key={pdf._id}>
                            <Card>
                                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                                    <DescriptionIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }}/>
                                    <Typography variant="h6" component="div" noWrap>
                                        {pdf.originalName}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <IconButton onClick={() => navigate(`/pdf/${pdf.uuid}`)} color="primary" aria-label="open pdf">
                                        <OpenInNewIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleClickOpenRename(pdf)} color="secondary" aria-label="rename pdf">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleClickOpenDelete(pdf)} color="error" aria-label="delete pdf">
                                        <DeleteIcon />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    !loading && (
                        <Typography sx={{ mt: 4, width: '100%', textAlign: 'center' }}>
                            You haven't uploaded any PDFs yet.
                        </Typography>
                    )
                )}
            </Grid>

            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 32, right: 32 }}
                component="label"
                disabled={uploading}
            >
                {uploading ? <CircularProgress size={24} color="inherit" /> : <UploadFileIcon />}
                <input type="file" hidden onChange={handleFileChange} accept=".pdf" />
            </Fab>

            <Dialog open={renameOpen} onClose={handleCloseRename}>
                <DialogTitle>Rename PDF</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter a new name for the file "{currentPdf?.originalName}". 
                        The .pdf extension will be added automatically.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
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

            <Dialog open={deleteOpen} onClose={handleCloseDelete}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete "{currentPdf?.originalName}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDelete}>Cancel</Button>
                    <Button onClick={handleDelete} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Dashboard;