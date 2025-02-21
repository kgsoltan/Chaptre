import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import NewBookModal from '../components/NewBookModal'

function Header() {
  const [showModal, setShowModal] = useState(false);
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
        {user && (
            <li>
              <button onClick={() => setShowModal(true)} className="nav-item">
                New Book
              </button>
            </li>
          )}
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

      {showModal && <NewBookModal user={user} onClose={() => setShowModal(false)} />}
    </header>
  );
}

export default Header;
