import React from 'react';
import { Link } from 'react-router-dom';

function BookCard({ book, showEditLink }) {
  return (
    <div className="book-card">
      <Link to={`/book/${book.id}`}>
        <img src={book.cover_image_url} alt="Cover Not Found" />
        <h3>{book.book_title}</h3>
        <p>By {book.author}</p>
      <div className="genre-container">
        {book.genre_tags.map((genre, index) => (
          <span key={index} className="genre-bubble">
            {genre}
          </span>
        ))}
      </div>
      </Link>
      <br />
      {showEditLink && (
        <Link to={`/book/${book.id}/editor`} className="nav-item">
          Edit Book
        </Link>
      )}
    </div>
  );
}

export default BookCard;
