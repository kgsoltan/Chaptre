import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getChapterDetails, getChapters, getComments } from "../services/api";
import NewCommentModal from '../components/NewCommentModal';
import "../ReadBook.css";

function ReadBook() {
  const { bookId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterContent, setChapterContent] = useState("");
  const [selectedChapterName, setSelectedChapterName] = useState("Chapter Name");
  const [viewingComments, setViewingComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [chapterPage, setChapterPage] = useState(1);

  const wordsPerPage = 400;

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const chapterList = await getChapters(bookId);
        const publishedChapterList = chapterList.filter((chapter) => chapter.is_published);
        setChapters(publishedChapterList);
        if (publishedChapterList.length > 0) {
          fetchChapterContent(publishedChapterList[0].id);
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
      setChapterPage(1);
      setViewingComments(false);
    } catch (error) {
      console.error("Failed to fetch chapter content:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const commentsData = await getComments(bookId);
      setComments(commentsData);
      setViewingComments(true);
      setSelectedChapter(null);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleNewComment = (newComment) => {
    setComments((prevComments) => [newComment, ...prevComments]);
  };

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
        <h3>Chapters</h3>
        <ul>
          {chapters.map((chapter) => (
            <li
              key={chapter.id}
              className={selectedChapter === chapter.id ? "active" : ""}
              onClick={() => fetchChapterContent(chapter.id)}
            >
              {chapter.title}
            </li>
          ))}
        </ul>
        <button onClick={fetchComments} className={`view-comments-button ${viewingComments ? "active" : ""}`}>
          View Comments
        </button>
      </div>
      <div className="chapter-content">
        {viewingComments ? (
          <>
            <div className="comments-header">
              <h2>Comments</h2>
              <button className="new-comment-button" onClick={() => setShowCommentModal(true)}>
                Leave a Comment
              </button>
            </div>
            <ul className="comments-list">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <li key={comment.id}>
                    <strong>{comment.commentor_name}</strong>
                    <div>{comment.good_rating ? "Positive Review" : "Negative Review"}</div>
                    <p>{comment.text}</p>
                  </li>
                ))
              ) : (
                <p>No comments yet.</p>
              )}
            </ul>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
      {showCommentModal && (
        <NewCommentModal bookId={bookId} onClose={() => setShowCommentModal(false)} onCommentAdded={handleNewComment} />
      )}
    </div>
  );
}

export default ReadBook;
