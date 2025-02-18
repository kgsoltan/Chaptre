import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getChapters, createChapter, deleteChapter } from '../services/api';

function EditBook() {
  const [chapters, setChapters] = useState([]);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterNumber, SetNewChapterNumber] = useState(0);
  const { bookId } = useParams();

  useEffect(() => {
    fetchChapters();
  }, [bookId]);

  const fetchChapters = async () => {
    try {
      const chaptersData = await getChapters(bookId);
      setChapters(chaptersData);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const handleAddChapter = async () => {
    try {
      const newChapter = {
        chapter_num: newChapterNumber,
        title: newChapterTitle,
        text: '',
      };
      await createChapter(bookId, newChapter);
      setNewChapterTitle('');
      fetchChapters();
    } catch (error) {
      console.error('Error adding chapter:', error);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    try {
      await deleteChapter(bookId, chapterId);
      fetchChapters();
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  const handleToggleBookPublish = async () => {
    try {
      await updateBookPublishStatus(bookId, !bookPublished);
      setBookPublished(!bookPublished);
    } catch (error) {
      console.error('Error toggling book publish status:', error);
    }
  };

  const handleToggleChapterPublish = async (chapterId, currentStatus) => {
    try {
      await updateChapterPublishStatus(bookId, chapterId, !currentStatus);
      fetchChapters();
    } catch (error) {
      console.error('Error toggling chapter publish status:', error);
    }
  };

  return (
    <div>
      <h2>Edit Book</h2>
      <h3>Chapters:</h3>
      <ul>
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <Link to={`/book/${bookId}/chapter/${chapter.id}/editor`}>
              Chapter: {chapter.title}
            </Link>
            <button onClick={() => handleDeleteChapter(chapter.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      <div>
        <input
          type="text"
          placeholder="New chapter title"
          value={newChapterTitle}
          onChange={(e) => setNewChapterTitle(e.target.value)}
        />
        <input
          type="number"
          placeholder="Chapter Number"
          value={newChapterNumber}
          onChange={(e) => SetNewChapterNumber(e.target.value)}
        />
        <button onClick={handleAddChapter}>Add Chapter</button>
      </div>
    </div>
  );
}

export default EditBook;