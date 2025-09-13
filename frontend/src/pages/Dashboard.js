import React, { useState, useEffect } from "react";
import {
    Container,
    Box,
    Typography,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    TextField,
    CircularProgress,
    Alert,
    Fab
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useNavigate } from "react-router-dom";
import { pdfAPI } from '../services/api';

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
        formData.append('pdf', file);

        try {
            setUploading(true);
            setError('');
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
            const finalName = newName.endsWith('.pdf') ? newName : `${newName}.pdf`;
            await pdfAPI.put(`/${currentPdf.uuid}/rename`, { originalName: finalName });
            await fetchPdfs();
            handleCloseRename();
        } catch (err) {
            setError('Failed to rename PDF.');
            console.error(err);
        }
    };

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
        return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Container>;
    }

    return (
        <Container sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                My PDF Library
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {}
            <Box
                sx={{
                    display: 'grid',
                    gap: 3, 

                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                }}
            >
                {pdfs.length > 0 ? (
                    pdfs.map((pdf) => (
                        <Card
                            key={pdf._id}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                            }}
                        >
                            <CardContent
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <DescriptionIcon
                                    sx={{
                                        fontSize: 40,
                                        mr: 2,
                                        color: "primary.main",
                                        flexShrink: 0,
                                    }}
                                />
                                <Typography
                                    variant="h6"
                                    component="div"
                                    noWrap
                                    title={pdf.originalName}
                                    sx={{ flexGrow: 1 }}
                                >
                                    {pdf.originalName}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <IconButton
                                    onClick={() => navigate(`/pdf/${pdf.uuid}`)}
                                    color="primary"
                                >
                                    <OpenInNewIcon />
                                </IconButton>
                                <IconButton
                                    onClick={() => handleClickOpenRename(pdf)}
                                    color="secondary"
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    onClick={() => handleClickOpenDelete(pdf)}
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </CardActions>
                        </Card>
                    ))
                ) : (
                    <Typography
                        sx={{ mt: 4, width: "100%", textAlign: "center" }}
                    >
                        You haven't uploaded any PDFs yet.
                    </Typography>
                )}
            </Box>

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
                    <TextField
                        autoFocus
                        margin="dense"
                        label="New Name"
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
                <DialogTitle>Delete PDF</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete{" "}
                        <strong>{currentPdf?.originalName}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDelete}>Cancel</Button>
                    <Button onClick={handleDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Dashboard;