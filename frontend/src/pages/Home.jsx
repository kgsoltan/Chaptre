import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import { getPublishedBooks, searchBooks, getPublishedBooksChunk, getTopRated } from '../services/api';
import Sidebar from '../components/Sidebar';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import './Home.css';

function Home() {
  const [books, setBooks] = useState([]);
  const [lastDocId, setLastDocId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [topRatedBooks, setTopRatedBooks] = useState([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q');
  const genreFilter = useMemo(() => searchParams.getAll('genre'), [location.search]);
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const observerRef = useRef(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);


  useEffect(() => {
    const loadTopRatedBooks = async () => {
      try {
        const response = await getTopRated(10);
        setTopRatedBooks(response);
      } catch (err) {
        console.error('FAILED TO LOAD TOP RATED BOOKS:', err);
        alert('FAILED TO LOAD TOP RATED BOOKS');
      }
    };
    
    if (!searchQuery && genreFilter.length === 0) {
      loadTopRatedBooks();
    }
  }, [searchQuery, genreFilter]);

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      try {
        const response = searchQuery || genreFilter.length > 0
          ? await searchBooks(searchQuery, genreFilter)
          : await getPublishedBooks(15);
        
        setBooks(response);
        if (response.length > 0) {
          setLastDocId(response[response.length - 1].id);
          setHasMore(true);
        } else {
          setHasMore(false);
        }
      } catch (err) {
        console.error('FAILED TO LOAD BOOKS:', err);
        alert('FAILED TO LOAD BOOKS');
      }
      setLoading(false);
    };
    loadBooks();
  }, [searchQuery, genreFilter]);

  const loadMoreBooks = useCallback(async () => {
    if (loading || searchQuery || genreFilter.length > 0 || !lastDocId || !hasMore) return;
    setLoading(true);
    try {
      const response = await getPublishedBooksChunk(lastDocId);
      if (response.books.length > 0) {
        setBooks(prevBooks => [...prevBooks, ...response.books]);
        setLastDocId(response.lastDocId);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('FAILED TO LOAD MORE BOOKS:', err);
      alert('FAILED TO LOAD MORE BOOKS');
    }
    setLoading(false);
  }, [lastDocId, loading, searchQuery, genreFilter, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMoreBooks();
      }
    }, { threshold: 1.0 });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMoreBooks]);

  return (
    <div className="home">
      {user && <Sidebar />}
      <div className={user ? "home-book-grid-logged-in" : "home-book-grid-logged-out"}>
        <h1>Books</h1>
        {!searchQuery && genreFilter.length === 0 && topRatedBooks.length > 0 && <h3>Top Rated</h3>}
        {!searchQuery && genreFilter.length === 0 && topRatedBooks.length > 0 && (
          <BookGrid books={topRatedBooks} showEditLink={false} booksPerPage={user ? 4 : 5} />
        )}
        {books.length > 0 ? (
          <>
            <h3 className='search-description'>
              {searchQuery || genreFilter.length > 0
                ? `Search Results for ${searchQuery ? `"${searchQuery}"` : ''} ${searchQuery && genreFilter.length > 0 ? ' and ' : ''}${genreFilter.join(', ')}`
                : 'All Books'}
            </h3>
            <BookGrid books={books} showEditLink={false} booksPerPage={0} />
          </>
        ) : (
          <>
            <h3 className='search-description'>
              {searchQuery || genreFilter.length > 0
                ? `Search Results for ${searchQuery ? `"${searchQuery}"` : ''} ${searchQuery && genreFilter.length > 0 ? ' and ' : ''}${genreFilter.join(', ')}`
                : 'All Books'}
            </h3>
            <p>
              {searchQuery || genreFilter.length > 0
                ? 'No books match your search...'
                : 'There are no books on the website...'}
            </p>
          </>
        )}
        <div ref={observerRef} style={{ height: '20px', marginBottom: '20px' }}></div>
        {loading && <p>Loading more books...</p>}
      </div>
    </div>
  );
}

export default Home;