import React, { useState } from 'react';
import { createBook } from '../services/api';
import Select from 'react-select';

function CreateBookModal({ user, onClose }) {
  const [bookTitle, setBookTitle] = useState('');
  const [bookGenre, setBookGenre] = useState([]);
  const [authorField, setAuthorField] = useState('');
  const [error, setError] = useState(null);

  //genre/tags for the select at the bottom
  const genreOptions = [
    { value: "Fantasy", label: "Fantasy" },
    { value: "Sci-Fi", label: "Sci-Fi" },
    { value: "Mystery", label: "Mystery" },
    { value: "Romance", label: "Romance" },
    { value: "Horror", label: "Horror" },
    { value: "Comedy", label: "Comedy" },
    { value: "Action", label: "Action" },
    { value: "Adventure", label: "Adventure" },
    { value: "Drama", label: "Drama" },
    { value: "Coming of age", label: "Coming of age" },
    { value: "Fiction", label: "Fiction" },
    { value: "Non-Fiction", label: "Non-Fiction" },
  ];

  const handleCreateBook = async (e) => {
    e.preventDefault();
    const bookData = {
      book_title: bookTitle,
      author:  authorField,
      author_id: user.uid,
      genre_tags: bookGenre, //Change later when we add tags and stuff
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
            <Select
              isMulti
              options={genreOptions}
              value={genreOptions.filter(option => bookGenre.includes(option.value))}
              onChange={(selectedOptions) => setBookGenre(selectedOptions.map(option => option.value))}
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
