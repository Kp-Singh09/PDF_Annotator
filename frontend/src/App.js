// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout'; // Import the new Layout

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import PDFViewer from './pages/PDFViewer';

// Global CSS
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout> {/* Wrap everything in the Layout component */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
            />
            <Route 
              path="/pdf/:uuid" 
              element={<ProtectedRoute><PDFViewer /></ProtectedRoute>} 
            />

            {/* Redirect root to dashboard if logged in, else to login */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;