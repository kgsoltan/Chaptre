import React from 'react';
import { Link } from 'react-router-dom';

function BookCard({ book, showEditLink }) {
  return (
    <div className="book-card">
      <img src={book.coverImage} alt="Image Not Found" />
      <h3>{book.title}</h3>
      <p>By {book.author}</p>
      <Link to={`/book/${book.bookId}`}>Read Book</Link>
      <br></br>
      {showEditLink ? <Link to={`/book/${book.bookId}/editor`} className="edit-button">Edit Book</Link> : null}
    </div>
  );
}

export default BookCard;
