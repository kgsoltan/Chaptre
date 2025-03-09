import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getChapterDetails, getAuthorDetails, getChapters, getComments, deleteComment, updateFavoriteBooks, getBookDetails } from "../services/api";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import NewCommentModal from '../components/NewCommentModal';
import "./ReadBook.css"

import defaultBookCover from "../assets/default-book-cover.jpg";

function ReadBook() {
  const [book, setBook] = useState(null)
  const { bookId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [chapterContent, setChapterContent] = useState("");
  const [selectedChapterName, setSelectedChapterName] = useState("");
  const [comments, setComments] = useState([]);
  const [selectedComment, setSelectedComment] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [chapterPage, setChapterPage] = useState(1);
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const [error, setError] = useState(null);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [loading, setLoading] = useState(false); // Added loading state
  const wordsPerPage = 400;
  const [averageRating, setAverageRating] = useState(0);
  
  const updateRating = async (book) => {
    if (book.count_comments && book.count_comments > 0) {
      setAverageRating((book.sum_ratings / book.count_comments).toFixed(1));
    } else {
      setAverageRating(0);
    }
  };

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const fetchedBook = await getBookDetails(bookId);
        setBook(fetchedBook);
        setSelectedChapter("cover");
        setSelectedChapterName("cover");
        setChapterContent("");
        updateRating(fetchedBook);
      } catch (error) {
        console.error("Failed to fetch book details:", error);
      }
    };
  
    fetchBookDetails();
  }, [bookId]);

  useEffect(() => {
    if (book) {
      updateRating(book);
    }
  }, [book]);

  // Fetch the user on component mount
  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Fetch chapters and comments on bookId change
  useEffect(() => {
    const fetchChapters = async () => {
      setLoading(true); // Set loading to true when fetching chapters
      try {
        const chapterList = await getChapters(bookId);
        const publishedChapterList = chapterList.filter((chapter) => chapter.is_published);
        setChapters(publishedChapterList);
      } catch (error) {
        console.error("Failed to fetch chapters:", error);
      } finally {
        setLoading(false); // Set loading to false after chapters are fetched
      }
    };

    fetchChapters();
  }, [bookId]);

  // Fetch favorite books from the author details and set the initial state
  useEffect(() => {
    const fetchFavoriteBooks = async () => {
      if (!user) return;

      setLoading(true); // Set loading to true when fetching favorite books
      try {
        const authorDetails = await getAuthorDetails(user.uid);
        const currentFavorites = Array.isArray(authorDetails.favorited_books)
          ? [...authorDetails.favorited_books]
          : [];
        setFavoriteBooks(currentFavorites);
      } catch (error) {
        console.error("Failed to fetch favorite books:", error);
      } finally {
        setLoading(false); // Set loading to false after favorite books are fetched
      }
    };

    fetchFavoriteBooks();
  }, [user]);

  // Handle toggling favorite book
  const handleFavoriteBooks = async (bookId) => {
    setLoading(true); // Set loading to true while handling the favorite book

    try {
      if (!user) {
        setError("User not found");
        alert("User not found. Please log in.");
        return;
      }

      const authorId = user.uid;

      if (!authorId) {
        setError("Author not found");
        alert("Author not found");
        return;
      }

      const authorDetails = await getAuthorDetails(authorId);
      const currentFavorites = Array.isArray(authorDetails.favorited_books)
        ? [...authorDetails.favorited_books]
        : [];

      let updatedFavorites;
      if (currentFavorites.includes(bookId)) {
        // Remove book from favorites (unfavorite)
        updatedFavorites = currentFavorites.filter((id) => id !== bookId);
        alert("Book removed from favorites.");
      } else {
        // Add book to favorites (favorite)
        updatedFavorites = [...currentFavorites, bookId];
        alert("Book added to favorites.");
      }

      setFavoriteBooks(updatedFavorites);
      await updateFavoriteBooks(authorId, updatedFavorites);
    } catch (err) {
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false); // Set loading to false after favorite book operation completes
    }
  };

  // Fetch chapter content for selected chapter
  const fetchChapterContent = async (chapterId) => {
    setLoading(true); // Set loading to true when fetching chapter content

    try {
      const chapterData = await getChapterDetails(bookId, chapterId);
      setSelectedChapter(chapterId);
      setSelectedChapterName(chapterData.title);
      setChapterContent(chapterData.text);
      setChapterPage(1);
    } catch (error) {
      console.error("Failed to fetch chapter content:", error);
    } finally {
      setLoading(false); // Set loading to false after chapter content is fetched
    }
  };

  // Fetch comments for the selected chapter
  const fetchComments = async (chapterId) => {
    setLoading(true); // Set loading to true when fetching comments

    try {
      const commentsData = await getComments(bookId, chapterId);
      setComments(commentsData);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false); // Set loading to false after comments are fetched
    }
  };

  // Handle new or updated comment
  const handleNewComment = (newComment) => {
    if (!newComment || !newComment.id) {
      console.error("Invalid comment:", newComment);
      return;
    }

    setComments((prevComments) => {
      const existingCommentIndex = prevComments.findIndex(
        (comment) => comment.id === newComment.id
      );

      // for updating a comment
      if (existingCommentIndex !== -1) {
        const updatedComments = [...prevComments];
        updatedComments[existingCommentIndex] = newComment;
        return updatedComments;
      }

      // for new comments
      return [newComment, ...prevComments];
    });
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    setLoading(true); // Set loading to true while deleting a comment

    try {
      await deleteComment(bookId, selectedChapter, commentId);
      setComments((prevComments) => prevComments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
    } finally {
      setLoading(false); // Set loading to false after deleting the comment
    }
  };

  // Handle updating a comment (open modal)
  const handleUpdateComment = async (commentId) => {
    setSelectedComment(commentId);
    setShowCommentModal(true);
  };

  // Paginate words per page
  const paginateWords = (text, page) => {
    const words = text.split(/\s+/);
    const totalPages = Math.ceil(words.length / wordsPerPage);
    const start = (page - 1) * wordsPerPage;
    const end = start + wordsPerPage;
    return {
      text: words.slice(start, end).join(" "),
      totalPages,
    };
  };

  const { text: currentChapterText, totalPages: totalChapterPages } = paginateWords(chapterContent, chapterPage);

  return (
    <div className="read-book-container">
      <div className="chapter-list">
        {/* Favorite Button */}
        <button
          className="save-book-button"
          onClick={() => handleFavoriteBooks(bookId)}
        >
          {favoriteBooks.includes(bookId) ? "Unfavorite" : "Favorite"}
        </button>

        <cover
          className={selectedChapter === "cover" ? "active" : ""}
          onClick={() => {
            setSelectedChapter("cover");
            setSelectedChapterName("cover");
            setChapterContent("");
            updateRating(book);
          }}
        >
          Cover
        </cover>
        <h3>Table of Contents</h3>
        <ul>
          {chapters.map((chapter) => (
            <li
              key={chapter.id}
              className={selectedChapter === chapter.id ? "active" : ""}
              onClick={() => {
                fetchChapterContent(chapter.id);
                fetchComments(chapter.id);
              }}
            >
              {chapter.chapter_num}: {chapter.title}
            </li>
          ))}
        </ul>
      </div>
      
      {selectedChapter === "cover" ? (
        <div className="cover-content">
          <img src={book.cover_image_url || defaultBookCover} alt="Cover Not Found" />
          <h3>{book.book_title}</h3>
          <p>By {book.author}</p>
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
          <p>
            {book.book_synopsis ? book.book_synopsis : "No synopsis available."}
          </p>
        </div>
      ) : (
        <div className="chapter-content">
          <h2>{selectedChapterName}</h2>
          <div className="content-box">
            <div className="content" dangerouslySetInnerHTML={{ __html: currentChapterText }} />
          </div>
          {totalChapterPages > 1 && (
            <div className="chapter-pagination">
              <button onClick={() => setChapterPage(chapterPage - 1)} disabled={chapterPage === 1}>
                Previous Page
              </button>
              <span>{`Page ${chapterPage} of ${totalChapterPages}`}</span>
              <button onClick={() => setChapterPage(chapterPage + 1)} disabled={chapterPage === totalChapterPages}>
                Next Page
              </button>
            </div>
          )}

          <div className="comments-header">
            <h2>Comments</h2>
            {user && 
              <button
                className="new-comment-button"
                onClick={() => {
                  setSelectedComment(null);
                  setShowCommentModal(true);
                }}
              >
                Leave a Comment
              </button>
            }
          </div>
          <ul className="comments-list">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <li key={comment.id}>
                  <strong>{comment.commentor_name}</strong>
                  <div>{"★".repeat(comment.rating)}</div>
                  <p>{comment.text}</p>

                  {user && user.uid === comment.commentor_id && (
                    <div>
                      <button
                        className="new-comment-button"
                        onClick={() => handleUpdateComment(comment.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="new-comment-button"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              ))
            ) : (
              <p>No comments yet.</p>
            )}
          </ul>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <NewCommentModal
          bookId={bookId}
          chapterId={selectedChapter}
          onClose={() => setShowCommentModal(false)}
          onCommentAdded={handleNewComment}
          existingComment={comments.find(comment => comment.id === selectedComment)}
        />
      )}
    </div>
  );
}

export default ReadBook;
