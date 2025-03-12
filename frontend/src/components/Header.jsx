import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import NewBookModal from '../components/NewBookModal';
import SearchBar from './SearchBar';
import logo from '../assets/logo.svg';
import profileIcon from '../assets/user.svg';
import bookIcon from '../assets/book.svg';
import './Header.css';

function Header() {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const location = useLocation();

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  return (
    <header className="header">
      <Link to="/" className="logo-item">
        <img width='80%' height='auto' src={logo} alt="Chaptre" />
      </Link>

      <div className="header-content">
        {(location.pathname === '/' || location.pathname.startsWith('/search')) && (
          <SearchBar />
        )}
      </div>

      <nav className="nav-container">
        <ul className="nav-list">
          <li>
            {user ? (
              <>
                <button onClick={() => setShowModal(true)} className="nav-item icon-btn">
                  <img src={bookIcon} alt="New Book" className="icon" />
                </button>
                <Link to={`/profile/${user.uid}`} className="nav-item icon-btn">
                  <img src={profileIcon} alt="Profile" className="icon" />
                </Link>
              </>
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
