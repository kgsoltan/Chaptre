import React from 'react';
import { Link } from 'react-router-dom';

function BookCard({ book }) {
  return (
    <Link to={`/book/${book.bookId}`} className="book-card">
      <img src={book.coverImage} alt={"Image Not Found"} />
      <h3>{book.title}</h3>
      <p>By {book.author}</p>
    </Link>
  );
}

export default BookCard;
