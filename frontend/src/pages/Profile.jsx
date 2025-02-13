import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getAuthorDetails, getAuthorBooks, updateAuthorProfilePic } from '../services/api';
import { uploadProfilePicture } from '../services/firebaseStorage';
import { auth } from '../services/firebaseConfig';

function Profile() {
  const { authorId } = useParams();
  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadAuthorData = async () => {
      try {
        const authorDetails = await getAuthorDetails(authorId);
        setAuthor(authorDetails);
        console.log('Author:', authorDetails);

        const authorBooks = await getAuthorBooks(authorId);
        setBooks(authorBooks);
        console.log('Books:', authorBooks);
      } catch (e) {
        alert('Failed to load author data.');
      }
    };

    loadAuthorData();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [authorId]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const downloadURL = await uploadProfilePicture(file, authorId);
      await updateAuthorProfilePic(authorId, downloadURL);
      setAuthor((prev) => ({ ...prev, profile_pic_url: downloadURL }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    }
  };

  if (!author) return <div>Loading...</div>;

  return (
    <div className="profile">
      <label htmlFor="file-upload" className="profile-img-label">
        <img className="profile-img" src={author.profile_pic_url || 'default-profile-pic.jpg'} alt="Profile" />
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        className="file-upload"
        onChange={handleImageUpload}
        style={{ display: 'none' }} // Hides the file input
      />

      <h1 className="profile-name">{author.first_name} {author.last_name}'s Profile</h1>
      <p className="profile-bio">{author.bio}</p>
      <h3 className="profile-books-title">{author.first_name}'s books:</h3>

      {books.length > 0 ? <BookGrid books={books} showEditLink={user} /> : <p>No books available.</p>}
    </div>
  );
}

export default Profile;
