import { Link } from 'react-router-dom';
import '../EditBook.css';

function BookCard({ book, showEditLink }) {
  const maxVisibleTags = 1;

  return (
    <div className="book-card">
      <Link to={`/book/${book.id}`}>
        <img src={book.cover_image_url} alt="Cover Not Found" />
        <h3>{book.book_title}</h3>
        <p>By {book.author}</p>
      <div className="genre-container">
        {book.genre_tags.slice(0, maxVisibleTags).map((genre, index) => (
          <span key={index} className="genre-bubble">
            {genre}
          </span>
        ))}
        {book.genre_tags.length > maxVisibleTags && (
          <span className="genre-overflow">
            +{book.genre_tags.length - maxVisibleTags}
          </span>
        )}
      </div>
      </Link>
      <br />
      {showEditLink && (
        <Link to={`/book/${book.id}/editor`} className="nav-item">
          Edit Book
        </Link>
      )}
    </div>
  );
}

export default BookCard;
