import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import { getPublishedBooks, searchBooks } from '../services/api';

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
      <h1>
        {searchQuery || genreFilter.length > 0
          ? `Search Results for "${searchQuery || genreFilter.join(', ')}"`
          : 'Welcome to Chaptre'}
      </h1>
      {books.length > 0 ? (
        <BookGrid books={books} showEditLink={false} />
      ) : (
        <p>{searchQuery || genreFilter.length > 0 ? 'No books match your search...' : 'There are no books on the website...'}</p>
      )}
    </div>
  );
}

export default Home;
