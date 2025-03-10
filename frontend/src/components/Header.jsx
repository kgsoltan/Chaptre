import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import NewBookModal from '../components/NewBookModal';
import SearchBar from './SearchBar';
import logo from '../assets/logo.svg';
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
        <img width='80%' height='auto'src={logo} alt="Chaptre" />
      </Link>

      <div className="header-content">
        {location.pathname === '/' && (
          <SearchBar />
        )}
      </div>

      <nav className="nav-container">
        <ul className="nav-list">
          <li>
            {user ? (
              <>
                <button onClick={() => setShowModal(true)} className="nav-item">
                  New Book
                </button>
                <Link to={`/profile/${user.uid}`} className="nav-item">Profile</Link>
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