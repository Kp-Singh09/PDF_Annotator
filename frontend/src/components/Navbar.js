import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
// **NEW:** Import useNavigate to handle navigation
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { logout } = useAuth();
  // **NEW:** Initialize the navigate function
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // No need to navigate here, ProtectedRoute will handle it
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {/* **MODIFIED:** Wrapped the logo/title in a Box with an onClick handler */}
        <Box 
          onClick={() => navigate('/dashboard')} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexGrow: 1, 
            cursor: 'pointer' // Changes the mouse to a pointer on hover
          }}
        >
          <DescriptionIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            PDF Annotator
          </Typography>
        </Box>
        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;