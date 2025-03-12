import { useState } from 'react';
import BookCard from './BookCard';
import './BookGrid.css';

function BookGrid({ books, showEditLink, booksPerPage }) {
  const [currentPage, setCurrentPage] = useState(1);

  const currentBooks =
    booksPerPage === 0
      ? books
      : books.slice((currentPage - 1) * booksPerPage, currentPage * booksPerPage);

  const totalPages = booksPerPage === 0 ? 1 : Math.ceil(books.length / booksPerPage);

  const enablePages = booksPerPage !== 0;

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
      {enablePages && totalPages > 1 && (
        <div className="pagination">
          <button
            className="prev-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className='page-number'>{`Page ${currentPage} of ${totalPages}`}</span>
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
