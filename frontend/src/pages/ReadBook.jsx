import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ReadBook() {
  const [book, setBook] = useState(null);
  const { bookId } = useParams();

  useEffect(() => {
    // Fetch book content
    const fetchBook = async () => {
      // Replace with actual API call
      const response = await fetch(`https://api.example.com/books/${bookId}`);
      const data = await response.json();
      setBook(data);
    };

    fetchBook();
  }, [bookId]);

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
