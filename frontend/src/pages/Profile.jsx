import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BookList from '../components/BookList';

function Profile() {
  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const { authorId } = useParams();

  useEffect(() => {
    // Fetch author and their books
    const fetchAuthorAndBooks = async () => {
      // Replace with actual API calls
      const authorResponse = await fetch(`https://api.example.com/authors/${authorId}`);
      const authorData = await authorResponse.json();
      setAuthor(authorData);

      const booksResponse = await fetch(`https://api.example.com/books?authorId=${authorId}`);
      const booksData = await booksResponse.json();
      setBooks(booksData);
    };

    fetchAuthorAndBooks();
  }, [authorId]);

  if (!author) return <div>Loading...</div>;

  return (
    <div className="profile">
      <h1>{author.name}'s Profile</h1>
      <p>{author.bio}</p>
      <h2>Books by {author.name}</h2>
      <BookList books={books} />
    </div>
  );
}

export default Profile;
