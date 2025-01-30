import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import { getAllBooks, getAuthorProfileByID, updateAuthorProfile } from '../services/api';

function Profile() {
  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAuthor, setEditedAuthor] = useState(null);
  const { authorId } = useParams();
  
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const authorProfile = await getAuthorProfileByID(authorId);
        setAuthor(authorProfile);
        setEditedAuthor(authorProfile);
      } catch(e){
        alert("FAILED TO LOAD AUTHOR");
      }
    }
    fetchAuthor();

    const fetchBooks = async () => {
      try {
        const allBooks = await getAllBooks();
        const authorBooks = allBooks.books.filter(b => b.authorID == authorId);
        setBooks(authorBooks);
      } catch(e){
        alert("FAILED TO LOAD BOOKS");
      }
    }
    fetchBooks();
  }, [authorId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateAuthorProfile(authorId, editedAuthor);
      setAuthor(editedAuthor);
      setIsEditing(false);
    } catch (e) {
      alert("FAILED TO UPDATE AUTHOR");
    }
  };

  const handleCancel = () => {
    setEditedAuthor(author);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedAuthor(prev => ({ ...prev, [name]: value }));
  };

  if (!author) return <div>Loading...</div>;

  return (
    <div className="profile">
      {isEditing ? (
        <>
          <input
            name="name"
            value={editedAuthor.name}
            onChange={handleChange}
          />
          <textarea
            name="bio"
            value={editedAuthor.bio}
            onChange={handleChange}
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </>
      ) : (
        <>
          <h1>{author.name}'s Profile</h1>
          <p>{author.bio}</p>
          <button onClick={handleEdit}>Edit Profile</button>
        </>
      )}
      <h3>{author.name}'s books:</h3>
      <BookGrid books={books} />
    </div>
  );
}

export default Profile;
