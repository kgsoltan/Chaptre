import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getBookContentByBookID } from '../services/api';

function ReadBook() {
  const [book, setBook] = useState([]);
  const { bookId } = useParams();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const allBooks = await getBookContentByBookID(bookId)
        setBook(allBooks)
      } catch(e){
        alert("FAILED TO LOAD BOOK")
      }
    }
    fetchBook()
  }, [bookId])

  if (!book) return <div>Loading...</div>;

  return (
    <div className="read-book">
      <h1>{book.title}</h1>
      <h2>By {book.author}</h2>
      <div className="book-content">
        {book.content}
      </div>
    </div>
  );
}

export default ReadBook;
