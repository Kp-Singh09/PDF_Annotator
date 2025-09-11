// frontend/src/components/Layout.js
import React from 'react';
import Navbar from './Navbar';
import { Container } from '@mui/material';

const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <Container sx={{ mt: 4 }}>
        <main>{children}</main>
      </Container>
    </div>
  );
};

export default Layout;