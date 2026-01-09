import React from 'react';
import './Navbar.css';

export default function NavBar({ onLogout }) {
  return (
    <nav className="dashboard-navbar">
      <div className="navbar-left">
        <span className="navbar-logo">Ledger Inventory</span>
      </div>

      <div className="navbar-right">
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
