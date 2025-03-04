import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link
import { getAuthorDetails } from '../services/api'; // Your API function to fetch author details
import '../Profile.css';  // Assuming your CSS file is named Modal.css

const FollowingModal = () => {
  const { authorId } = useParams();
  const [followingList, setFollowingList] = useState([]);  // This will store the list of followed authors' details
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal starts closed

  useEffect(() => {
    if (!authorId) {
      setError('No authorId found in URL');
      setLoading(false);
      return;
    }

    const fetchFollowingList = async () => {
      try {
        const author = await getAuthorDetails(authorId); // Fetch the author details
        console.log(author);

        if (author && author.following && author.following.length > 0) {
          // Fetch details for each followed author
          const followingDetails = await Promise.all(
            author.following.map(async (followedAuthorId) => {
              const followedAuthorDetails = await getAuthorDetails(followedAuthorId);
              return followedAuthorDetails;  // Return full details for each followed author
            })
          );
          setFollowingList(followingDetails);  // Set the details in the state
        } else {
          setError('Author has no following list');
        }
      } catch (err) {
        setError('Error fetching author data');
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingList();  // Trigger the fetching of data
  }, [authorId]);  // Dependency on authorId to fetch when it changes

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const handleClose = () => {
    setIsModalOpen(false); // Close the modal
  };

  const handleOpen = () => {
    setIsModalOpen(true); // Open the modal
  };

  return (
    <div>
      <button onClick={handleOpen} className="open-modal-button">View Following</button> {/* Button to open the modal */}

      {isModalOpen && ( // Only render the modal when it is open
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={handleClose}>×</button> {/* Close button */}
            <h3>Following List</h3>
            {followingList.length > 0 ? (
              <ul>
                {followingList.map((followedAuthor, index) => (
                  <li key={index}>
                    <Link 
                      to={`/profile/${followedAuthor.id}`} 
                      className="author-link" 
                      title="View Author's Profile"
                    >
                      {followedAuthor.first_name} {followedAuthor.last_name} {/* Display first and last name */}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No authors found in the following list</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowingModal;
