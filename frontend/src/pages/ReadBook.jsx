import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';


function ReadBook() {

  return (
    <div className="read-book">
      <h1>{book.title}</h1>
      <h2>By {book.author}</h2>
      <div className="book-content">
        {<p>TO DO</p>}
      </div>
    </div>
  );
}

export default ReadBook;
