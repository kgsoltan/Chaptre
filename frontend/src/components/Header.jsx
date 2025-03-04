import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../index.css';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import NewBookModal from '../components/NewBookModal'

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
        {user && (
            <li>
              <button onClick={() => setShowModal(true)} className="nav-item">
                New Book
              </button>
            </li>
          )}
          {user && <li><Link to={`/profile/${user.uid}`} className="nav-item">Profile</Link></li>}
        </ul>
      </nav>

      {showModal && <NewBookModal user={user} onClose={() => setShowModal(false)} />}
    </header>
  );
}

export default Header;
