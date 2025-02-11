import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import { getAllBooks, getAuthorProfileByID } from '../services/api';
import { getAuth, onAuthStateChanged } from "firebase/auth";

function Profile() {
  const [author, setAuthor] = useState([]);
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);  // Track current user
  const { authorId } = useParams();
  
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); 
  }, []);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const authorProfile = await getAuthorProfileByID(authorId)
        setAuthor(authorProfile);
      } catch(e){
        alert("FAILED TO LOAD AUTHOR");
      }
    }
    fetchAuthor();

    const fetchBooks = async () => {
      try {
        // Fetch all books
        const allBooks = await getAllBooks();

        const authorBooks = allBooks.books.filter(b => b.authorID === authorId);
        setBooks(authorBooks);
      } catch(e){
        alert("FAILED TO LOAD BOOKS");
      }
    }
    fetchBooks();
    
  }, [authorId]);

  if (!author) return <div>Loading...</div>;

  return (
    <div className="profile">
      <h1>{author.name}'s Profile</h1>
      <p>{author.bio}</p>
      <h3>{author.name}'s books:</h3>

      {user ? (
        <BookGrid books={books} showEditLink={true} />
      ) : (
        <BookGrid books={books} showEditLink={false} />
      )}
    </div>
  );
}

export default Profile;
