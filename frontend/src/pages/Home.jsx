import React, { useState, useEffect } from 'react';
import BookGrid from '../components/BookGrid';
import { getPublishedBooks } from '../services/api';

function Home() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const response = await getPublishedBooks(10); // Get 10 published books
        setBooks(response.books); 
      } catch (error) {
        alert('FAILED TO LOAD BOOKS');
      }
    };
    loadBooks();
  }, []);

  return (
    <div className="home">
      <h1>Welcome to Chaptre</h1>
      <BookGrid books={books} showEditLink={false} />
    </div>
  );
}

export default Home;
