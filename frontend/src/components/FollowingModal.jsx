import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAuthorDetails } from '../services/api';

import './FollowingModal.css'

const FollowingModal = ({ onClose }) => {
  const { authorId } = useParams();
  const [followingList, setFollowingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authorId) {
      setError('No authorId found in URL');
      setLoading(false);
      return;
    }

    const fetchFollowingList = async () => {
      try {
        const author = await getAuthorDetails(authorId);

        if (author && author.following && author.following.length > 0) {
          // Fetch details for each followed author
          const followingDetails = await Promise.all(
            author.following.map(async (followedAuthorId) => {
              const followedAuthorDetails = await getAuthorDetails(followedAuthorId);
              return followedAuthorDetails;
            })
          );
          setFollowingList(followingDetails);
        } else {
          setError('Author has no following list');
        }
      } catch (err) {
        setError('Error fetching author data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingList();
  }, [authorId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const handleClose = () => {
    onClose();
  };


  return (
    <div className="following-modal-overlay">
      <div className="following-modal-content">
        <button className="close-button" onClick={handleClose}>×</button>
        <h3>Following List</h3>
        {followingList.length > 0 ? (
          <ul>
            {followingList.map((followedAuthor, index) => (
              <li key={index}>
                <Link
                  to={`/profile/${followedAuthor.id}`}
                  className="author-link"
                  title="View Author's Profile"
                  onClick={handleClose}
                >
                  {followedAuthor.first_name} {followedAuthor.last_name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No authors found in the following list</p>
        )}
      </div>
    </div>
  );
};

export default FollowingModal;
