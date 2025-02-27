import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import { onAuthStateChanged } from 'firebase/auth';
import { getAuthorDetails, getAuthorBooks, updateProfilePic, updateAuthor } from '../services/api'; // Using updateAuthor
import { auth } from '../services/firebaseConfig';
import { validateFile, uploadToS3 } from "../services/imageUpload";
import defaultProfilePic from "../assets/default-profile-pic.jpg";

import '../Profile.css';

function Profile() {
  const { authorId } = useParams();
  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");

  useEffect(() => {
    const loadAuthorData = async () => {
      try {
        const authorDetails = await getAuthorDetails(authorId);
        setAuthor(authorDetails);
        setBioText(authorDetails.bio || "");
        console.log('Author:', authorDetails);

        const authorBooks = await getAuthorBooks(authorId);
        setBooks(authorBooks);
        console.log('Books:', authorBooks);
      } catch (err) {
        alert('Failed to load author data: ', err);
      }
    };

    loadAuthorData();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [authorId]);

  const handleProfileImage = async (event) => {
    const file = event.target.files[0];
    if (!validateFile(file)) return;

    try {
      const s3ImageUrl = await uploadToS3(file);
      await updateProfilePic(authorId, s3ImageUrl);
      
      console.log("Profile image updated in Firestore:", s3ImageUrl);
      alert("Successfully uploaded profile image.");
    } catch (error) {
      console.error("Error during profile image upload:", error);
      alert("Failed to upload profile image.");
    }
  };

  const handleSaveBio = async () => {
    try {
      await updateAuthor(authorId, { bio: bioText }); // Using updateAuthor API function
      setAuthor((prev) => ({ ...prev, bio: bioText })); // Update local state
      setIsEditingBio(false);
      alert("Bio updated successfully!");
    } catch (error) {
      console.error("Error updating bio:", error);
      alert("Failed to update bio.");
    }
  };

  if (!author) return <div>Loading...</div>;

  const publishedBooks = books.filter(book => book.is_published === true);
  const draftBooks = books.filter(book => book.is_published === false);

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
          
          {isEditingBio ? (
            <div className="bio-edit">
              <textarea 
                value={bioText} 
                onChange={(e) => setBioText(e.target.value)} 
                className="bio-input"
              />
              <button onClick={handleSaveBio} className="save-button">Save</button>
              <button onClick={() => setIsEditingBio(false)} className="cancel-button">Cancel</button>
            </div>
          ) : (
            <div className="bio-display">
              <p className="profile-bio">{bioText || "Empty bio ..."}</p>
              {user && user.uid === authorId && (
                <button onClick={() => setIsEditingBio(true)} className="edit-button">Edit</button>
              )}
            </div>
          )}
        </div>
      </div>

      <input
        id="file-upload"
        type="file"
        accept="image/*"
        className="file-upload"
        onChange={handleProfileImage} 
        style={{ display: 'none' }}
      />

      <h3 className="profile-books-title">Public Books:</h3>
      {publishedBooks.length > 0 ? <BookGrid books={publishedBooks} showEditLink={user} /> : <p>No public books yet.</p>}
      
      <h3 className="profile-books-title">Drafts:</h3>
      {draftBooks.length > 0 ? (
        <BookGrid books={draftBooks} showEditLink={user} />
      ) : <p>No draft books yet.</p>}
    </div>
  );
}

export default Profile;
