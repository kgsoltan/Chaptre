import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TextEditor from '../components/TextEditor';
import { getChapterDetails, updateChapter } from '../services/api';

import './EditBook.css'

function EditChapter() {
  const editorRef = useRef(null);
  const [chapterTitle, setChapterTitle] = useState('');
  const [text, setText] = useState('');
  const [published, setPublished] = useState(false);
  const [chapterNum, setChapterNum] = useState(0);
  const { bookId, chapterId } = useParams();
  const navigate = useNavigate();

  const [chapterTitleError, setChapterTitleError] = useState('');

  useEffect(() => {
    const fetchChapterContent = async () => {
      try {
        const chapterContent = await getChapterDetails(bookId, chapterId);
        if (chapterContent) {
          setChapterTitle(chapterContent.title);
          setText(chapterContent.text);
          setPublished(chapterContent.is_published);
          setChapterNum(chapterContent.chapter_num)
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

  const validateChapterTitle = (title) => {
    if (title.length > 50 || title.length <= 0) {
      return 'Chapter title must be between 1 and 50 characters.';
    }
    return '';
  };

  const handleSaveChapter = async () => {
    setChapterTitleError('');
    const chapterTitleError = validateChapterTitle(chapterTitle);
    setChapterTitleError(chapterTitleError);

    if (chapterTitleError) {
      return;
    }

    try {
      const htmlContent = editorRef.current.getHTML();
      const updates = {
        title: chapterTitle,
        text: htmlContent,
        is_published: published,
        chapter_num: chapterNum,
      };
      await updateChapter(bookId, chapterId, updates);
      navigate(`/book/${bookId}/editor`);
    } catch (error) {
      console.error('Error saving chapter:', error);
      alert('Failed to save chapter.');
    }
  };

  const togglePublish = () => {
    setPublished(!published);
  };

  return (
    <div className="edit-chapter-container">
      <button className="back-button" onClick={() => navigate(`/book/${bookId}/editor`)}> Back to Book</button>
      <h2>Edit Chapter</h2>
      <div className='chapter-details-form'>
        <label>Title</label>
        {chapterTitleError && <p className="error-message">{chapterTitleError}</p>}
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
        <div className='chapter-buttons'>
          <button className={`${published ? 'unpublish-button' : 'publish-button'}`} onClick={togglePublish}>{published ? 'Unpublish' : 'Publish'}</button>
          <button className='save-button' onClick={() => handleSaveChapter()}>Save Chapter</button>
        </div>
      </div>
    </div>
  );
}

export default EditChapter;
