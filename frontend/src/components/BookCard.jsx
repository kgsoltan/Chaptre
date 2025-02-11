import React from 'react';
import { Link } from 'react-router-dom';

function BookCard({ book, showEditLink }) {
  return (
    <div className="book-card">
      <img src={book.cover_image_url} alt="Cover Not Found" />
      <h3>{book.book_title}</h3>
      <p>By {book.author}</p>
      <Link to={`/book/${book.id}`}>Read Book</Link>
      <br />
      {showEditLink ? (
        <Link to={`/book/${book.id}/editor`} className="edit-button">
          Edit Book
        </Link>
      ) : null}
    </div>
  );
}

export default BookCard;
