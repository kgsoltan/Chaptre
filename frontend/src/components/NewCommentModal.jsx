import { useState } from "react";
import { createComment } from "../services/api";

function NewCommentModal({ bookId, chapterId, onClose, onCommentAdded }) {
  const [commentText, setCommentText] = useState("");
  const [isPositive, setIsPositive] = useState(true); // Default to "Good Book"

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!commentText) {
      alert("Please enter a comment");
      return;
    }

    try {
      const newComment = await createComment(bookId, chapterId, {
        text: commentText,
        good_rating: isPositive,
      });

      onCommentAdded(newComment); // Pass the new comment to the parent or update state
      onClose(); // Close the modal after submission
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Leave a Comment</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <button
              type="button"
              onClick={() => setIsPositive(true)} // Set to positive review
              style={{ backgroundColor: isPositive === true ? "green" : "transparent" }}
            >
              Good Book
            </button>
            <button
              type="button"
              onClick={() => setIsPositive(false)} // Set to negative review
              style={{ backgroundColor: isPositive === false ? "red" : "transparent" }}
            >
              Bad Book
            </button>
          </div>
          <div>
            <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write your comment..."
            />
          </div>
          <button type="submit">Submit</button>
          <button onClick={onClose}>Close</button>
        </form>
      </div>
    </div>
  );
}

export default NewCommentModal;