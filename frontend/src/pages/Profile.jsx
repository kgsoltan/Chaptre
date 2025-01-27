import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BookList from '../components/BookGrid';
import { getAuthorProfileByID } from '../services/api';

function Profile() {
  const [author, setAuthor] = useState([]);
  const { authorID } = useParams();

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const authorProfile = await getAuthorProfileByID(authorID)
        setAuthor(authorProfile)
      } catch(e){
        alert("FAILED TO LOAD BOOK")
      }
    }
    fetchAuthor()
  }, [authorID])

  if (!author) return <div>Loading...</div>;

  return (
    <div className="profile">
      <h1>{author.name}'s Profile</h1>
      <p>{author.bio}</p>
    </div>
  );
}

export default Profile;
