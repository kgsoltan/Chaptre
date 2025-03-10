import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import { getPublishedBooks, searchBooks } from '../services/api';
import SearchBar from '../components/SearchBar'
import Sidebar from '../components/Sidebar';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import './Home.css'

function Home() {
  const [books, setBooks] = useState([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q');
  const genreFilter = useMemo(() => searchParams.getAll('genre'), [location.search]);

  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

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

  const topRatedBooks = useMemo(() => {
    if (books.length > 0) {
      return books
        .filter(book => book.sum_ratings > 0)
        .sort((a, b) => {
          const avgRatingA = a.sum_ratings / a.count_comments;
          const avgRatingB = b.sum_ratings / b.count_comments;
          return avgRatingB - avgRatingA;
        })
        .slice(0, 10);
    }
    return [];
  }, [books]);

  return (
    <div className="home">
      {user && <Sidebar/> }
      <div className={user ? "home-book-grid-logged-in" : "home-book-grid-logged-out"}>
        <h1> Books </h1>
        {!searchQuery && genreFilter.length <=0 && topRatedBooks.length > 0  && <h3> Top Rated</h3>}
        {!searchQuery && genreFilter.length <=0 && topRatedBooks.length > 0 && user ? (
          <BookGrid books={topRatedBooks} showEditLink={false} booksPerPage={4} />
        ) : !searchQuery && genreFilter.length <=0 && topRatedBooks.length > 0 ? (
          <BookGrid books={topRatedBooks} showEditLink={false} booksPerPage={5} />
        ) : !searchQuery && genreFilter.length <=0 && (
          <p>No top rated books available.</p>
        )}

        {books.length > 0 ? (
          <>
            <h3 className='search-description'>
              {searchQuery || genreFilter.length > 0
                ? `Search Results for ${searchQuery ? `"${searchQuery}"` : ''}
                ${searchQuery && genreFilter.length > 0 ? ' and ' : ''}${genreFilter.join(', ')}`
                : 'All Books'}
            </h3>
            <BookGrid books={books} showEditLink={false} booksPerPage={15} />
          </>
        ) : (
          <>
            <h3 className='search-description'>
              {searchQuery || genreFilter.length > 0
                ? `Search Results for ${searchQuery ? `"${searchQuery}"` : ''}
                ${searchQuery && genreFilter.length > 0 ? ' and ' : ''}${genreFilter.join(', ')}`
                : 'All Books'}
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
