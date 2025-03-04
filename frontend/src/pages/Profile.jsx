import { useState, useEffect } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { getAuthorDetails, getAuthorBooks, updateProfilePic, updateAuthor } from '../services/api';
import { auth } from '../services/firebaseConfig';
import { validateFile, uploadToS3 } from "../services/imageUpload";
import defaultProfilePic from "../assets/default-profile-pic.jpg";
import FollowingModal from '../components/FollowingModal';
import '../Profile.css';

function Profile() {
  const { authorId } = useParams();
  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [bioText, setBioText] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const loadAuthorData = async () => {
      try {
        const authorDetails = await getAuthorDetails(authorId);
        setAuthor(authorDetails);
        setBioText(authorDetails.bio || "");

        const authorBooks = await getAuthorBooks(authorId);
        setBooks(authorBooks);
      } catch (err) {
        console.error('Failed to load author data:', err);
        alert('Failed to load author data');
      }
    };

    loadAuthorData();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsCurrentUser(currentUser?.uid === authorId);

      if (currentUser) {
        const userDetails = await getAuthorDetails(currentUser.uid);
        setIsFollowing(userDetails.following?.includes(authorId) || false);
      }
    });

    return () => unsubscribe();
  }, [authorId]);

  const handleSubscribe = async () => {
    if (!user || !user.uid) {
      alert("User not found. Please log in.");
      return;
    }

    try {
      const userDetails = await getAuthorDetails(user.uid);
      let currentFollowing = Array.isArray(userDetails.following) ? [...userDetails.following] : [];

      let updatedFollowing;
      if (isFollowing) {
        // Unsubscribe
        updatedFollowing = currentFollowing.filter(id => id !== authorId);
        alert("Successfully unsubscribed from the author.");
      } else {
        // Subscribe
        updatedFollowing = [...currentFollowing, authorId];
        alert("Successfully subscribed to the author.");
      }

      await updateAuthor(user.uid, { following: updatedFollowing });

      // Update local state
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error subscribing/unsubscribing:", error);
      alert("Failed to update subscription.");
    }
  };

  const handleFollowingModal = () => {
    setIsFollowingModalOpen((prev) => !prev);
  };

  const closeFollowingModal = () => {
    setIsFollowingModalOpen(false);
  };

  if (!author) return <div>Loading...</div>;

  const publishedBooks = books.filter((book) => book.is_published);
  const draftBooks = books.filter((book) => !book.is_published);

  return (
    <div className="profile">
      <div className="profile-header">
        <label htmlFor="file-upload" className="profile-img-label">
          <img
            className="profile-img"
            src={author.profile_pic_url?.trim() ? author.profile_pic_url : defaultProfilePic}
            alt="Profile"
          />
        </label>
        <div className="profile-info">
          <h1 className="profile-name">{`${author.first_name} ${author.last_name}'s Profile`}</h1>

          <div className="bio-display">
            <p className="profile-bio">{bioText || 'Empty bio ...'}</p>
            {isCurrentUser ? (
              <div>
                <button onClick={() => setIsEditingBio(true)} className="edit-button">Edit</button>
                <button onClick={handleFollowingModal} className="edit-button">Following</button>
                <button onClick={handleLogout} className="edit-button logout-btn">Logout</button>
              </div>
            ) : (
              <button onClick={handleSubscribe} className="edit-button">
                {isFollowing ? "Unsubscribe" : "Subscribe"}
              </button>
            )}
          </div>
        </div>
      </div>
      {isCurrentUser && (
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          className="file-upload"
          style={{ display: 'none' }}
        />
      )}

      <h3 className="profile-books-title">Public Books:</h3>
      {publishedBooks.length > 0 ? (
        <BookGrid books={publishedBooks} showEditLink={isCurrentUser} />
      ) : (
        <p>No public books yet.</p>
      )}

      {isCurrentUser && (
        <>
          <h3 className="profile-books-title">Drafts:</h3>
          {draftBooks.length > 0 ? (
            <BookGrid books={draftBooks} showEditLink={true} />
          ) : (
            <p>No draft books yet.</p>
          )}
        </>
      )}

      {isFollowingModalOpen && (
        <FollowingModal
          following={user?.following || []}
          onClose={closeFollowingModal}
        />
      )}
    </div>
  );
}

export default Profile;
