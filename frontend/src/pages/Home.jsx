import React, { useState, useEffect } from 'react';
import BookGrid from '../components/BookGrid';
import { getPublishedBooks } from '../services/api';

function Home() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const response = await getPublishedBooks(25);
        setBooks(response);
      } catch (error) {
        alert('FAILED TO LOAD BOOKS');
      }
    };
    loadBooks();
  }, []);

  return (
    <div className="home">
      <h1>Welcome to Chaptre</h1>
      {books ? <BookGrid books={books} showEditLink={false} /> : <p>Theres no books on the website...</p>}
    </div>
  );
}

export default Home;
