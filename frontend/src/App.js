import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import RegisterTenant from './pages/RegisterTenant';
import Dashboard from './pages/Dashboard';
import ProjectList from './pages/ProjectList';
import ProjectDetails from './pages/ProjectDetails';
import './App.css';
import UserList from './pages/UserList';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterTenant />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/projects" element={
            <PrivateRoute><ProjectList /></PrivateRoute>
          } />
          <Route path="/projects/:id" element={
            <PrivateRoute><ProjectDetails /></PrivateRoute>
          } />
          <Route path="/users" element={
            <PrivateRoute><UserList /></PrivateRoute>
          } />
          {/* Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;