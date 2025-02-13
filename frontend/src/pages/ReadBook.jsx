import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';


function ReadBook() {

  return (
    <div className="read-book">
      <h1>{book.title}</h1>
      <h2>By {book.author}</h2>
      <div className="genre-container">
        {book.genre_tags.map((genre, index) => (
          <span key={index} className="genre-bubble">
            {genre}
          </span>
        ))}
      </div>
      <div className="book-content">
        {<p>TO DO</p>}
      </div>
    </div>
  );
}

export default ReadBook;
