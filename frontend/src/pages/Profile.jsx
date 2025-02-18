import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getAuthorDetails, getAuthorBooks, updateProfilePic } from '../services/api';
import { auth } from '../services/firebaseConfig';
import { getS3UploadUrl } from '../services/api';

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
     // Check file type and size
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
     const maxFileSize = 5 * 1024 * 1024; // 5MB limit
    if (file.size > maxFileSize) {
      alert("File size is too large. Please upload a file smaller than 5MB.");
      return;
    }
     try {
      // Step 1: Get signed URL
      const { uploadURL, imageName } = await getS3UploadUrl();
       if (!uploadURL || !imageName) {
        throw new Error('Missing upload URL or image name');
      }
       console.log("Uploading to S3:", uploadURL);
       // Step 2: Upload the image to S3
      const s3Response = await fetch(uploadURL, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });
       if (!s3Response.ok) {
        throw new Error('Failed to upload image');
      }
       console.log("Image successfully uploaded to S3");
       // Step 3: Construct the correct S3 URL
      const s3ImageUrl = `https://chaptre-app.s3.us-east-2.amazonaws.com/${imageName}`;
 
 
       // Step 4: Update Firestore with the new profile picture URL
      await updateProfilePic(authorId, s3ImageUrl);
    } catch (error) {
      console.error('Error during image upload:', error);
      alert('Failed to upload image.');
    }
  }; 

  if (!author) return <div>Loading...</div>;

  const publishedBooks = books.filter(book => book.is_published === true);
  const draftBooks = books.filter(book => book.is_published === false);

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
      {/*<h3 className="profile-books-title">{author.first_name}'s books:</h3>*/}

      {/*books.length > 0 ? <BookGrid books={books} showEditLink={user} /> : <p>No books available.</p>*/}
      
      <h3 className="profile-books-title">Published Books:</h3>
      {publishedBooks.length > 0 ? <BookGrid books={publishedBooks} showEditLink={user} /> : <p>No published books yet.</p>}
      
      <h3 className="profile-books-title">Draft Books:</h3>
      {draftBooks.length > 0 ? (
        <BookGrid 
          books={draftBooks} 
          showEditLink={user} 
        />
      ) : <p>No draft books.</p>}
    </div>
  );
}

export default Profile;

