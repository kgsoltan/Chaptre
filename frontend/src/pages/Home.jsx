import React, { useState, useEffect } from 'react';
import BookGrid from '../components/BookGrid';
import { getAllBooks } from '../services/api';
import axios from 'axios';

function Home() {
  // const [books, setBooks] = useState([]);
  // useEffect(() => {
  //   const loadAllBooks = async () => {
  //     try {
  //       const allBooks = await getAllBooks()
  //       setBooks(allBooks.books)
  //     } catch(e){
  //       alert("FAILED TO LOAD BOOKS")
  //     }
  //   }
  //   loadAllBooks()
  // }, [])

  // return (
  //   <div className="home">
  //     <h1>Welcome to Chaptre</h1>
  //     <BookGrid books={books} />
  //   </div>
  // );

  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:5001/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  return (
    <div>
      <h1>All Books</h1>
      <ul>
        {books.map((book) => (
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