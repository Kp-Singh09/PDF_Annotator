import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();

  };

  return (
    <AppBar position="static">
      <Toolbar>
        {}
        <Box 
          onClick={() => navigate('/dashboard')} 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexGrow: 1, 
            cursor: 'pointer' 
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