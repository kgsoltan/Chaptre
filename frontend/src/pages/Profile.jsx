import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { getAuthorDetails, getAuthorBooks, updateProfilePic, updateAuthor, getBookDetails } from '../services/api';
import { validateFile, uploadToS3 } from "../services/imageUpload";
import defaultProfilePic from "../assets/default-profile-pic.jpg";
import FollowingModal from '../components/FollowingModal';
import Sidebar from '../components/Sidebar';

import './Profile.css';

function Profile() {
  const { authorId } = useParams();
  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [bioText, setBioText] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isFavoritedModalOpen, setIsFavoritedModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritedBooks, setFavoritedBooks] = useState([]);
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

  const getFavoritedBooks = async (favoritedBookIds) => {
    try {
      const favoritedBooksData = [];

      for (const bookId of favoritedBookIds) {
        try {
          const book = await getBookDetails(bookId);
          favoritedBooksData.push(book);
        } catch (error) {
        }
      }

      setFavoritedBooks(favoritedBooksData);
    } catch (error) {
      console.error("Error fetching favorited books:", error);
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
        setIsFavorited(userDetails.following?.includes(authorId) || false);

        if (userDetails.following?.length > 0) {
          getFavoritedBooks(userDetails.favorited_books);
        }
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
      if (isFavorited) {
        updatedFollowing = currentFollowing.filter(id => id !== authorId);
      } else {
        updatedFollowing = [...currentFollowing, authorId];
      }

      await updateAuthor(user.uid, { following: updatedFollowing });

      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error("Error subscribing/unsubscribing:", error);
      alert("Failed to update subscription.");
    }
  };

  const closeFavoritedModal = async () => {
    setIsFavoritedModalOpen(false);
  };

  const handleProfileImage = async (event, authorId, updateProfilePic) => {
    const file = event.target.files[0];
    if (!validateFile(file)) return;


    try {
      const s3ImageUrl = await uploadToS3(file);
      await updateProfilePic(authorId, s3ImageUrl);
      console.log("Profile image updated in Firestore:", s3ImageUrl);
      window.location.reload();
    } catch (error) {
      console.error("Error during profile image upload:", error);
      alert("Failed to upload profile image.");
    }
  };


  const handleSaveBio = async () => {
    try {
      await updateAuthor(authorId, { bio: bioText });
      setAuthor((prev) => ({ ...prev, bio: bioText }));
      setIsEditingBio(false);
    } catch (error) {
      console.error("Error updating bio:", error);
      alert("Failed to update bio.");
    }
  };

  if (!author) return <div>Loading...</div>;

  const publishedBooks = books.filter((book) => book.is_published);
  const draftBooks = books.filter((book) => !book.is_published);

  return (
    <div className="profile">
      <Sidebar />
      <div className="profile-header">
        <label htmlFor="file-upload" className="profile-img-label">
          <img
            className="profile-img"
            src={author.profile_pic_url || defaultProfilePic}
            alt="Profile Pic Error"
            onError={(e) => { e.target.src = defaultProfilePic; }}
          />
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          className="file-upload"
          onChange={(event) => handleProfileImage(event, authorId, updateProfilePic)}
          style={{ display: 'none' }}
        />


        <div className='profile-header-content'>
          {isCurrentUser ? (
            <div className='logout'>
              <h1 className="profile-name">{`${author.first_name} ${author.last_name}'s Profile`}</h1>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <div className='logout'>
              <h1 className="profile-name">{`${author.first_name} ${author.last_name}'s Profile`}</h1>
            </div>
          )}
          <div className="profile-info">
            <div className="bio-display">
              {isEditingBio ? (
                <div className="bio-edit">
                  <textarea
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    className="bio-input"
                  />
                  <button onClick={handleSaveBio} className="edit-button">Save</button>
                  <button onClick={() => setIsEditingBio(false)} className="cancel-button">Cancel</button>
                </div>
              ) : (
                <div className="bio-display">
                  <p className="profile-bio">{bioText || 'Empty bio ...'}</p>
                  {isCurrentUser ? (
                    <div>
                      <button onClick={() => setIsEditingBio(true)} className="edit-button">Edit Bio</button>
                    </div>
                  ) : user ? (
                    <button onClick={handleSubscribe} className="edit-button">
                      {isFavorited ? "Unfollow" : "Follow"}
                    </button>
                  ) : (
                    <p className="bio-display">Please log in to subscribe</p>
                  )}
                </div>
              )}
            </div>
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
        <BookGrid books={publishedBooks} showEditLink={isCurrentUser} booksPerPage={5} />
      ) : (
        <p>No public books yet.</p>
      )}

      {isCurrentUser && (
        <>
          <h3 className="profile-books-title">Drafts:</h3>
          {draftBooks.length > 0 ? (
            <BookGrid books={draftBooks} showEditLink={true} booksPerPage={5} />
          ) : (
            <p>No draft books yet.</p>
          )}
        </>
      )}

      {isFavoritedModalOpen && (
        <FollowingModal
          following={user?.following || []}
          onClose={closeFavoritedModal}
        />
      )}
    </div>
  );
}

export default Profile;
