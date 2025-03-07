import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import NewBookModal from '../components/NewBookModal'

import './Header.css';

function Header() {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  return (
    <header className="header">
      <Link to="/" className="nav-item">Chaptre</Link>

      <nav className="nav-container">
        <ul className="nav-list">
          <li>
            {user ? (
              <li>
              <button onClick={() => setShowModal(true)} className="nav-item">
              New Book
            </button>
              <Link to={`/profile/${user.uid}`} className="nav-item">Profile</Link></li>
            ) : (
              <Link to="/login" className="nav-item login-btn">Login / Sign up</Link>
            )}
          </li>
        </ul>
      </nav>

      {showModal && <NewBookModal user={user} onClose={() => setShowModal(false)} />}
    </header>
  );
}

export default Header;
