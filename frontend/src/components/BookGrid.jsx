import React from 'react';
import BookCard from './BookCard';

function BookGrid({ books, showEditLink }) {
  return (
    <div className="book-list">
      {books.map((book) => (
        <BookCard key={book.id} book={book} showEditLink={showEditLink} />
      ))}
    </div>
  );
}

export default BookGrid;
