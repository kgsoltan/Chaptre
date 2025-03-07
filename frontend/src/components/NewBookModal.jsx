import { useState } from 'react';
import { createBook, getAuthorDetails } from '../services/api';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';

import './NewBookModal.css';

function CreateBookModal({ user, onClose }) {
  const [bookTitle, setBookTitle] = useState('');
  const [bookGenre, setBookGenre] = useState([]);
  const [bookSynopsis, setBookSynopsis] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();

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

    try {
      const authorData = await getAuthorDetails(user.uid);
      if (!authorData || !authorData.first_name) {
        setError("Could not retrieve author details.");
        return;
      }

      const bookData = {
        book_title: bookTitle,
        author: authorData.first_name,
        author_id: user.uid,
        book_synopsis: bookSynopsis,
        genre_tags: bookGenre,
        cover_image_url: "https://picsum.photos/id/40/1000/1500",
      };

      await createBook(bookData);
      alert('Book created successfully!');
      onClose();
      navigate(`/profile/${user.uid}`);
    } catch (error) {
      console.error('Error creating book:', error);
      setError('Failed to create book.');
    }
  };

  return (
    <div className="create-book-modal-overlay">
      <div className="create-book-modal-content">
        {/* Close Button */}
        <button className="close-button" onClick={onClose}>x</button>
        
        <h2>Create a New Book</h2>
        {error && <p className="error">{error}</p>}
        
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
            <label>Book Synopsis</label>
            <input
              type="text"
              value={bookSynopsis}
              onChange={(e) => setBookSynopsis(e.target.value)}
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
