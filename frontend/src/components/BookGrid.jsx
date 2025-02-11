import React from 'react';
import BookCard from './BookCard';

function BookGrid({ books , showEditLink}) {
  return (
    <div className="book-list">
      {books.map(book => (
        <BookCard key={book.bookId} book={book} showEditLink= {showEditLink}/>
      ))}
    </div>
  );
}

export default BookGrid;
