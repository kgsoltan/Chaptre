import { useEffect, useState } from "react";
import { createComment, updateComment } from "../services/api";
import TextEditor from '../components/TextEditor';
import "../ReadBook.css";
import "../Modal.css";

function NewCommentModal({ bookId, chapterId, onClose, onCommentAdded, existingComment }) {
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (existingComment) {
        setCommentText(existingComment.text);
        setRating(existingComment.rating);
    }
  }, [existingComment]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const plainText = document.createElement("div");
    plainText.innerHTML = commentText;
    const cleanedText = plainText.innerText.trim();

    if (!cleanedText) {
      alert("Please enter a comment");
      return;
    }

    if(rating === 0) {
        alert("Please leave a rating");
        return;
    }

    try {
      let response;
      if (existingComment) {
        response = await updateComment(bookId, chapterId, existingComment.id, {
            text: cleanedText,
            rating: rating
        })
        onCommentAdded({ ...existingComment, text: cleanedText, rating: rating });
      } else {
        response = await createComment(bookId, chapterId, {
            text: cleanedText,
            rating: rating,
        });
        onCommentAdded(response);
      }
      onClose();
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  return (
    <div className="new-comment-modal">
      <div className="modal-content">
        <h2>Leave a Comment</h2>
        <form onSubmit={handleSubmit}>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((value) => (
              <span
                key={value}
                className={`star ${rating >= value ? "filled" : ""}`}
                onClick={() => setRating(value)}
              >
                ★
              </span>
            ))}
          </div>        
          <div>
            <TextEditor
              value={commentText}
              onChange={(content) => setCommentText(content)}
            />
          </div>
          <div className="modal-buttons">
            <button className="modal-button" type="submit">Submit</button>
            <button className="modal-button" onClick={onClose}>Close</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewCommentModal;