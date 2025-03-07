import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import { getPublishedBooks, searchBooks } from '../services/api';
import SearchBar from '../components/SearchBar'
import Sidebar from '../components/Sidebar';

import './Home.css'

function Home() {
  const [books, setBooks] = useState([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q');
  const genreFilter = useMemo(() => searchParams.getAll('genre'), [location.search]);

  useEffect(() => {
    const loadBooks = async () => {
      if (!searchQuery && genreFilter.length === 0) {
        try {
          const response = await getPublishedBooks(15);
          setBooks(response);
        } catch (err) {
          alert('FAILED TO LOAD BOOKS: ', err);
        }
      } else {
        try {
          const response = await searchBooks(searchQuery, genreFilter);
          setBooks(response);
        } catch (err) {
          alert('FAILED TO LOAD SEARCH RESULTS ', err);
        }
      }
    };

    loadBooks();
  }, [searchQuery, genreFilter]);

  return (
    <div className="home">
      <Sidebar/>
      <div className="home-book-grid">
      <div className='home-header'>
        <h1 className='Homebookmargin'>
          Books
        </h1>
      </div>
        {books.length > 0 ? (
          <BookGrid books={books} showEditLink={false} booksPerPage={15} />
        ) : (
          <>
            <h3>
              {searchQuery || genreFilter.length > 0
                ? `Search Results for "${searchQuery || genreFilter.join(', ')}"`
                : 'Books:'}
            </h3>
            <p>
              {searchQuery || genreFilter.length > 0
                ? 'No books match your search...'
                : 'There are no books on the website...'}
            </p>
          </>
        )}
      </div>

    </div>
  );
}

export default Home;
