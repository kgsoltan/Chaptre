import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import defaultBookCover from "../assets/default-cover.jpg";
import './BookCard.css';

function BookCard({ book, showEditLink }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState('right');
  const maxVisibleTags = 1;
  const linkPath = showEditLink ? `/book/${book.id}/editor` : `/book/${book.id}`;
  const cardRef = useRef(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkModalPosition = () => {
      if (!isModalOpen || !cardRef.current || !modalRef.current) return;

      const cardRect = cardRef.current.getBoundingClientRect();
      const modalWidth = modalRef.current.offsetWidth;
      const windowWidth = window.innerWidth;

      if (cardRect.right + modalWidth > windowWidth) {
        setModalPosition('left');
      } else {
        setModalPosition('right');
      }
    };

    checkModalPosition();

    window.addEventListener('resize', checkModalPosition);

    return () => {
      window.removeEventListener('resize', checkModalPosition);
    };
  }, [isModalOpen]);

  const handleClick = useCallback(() => {
    window.scrollTo(0, 0);
    navigate(linkPath);
  }, [navigate, linkPath]);

  return (
    <div
      className="book-card-container"
      onMouseEnter={() => setIsModalOpen(true)}
      onMouseLeave={() => setIsModalOpen(false)}
      ref={cardRef}
    >
      <div className="book-card">
        <div onClick={handleClick} style={{ cursor: 'pointer' }}>
          <img
            src={book.cover_image_url || defaultBookCover}
            alt="Cover Not Found"
            onError={(e) => { e.target.src = defaultBookCover; }}
          />
          <h3>{book.book_title}</h3>
        </div>
        <p>
          By{' '}
          <Link to={`/profile/${book.author_id}`} className="author-link" title="View Author's Profile">
            {book.author}
          </Link>
        </p>
        {book.average_rating > 0 ? (
          <p className="star">
            <span style={{ color: 'gold' }}>{"★".repeat(Math.round(book.average_rating))}</span>
            <span style={{ color: 'gray' }}>{"★".repeat(5 - Math.round(book.average_rating))}</span>
          </p>
        ) : (
          <p className="star">
            <span style={{ marginLeft: '5px', color: 'gray' }}>Not enough ratings</span>
          </p>
        )}
        <div className="genre-container">
          {book.genre_tags.slice(0, maxVisibleTags).map((genre, index) => (
            <span key={index} className="genre-bubble">
              {genre}
            </span>
          ))}
          {book.genre_tags.length > maxVisibleTags && (
            <span className="genre-overflow">
              +{book.genre_tags.length - maxVisibleTags} more
            </span>
          )}
        </div>
      </div>
      {isModalOpen && (
        <div
          className={`card-modal-content ${modalPosition}`}
          ref={modalRef}
        >
          <h3 className="truncate">{book.book_title}</h3>
          <p className="truncate">By {book.author}</p>
          {book.average_rating > 0 ? (
            <p className="star">
              <span style={{ color: 'gold' }}>{"★".repeat(Math.round(book.average_rating))}</span>
              <span style={{ color: 'gray' }}>{"★".repeat(5 - Math.round(book.average_rating))}</span>
            </p>
          ) : (
            <p className="star">
              <span style={{ marginLeft: '5px', color: 'gray' }}>Not enough ratings</span>
            </p>
          )}
          <div className="genre-container">
            {book.genre_tags.map((genre, index) => (
              <span key={index} className="genre-bubble">
                {genre}
              </span>
            ))}
          </div>
          <p className="truncate-synopsis">
            {book.book_synopsis ? book.book_synopsis : "No synopsis available."}
          </p>
        </div>
      )}
    </div>
  );
}

export default BookCard;