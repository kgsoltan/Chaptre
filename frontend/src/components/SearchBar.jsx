import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

// Predefined genres for selection
const genreOptions = [
    { value: "Fantasy", label: "Fantasy" },
    { value: "Sci-Fi", label: "Sci-Fi" },
    { value: "Mystery", label: "Mystery" },
    { value: "Romance", label: "Romance" },
    { value: "Horror", label: "Horror" },
    { value: "Comedy", label: "Comedy" },
    { value: "Action", label: "Action" },
    { value: "Adventure", label: "Adventure" },
    { value: "Drama", label: "Drama" },
    { value: "Coming of age", label: "Coming of age" },
    { value: "Fiction", label: "Fiction" },
    { value: "Non-Fiction", label: "Non-Fiction" },
  ];

function SearchBar() {
  const [query, setQuery] = useState(""); 
  const [selectedGenres, setSelectedGenres] = useState([]);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();

    if (query.trim()) {
      searchParams.append("q", query);
    }

    if (selectedGenres.length > 0) {
      selectedGenres.forEach((genre) => searchParams.append("genre", genre.value));
    }

    navigate(`/search?${searchParams.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="search-bar">
      <input
        type="text"
        placeholder="Search by title or author..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="search-input"
      />
      <Select
        options={genreOptions}
        placeholder="Select genres"
        isMulti
        isClearable
        value={selectedGenres}
        onChange={setSelectedGenres}
        className="search-select"
      />
      <button type="submit" className="nav-item search-btn">Search</button>
    </form>
  );
}

export default SearchBar;