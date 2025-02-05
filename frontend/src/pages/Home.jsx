import React, { useState, useEffect } from 'react';
import BookGrid from '../components/BookGrid';
import { getAllBooks } from '../services/api';
import axios from 'axios';

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

  const [booksAPI, setBooksAPI] = useState([]);

  useEffect(() => {
    fetchBooksAPI();
  }, []);

  const fetchBooksAPI = async () => {
    try {
      const response = await axios.get('http://localhost:5001/books');
      setBooksAPI(response.data);
    } catch (error) {
      console.error('Error fetching booksAPI:', error);
    }
  };

  return (
    <div className="home">
      <h1 className='home-header'>All Books</h1>
      <div className="book-list">
        <BookGrid books={books} />
      </div>

    <h1>All Books</h1>
    <ul>
      {booksAPI.map((book) => (
        <li key={book.id}>
          <h2>{book.book_title}</h2>
          <p>Author: {book.author}</p>
          <p>Published: {book.is_published ? 'Yes' : 'No'}</p>
          <p>Chapters: {book.num_chapters}</p>
          <p>Drafts: {book.num_drafts}</p>
          <p>Date: {book.date}</p>
          <img src={book.cover_image_url} alt={`Cover for ${book.book_title}`} />
          <p>Genres: {book.genre_tags.join(', ')}</p>
        </li>
      ))}
    </ul>
    </div>
  );
}

export default Home;