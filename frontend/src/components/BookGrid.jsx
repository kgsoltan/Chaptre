import React, { useState } from 'react';
import BookCard from './BookCard';

import './BookGrid.css'


function BookGrid({ books, showEditLink, booksPerPage }) {
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  const totalPages = Math.ceil(books.length / booksPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <div className="book-list">
        {currentBooks.map((book) => (
          <BookCard key={book.id} book={book} showEditLink={showEditLink} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="prev-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>{`Page ${currentPage} of ${totalPages}`}</span>
          <button
            className="next-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}

export default BookGrid;
