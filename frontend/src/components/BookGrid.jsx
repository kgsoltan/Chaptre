import React from 'react';
import BookCard from './BookCard';

function BookGrid({ books }) {
  return (
    <div className="book-list">
      {books.map(book => (
        <BookCard key={book.bookId} book={book} />
      ))}
    </div>
  );
}

export default BookGrid;
