import React from 'react';
import { Link } from 'react-router-dom';

function BookCard({ book }) {
  return (
    <div className="book-card">
      <img src={book.coverImage} alt={"Image Not Found"} />
      <h3>{book.title}</h3>
      <p>By {book.author}</p>
      <Link to={`/book/${book.bookId}`}>Read Book</Link>
    </div>
  );
}

export default BookCard;
