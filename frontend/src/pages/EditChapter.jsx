import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TextEditor from '../components/TextEditor';
import { getChapterDetails, updateChapterDetails } from '../services/api';

function EditChapter() {
  const editorRef = useRef(null);
  const [chapterTitle, setChapterTitle] = useState('');
  const [text, setText] = useState('');
  const { bookId, chapterId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChapterContent = async () => {
      try {
        const chapterContent = await getChapterDetails(bookId, chapterId);
        if (chapterContent) {
          setChapterTitle(chapterContent.title);
          setText(chapterContent.text);
        }
      } catch (error) {
        console.error('Error fetching chapter content:', error);
      }
    };

    fetchChapterContent();
  }, [bookId, chapterId]);

  const handleChange = useCallback((value) => {
    setText(value);
  }, []);

  const handleSaveChapter = async () => {
    try {
      const htmlContent = editorRef.current.getHTML();
      const updates = {
        title: chapterTitle,
        text: htmlContent,
      };
      await updateChapterDetails(bookId, chapterId, updates);
      alert('Chapter saved successfully!');
      navigate(`/book/${bookId}/editor`);
    } catch (error) {
      console.error('Error saving chapter:', error);
      alert('Failed to save chapter.');
    }
  };

  return (
    <div>
      <h2>Edit Chapter</h2>
      <input
        type="text"
        value={chapterTitle}
        onChange={(e) => setChapterTitle(e.target.value)}
        placeholder="Chapter Title"
      />
      <TextEditor
        ref={editorRef}
        value={text}
        onChange={handleChange}
      />
      <button onClick={handleSaveChapter}>Save Chapter</button>
      <button onClick={() => navigate(`/book/${bookId}/editor`)}>Back to Book</button>
    </div>
  );
}

export default EditChapter;
