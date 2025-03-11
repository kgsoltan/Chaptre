import { useState } from 'react';
import { createBook, getAuthorDetails } from '../services/api';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';

import './NewBookModal.css';

function CreateBookModal({ user, onClose }) {
  const [bookTitle, setBookTitle] = useState('');
  const [bookGenre, setBookGenre] = useState([]);
  const [bookSynopsis, setBookSynopsis] = useState('');

  // Error states
  const [titleError, setTitleError] = useState('');
  const [synopsisError, setSynopsisError] = useState('');
  const [genreError, setGenreError] = useState('');
  const [apiError, setApiError] = useState(null); // Renamed from 'error' to 'apiError'

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

  const validateTitle = (title) => {
    if (title.length > 50 || title.length < 1) {
      return 'Title must be between 1 and 50 characters.';
    }
    return '';
  };

  const validateSynopsis = (synopsis) => {
    if (synopsis.length > 500 || synopsis.length <= 49) {
      return 'Synopsis must be between 50 and 500 characters.';
    }
    return '';
  };

  const validateGenre = (genre) => {
    if (genre.length > 3 || genre.length < 1) {
      return 'You must select between 1 and 3 genres.';
    }
    return '';
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();

    setTitleError('');
    setSynopsisError('');
    setGenreError('');
    setApiError(null);

    const titleError = validateTitle(bookTitle);
    const synopsisError = validateSynopsis(bookSynopsis);
    const genreError = validateGenre(bookGenre);

    setTitleError(titleError);
    setSynopsisError(synopsisError);
    setGenreError(genreError);

    if (titleError || synopsisError || genreError) {
      return;
    }

    try {
      const authorData = await getAuthorDetails(user.uid);
      if (!authorData || !authorData.first_name) {
        setApiError("Could not retrieve author details.");
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
      setApiError('Failed to create book.');
    }
  };

  return (
    <div className="create-book-modal-overlay">
      <div className="create-book-modal-content">
        {/* Close Button */}
        <button className="close-button" onClick={onClose}>x</button>
        
        <h2>Create a New Book</h2>
        {apiError && <p className="error-message">{apiError}</p>}
        <form onSubmit={handleCreateBook}>
          <div className="input-group">
            <label>Book Title</label>
            {titleError && <p className="error-message">{titleError}</p>}
            <input
              type="text"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Genre</label>
            {genreError && <p className="error-message">{genreError}</p>}
            <Select
              isMulti
              options={genreOptions}
              menuShouldScrollIntoView={false}
              value={genreOptions.filter(option => bookGenre.includes(option.value))}
              onChange={(selectedOptions) => setBookGenre(selectedOptions.map(option => option.value))}
            />
          </div>
          <div className="input-group">
            <label>Book Synopsis</label>
            {synopsisError && <p className="error-message">{synopsisError}</p>}

            <input
              type="text"
              value={bookSynopsis}
              onChange={(e) => setBookSynopsis(e.target.value)}
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
