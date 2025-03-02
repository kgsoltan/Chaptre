import { useState } from "react";
import { createComment } from "../services/api";
import TextEditor from '../components/TextEditor';
import "../ReadBook.css";

function NewCommentModal({ bookId, chapterId, onClose, onCommentAdded }) {
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const plainText = document.createElement("div");
    plainText.innerHTML = commentText; // Parse HTML content
    const cleanedText = plainText.innerText.trim(); // Extract plain text


    if (!commentText) {
      alert("Please enter a comment");
      return;
    }

    try {
      const newComment = await createComment(bookId, chapterId, {
        text: cleanedText,
        rating: rating,
      });

      onCommentAdded(newComment); // Pass the new comment to the parent or update state
      onClose(); // Close the modal after submission
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleStarClick = (value) => {
    setRating(value);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Leave a Comment</h2>
        <form onSubmit={handleSubmit}>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((value) => (
              <span
                key={value}
                className={`star ${rating >= value ? "filled" : ""}`}
                onClick={() => handleStarClick(value)}
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
          <button type="submit">Submit</button>
          <button onClick={onClose}>Close</button>
        </form>
      </div>
    </div>
  );
}

export default NewCommentModal;