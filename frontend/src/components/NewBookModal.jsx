import React, { useState } from 'react';
import { createBook } from '../services/api';

function CreateBookModal({ user, onClose }) {
  const [bookTitle, setBookTitle] = useState('');
  const [bookGenre, setBookGenre] = useState('');
  const [authorField, setAuthorField] = useState('');
  const [error, setError] = useState(null);

  const handleCreateBook = async (e) => {
    e.preventDefault();
    const bookData = {
      book_title: bookTitle,
      author:  authorField,
      author_id: user.uid,
      genre_tags: [bookGenre], //Change later when we add tags and stuff
      cover_image_url: "https://picsum.photos/id/40/1000/1500", // Using a default img for now
    };

    try {
      await createBook(bookData);
      alert('Book created successfully!');
      onClose();
    } catch (error) {
      console.error('Error creating book:', error);
      setError('Failed to create book.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Create New Book</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleCreateBook}>
          <div className="input-group">
            <label>Book Title</label>
            <input
              type="text"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Author Field</label>
            <input
              type="text"
              value={authorField}
              onChange={(e) => setAuthorField(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Genre</label>
            <input
              type="text"
              value={bookGenre}
              onChange={(e) => setBookGenre(e.target.value)}
              required
            />
          </div>
          <button className="primary-button" type="submit">
            Create Book
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateBookModal;
