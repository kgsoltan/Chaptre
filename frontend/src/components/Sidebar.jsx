import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getAuthorDetails, getBookDetails, getFollowing } from '../services/api';
import { auth } from '../services/firebaseConfig';
import './Sidebar.css';

const Sidebar = () => {
  const [favoritedBooks, setFavoritedBooks] = useState([]);
  const [favoritedAuthors, setFavoritedAuthors] = useState([]);
  const [user, setUser] = useState(null);
  const auth = getAuth();

  // Function to fetch favorited books
  const getFavoritedBooks = async (favoritedBookIds) => {
    try {
      const favoritedBooksData = [];
      for (const bookId of favoritedBookIds || []) {
        try {
          const book = await getBookDetails(bookId);
          favoritedBooksData.push(book);
        } catch (error) {
          console.error(`Error fetching book ${bookId}:`, error);
        }
      }
      setFavoritedBooks(favoritedBooksData);
    } catch (error) {
      console.error("Error fetching favorited books:", error);
    }
  };

  // Function to fetch favorited authors
  const getFavoritedAuthors = async (favoritedAuthorIds) => {
    try {
      const favoritedAuthorsData = [];
      for (const authorId of favoritedAuthorIds || []) {
        try {
          const author = await getAuthorDetails(authorId);
          favoritedAuthorsData.push(author);
        } catch (error) {
          console.error(`Error fetching author ${authorId}:`, error);
        }
      }
      setFavoritedAuthors(favoritedAuthorsData);
    } catch (error) {
      console.error("Error fetching favorited authors:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDetails = await getAuthorDetails(currentUser.uid);
        if (userDetails.favorited_books?.length > 0) {
          console.log(userDetails.favorited_books)
          await getFavoritedBooks(userDetails.favorited_books);
        }
        if (userDetails.following?.length > 0) {
          console.log(userDetails.following)
          await getFavoritedAuthors(userDetails.following);
        }
      } else {
        setFavoritedBooks([]);
        setFavoritedAuthors([]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        {user ? (
          <>
            <div className="sidebar-section">
              <h4 className="sidebar-section-title">Saved Books</h4>
              {favoritedBooks.length > 0 ? (
                <ul className="sidebar-list">
                  {favoritedBooks.map((book) => (
                    <li key={book.id} className="sidebar-list-item">
                      <Link to={`/book/${book.id}`} className="sidebar-item">
                        <span className="sidebar-label">{book.book_title || book.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="sidebar-empty">No saved books yet.</p>
              )}
            </div>


            <div className="sidebar-section">
              <h4 className="sidebar-section-title">Saved Authors</h4>
              {favoritedAuthors.length > 0 ? (
                <ul className="sidebar-list">
                  {favoritedAuthors.map((author) => (
                    <li key={author.id} className="sidebar-list-item">
                      <Link to={`/profile/${author.id}`} className="sidebar-item">
                        <span className="sidebar-label">{`${author.first_name} ${author.last_name}`}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="sidebar-empty">No saved authors yet.</p>
              )}
            </div>
          </>
        ) : (
          <>

            <div className="sidebar-section">
              <h4 className="sidebar-section-title">Saved Books</h4>
              <p className="sidebar-empty">Log in to view</p>
            </div>
            <div className="sidebar-section">
              <h4 className="sidebar-section-title">Saved Authors</h4>
              <p className="sidebar-empty">Log in to view</p>
            </div>
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;