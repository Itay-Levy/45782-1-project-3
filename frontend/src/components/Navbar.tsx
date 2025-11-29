import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🌴 Vacation Tagging</Link>
      </div>
      
      <div className="navbar-menu">
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        ) : (
          <>
            <Link to="/vacations" className="nav-link">Vacations</Link>
            {isAdmin && (
              <>
                <Link to="/admin" className="nav-link">Admin Panel</Link>
                <Link to="/reports" className="nav-link">Reports</Link>
              </>
            )}
            <span className="user-name">
              Welcome, {user?.firstName} {user?.lastName}
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
