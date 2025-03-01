import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getChapterDetails, getChapters, getComments, deleteComment, updateComment } from "../services/api";
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
    setComments((prevComments) => [newComment, ...prevComments]); // Update comment list
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(bookId, selectedChapter, commentId);
      setComments(comments.filter((comment) => comment.id !== commentId)); // Remove deleted comment from state
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleUpdateComment = async (commentId, updatedText) => {
    try {
      const updatedComment = await updateComment(bookId, selectedChapter, commentId, { text: updatedText });
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId ? { ...comment, text: updatedComment.text } : comment
        )
      );
    } catch (error) {
      console.error("Error updating comment:", error);
    }
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
                onClick={() => setShowCommentModal(true)}
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
        />
      )}  
    </div>
  );
}

export default ReadBook;    