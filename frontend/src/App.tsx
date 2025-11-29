import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Vacations from './pages/Vacations';
import Admin from './pages/Admin';
import AddVacation from './pages/AddVacation';
import EditVacation from './pages/EditVacation';
import Reports from './pages/Reports';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/vacations" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route 
                path="/vacations" 
                element={
                  <ProtectedRoute>
                    <Vacations />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute adminOnly>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/add" 
                element={
                  <ProtectedRoute adminOnly>
                    <AddVacation />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/edit/:id" 
                element={
                  <ProtectedRoute adminOnly>
                    <EditVacation />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute adminOnly>
                    <Reports />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<Navigate to="/vacations" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
