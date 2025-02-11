import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getAuthorDetails, getAuthorBooks } from '../services/api';

function Profile() {
  const { authorId } = useParams();
  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadAuthorData = async () => {
      try {
        const authorDetails = await getAuthorDetails(authorId);
        setAuthor(authorDetails);

        const authorBooks = await getAuthorBooks(authorId);
        setBooks(authorBooks.books);
      } catch (e) {
        alert('Failed to load author data.');
      }
    };

    loadAuthorData();

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [authorId]);

  if (!author || !books.length) return <div>Loading...</div>;

  return (
    <div className="profile">
      <h1>{author.first_name} {author.last_name}'s Profile</h1>
      <p>{author.bio}</p>
      <h3>{author.first_name}'s books:</h3>

      <BookGrid books={books} showEditLink={user} />
    </div>
  );
}

export default Profile;
