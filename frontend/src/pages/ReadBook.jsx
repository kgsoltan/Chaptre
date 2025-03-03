import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getChapterDetails, getChapters, getComments, deleteComment } from "../services/api";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import NewCommentModal from '../components/NewCommentModal';
import "../ReadBook.css";

function ReadBook() {
  const { bookId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterContent, setChapterContent] = useState("");
  const [selectedChapterName, setSelectedChapterName] = useState("Chapter Name");
  const [comments, setComments] = useState([]);
  const [selectedComment, setSelectedComment] = useState(null)
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const chapterList = await getChapters(bookId);
        const publishedChapterList = chapterList.filter((chapter) => chapter.is_published);
        setChapters(publishedChapterList);
        if (publishedChapterList.length > 0) {
          const firstChapterId = publishedChapterList[0].id;
          fetchChapterContent(firstChapterId);
          fetchComments(firstChapterId);
        }
      } catch (error) {
        console.error("Failed to fetch chapters:", error);
      }
    };

    fetchChapters();
  }, [bookId]);

  const fetchChapterContent = async (chapterId) => {
    try {
      const chapterData = await getChapterDetails(bookId, chapterId);
      setSelectedChapter(chapterId);
      setSelectedChapterName(chapterData.title);
      setChapterContent(chapterData.text);
    } catch (error) {
      console.error("Failed to fetch chapter content:", error);
    }
  };

  const fetchComments = async (chapterId) => {
    try {
      const commentsData = await getComments(bookId, chapterId);
      setComments(commentsData);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

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

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
  
    try {
      await deleteComment(bookId, selectedChapter, commentId);
      setComments((prevComments) => prevComments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleUpdateComment = async (commentId) => {
    setSelectedComment(commentId);
    setShowCommentModal(true);
  };

  return (
    <div className="read-book-container">
      <div className="chapter-list">
        <h3>Chapters</h3>
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
              {chapter.title}
            </li>
          ))}
        </ul>
      </div>
  
      <div className="chapter-content">
        <>
          <h2>{selectedChapterName}</h2>
          <div className="content-box">
            <div className="content" dangerouslySetInnerHTML={{ __html: chapterContent }} />
          </div>

          <div className="comments-header">
            <h2>Comments</h2>
            {user ? (
              <button 
                className="new-comment-button"
                onClick={() => {
                  setSelectedComment(null);
                  setShowCommentModal(true);
                }}
              > 
                Leave a Comment
              </button>
            ) : (
              <p className="login-message">Login to leave comment</p>
            )}
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
        </>
      </div>


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