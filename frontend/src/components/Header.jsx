import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

function Header() {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="header">
      <Link to="/" className="nav-item">Chaptre</Link>

      <nav className="nav-container">
        <ul className="nav-list">
          <li><Link to="/write" className="nav-item">Write</Link></li>
          <li><Link to="/library" className="nav-item">Library</Link></li>
          {user && <li><Link to={`/profile/${user.uid}`} className="nav-item">Profile</Link></li>}

          <li>
            {user ? (
              <button onClick={handleLogout} className="nav-item logout-btn">
                Logout
              </button>
            ) : (
              <Link to="/login" className="nav-item login-btn">Login</Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
