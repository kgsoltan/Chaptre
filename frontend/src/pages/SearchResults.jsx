import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import BookGrid from "../components/BookGrid"; // Your grid component to display the books
import { searchBooks } from "../services/api"; // Function to fetch books from Firestore

function SearchResults() {
  const [books, setBooks] = useState([]);
  const location = useLocation(); // Get current URL for search query
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("q"); // Get title/author query
  const genreFilter = useMemo(() => searchParams.getAll("genre"), [location.search]); //get filtered genres


  useEffect(() => {
    const loadBooks = async () => {
      if (!searchQuery && genreFilter.length === 0) return; 

      try {
        const response = await searchBooks(searchQuery, genreFilter); 
        setBooks(response);
      } catch (error) {
        alert("FAILED TO LOAD SEARCH RESULTS");
      }
    };

    loadBooks();
  }, [searchQuery, genreFilter]); // Rerun on query change

  return (
    <div className="home">
      <h1>Search Results for "{searchQuery || genreFilter.join(", ")}"</h1>
      {books.length > 0 ? (
        <BookGrid books={books} showEditLink={false} />
      ) : (
        <p>No books match your search...</p>
      )}
    </div>
  );
}

export default SearchResults;