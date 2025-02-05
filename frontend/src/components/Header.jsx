import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

function Header() {
  return (
    <header className="header">

      <Link to="/" className="nav-item">Chaptre</Link>

      <nav className="nav-container">
        <ul className="nav-list">
          <li><Link to="/write" className="nav-item">Write</Link></li>
          <li><Link to="/profile/1" className="nav-item">Profile</Link></li>
          <li><Link to="/login" className="nav-item login-btn">Login</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
