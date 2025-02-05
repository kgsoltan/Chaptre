import React, { useState, useEffect } from 'react';
import BookGrid from '../components/BookGrid';
import { getAllBooks } from '../services/api';

function Home() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await getAllBooks(); // Assuming response format is { books: [...] }
      const sortedBooks = response.books.sort((a, b) => a.title.localeCompare(b.title));
      setBooks(sortedBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  return (
    <div className="home">
      <h1 className='home-header'>All Books</h1>
      <div className="book-list">
        <BookGrid books={books} />
      </div>
    </div>
  );
}

export default Home;
