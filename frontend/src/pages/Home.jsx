import React, { useState, useEffect } from 'react';
import BookList from '../components/BookList';

function Home() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    // Fetch books from an API or load from a local data source
    const fetchBooks = async () => {
      // Replace with actual API call
      const response = await fetch('https://api.example.com/books');
      const data = await response.json();
      setBooks(data);
    };

    fetchBooks();
  }, []);

  return (
    <div className="home">
      <h1>Welcome to Chaptre</h1>
      <BookList books={books} />
    </div>
  );
}

export default Home;
