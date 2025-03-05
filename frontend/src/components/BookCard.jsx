import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../BookCard.css';
import '../Modal.css';
import defaultBookCover from "../assets/default-book-cover.jpg";

function BookCard({ book, showEditLink }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState('right');
  const maxVisibleTags = 2;
  const linkPath = showEditLink ? `/book/${book.id}/editor` : `/book/${book.id}`;
  const cardRef = useRef(null); 
  const modalRef = useRef(null);

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

  return (
    <div
        className="book-card-container"
        onMouseEnter={() => setIsModalOpen(true)}
        onMouseLeave={() => setIsModalOpen(false)}
        ref={cardRef}
    >
      <div className="book-card">
        <Link to={linkPath}>
          <img src={book.cover_image_url || defaultBookCover} alt="Cover Not Found" />
          <h3>{book.book_title}</h3>
          <p>
            By <Link to={`/profile/${book.author_id}`} className="author-link" title="View Author's Profile">
              {book.author}
            </Link>
          </p>
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
        </Link>
      </div>
        {isModalOpen && (
          <div
              className={`card-modal-content ${modalPosition}`}
              ref={modalRef}
          >
            <h3 className="truncate">{book.book_title}</h3>
            <p className="truncate">By {book.author}</p>
            <div className="genre-container">
              {book.genre_tags.map((genre, index) => (
                <span key={index} className="genre-bubble">
                  {genre}
                </span>
              ))}
            </div>
            <p className="truncate-synopsis">{book.book_synopsis}</p>

          </div>
        )}
      </div>
  );
}

export default BookCard;