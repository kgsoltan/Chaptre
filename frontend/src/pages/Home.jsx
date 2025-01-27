import React, { useState, useEffect } from 'react';
import BookList from '../components/BookGrid';
import { getAllBooks } from '../services/api';

function Home() {
  const [books, setBooks] = useState([]);
  useEffect(() => {
    const loadAllBooks = async () => {
      try {
        const allBooks = await getAllBooks()
        setBooks(allBooks)
      } catch(e){
        alert("FAILED TO LOAD BOOKS")
      }
    }
    loadAllBooks()
  }, [])

  return (
    <div className="home">
      <h1>Welcome to Chaptre</h1>
      <BookList books={books} />
    </div>
  );
}

export default Home;
