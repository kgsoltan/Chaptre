import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../BookCard.css';
import '../Modal.css';
import defaultBookCover from "../assets/default-book-cover.jpg";
import { getChapters, getComments } from '../services/api';

function BookCard({ book, showEditLink }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState('right');
  const maxVisibleTags = 1;
  const linkPath = showEditLink ? `/book/${book.id}/editor` : `/book/${book.id}`;
  const cardRef = useRef(null); 
  const modalRef = useRef(null);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const chapters = await getChapters(book.id);
        let totalRating = 0;
        let totalComments = 0;

        for (const chapter of chapters) {
          const comments = await getComments(book.id, chapter.id);
          comments.forEach(comment => {
            if (comment.rating) {
              totalRating += comment.rating;
              totalComments++;
            }
          });
        }

        if (totalComments > 0) {
          setAverageRating((totalRating / totalComments).toFixed(1));
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    fetchRatings();
  }, [book.id]);

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
          {averageRating > 0 ? (
            <p className="star">
              <span style={{ color: 'gold' }}>{"★".repeat(Math.round(averageRating))}</span>
              <span style={{ color: 'gray' }}>{"★".repeat(5 - Math.round(averageRating))}</span>
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
        </Link>
      </div>
        {isModalOpen && (
          <div
              className={`card-modal-content ${modalPosition}`}
              ref={modalRef}
          >
            <h3 className="truncate">{book.book_title}</h3>
            <p className="truncate">By {book.author}</p>
            {averageRating > 0 ? (
            <p className="star">
              <span style={{ color: 'gold' }}>{"★".repeat(Math.round(averageRating))}</span>
              <span style={{ color: 'gray' }}>{"★".repeat(5 - Math.round(averageRating))}</span>
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