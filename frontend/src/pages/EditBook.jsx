import React, { useRef, useState, useEffect, useCallback} from 'react';
import TextEditor from '../components/TextEditor';
import { getChapters, getChapterDetails, updateChapterDetails, createChapter, deleteChapter } from '../services/api';
import { useParams } from 'react-router-dom';

function EditBook() {
  const editorRef = useRef(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const { bookId } = useParams(); 
  const [text, setText] = useState('');
  const [newChapterTitle, setNewChapterTitle] = useState('');

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const chaptersData = await getChapters(bookId);
        setChapters(chaptersData);
      } catch (error) {
        console.error('Error fetching chapters:', error);
      }
    };

    fetchChapters();
  }, [bookId]);

  useEffect(() => {
    const fetchChapterContent = async () => {
      if (selectedChapter) {
        try {
          const chapterContent = await getChapterDetails(bookId, selectedChapter.id);
          if (editorRef.current && chapterContent) {
            setText(chapterContent.text)
          }
        } catch (error) {
          console.error('Error fetching chapter content:', error);
        }
      }
      };

      fetchChapterContent();
  }, [selectedChapter, bookId]);

  const handleChapterClick = (chapter) => {
    setSelectedChapter(chapter);
  };

  const handleSaveChapter = async () => {
    if (selectedChapter) {
      try {
        // Get the content from the editor
        const htmlContent = editorRef.current.getHTML();

        // Prepare updates
        const updates = {
            text: htmlContent,
        };

        // Call the API to update the chapter
        await updateChapterDetails(bookId, selectedChapter.id, updates);

        alert('Chapter saved successfully!');
      } catch (error) {
        console.error('Error saving chapter:', error);
        alert('Failed to save chapter.');
      }
    } else {
        alert('No chapter selected.');
    }
  };

  const handleChange = useCallback((value) => {
    setText(value);
  }, []);

  const handleAddChapter = async () => {
    try {
      const newChapter = {
        title: newChapterTitle,
        text: '', // Initial content
      };
      await createChapter(bookId, newChapter);
      setNewChapterTitle('');
      // After successfully adding a chapter, re-fetch the chapters
      const updatedChapters = await getChapters(bookId);
      setChapters(updatedChapters);
    } catch (error) {
      console.error('Error adding chapter:', error);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    try {
      await deleteChapter(bookId, chapterId);
      // After successfully deleting a chapter, re-fetch the chapters
      const updatedChapters = await getChapters(bookId);
      setChapters(updatedChapters);
      setSelectedChapter(null); // Clear selected chapter after deletion
      setText(''); // Clear editor content
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  return (
    <div>
      <h2>Edit Book</h2>
      <h3>Chapters:</h3>
      <ul>
        {chapters.map((chapter) => (
          <li
            key={chapter.id}
            onClick={() => handleChapterClick(chapter)}
          >
            Chapter: {chapter.title}
            <button onClick={() => handleDeleteChapter(chapter.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      {selectedChapter && (
        <h2>
          Editing Chapter: {selectedChapter.title} {selectedChapter.text}
        </h2>
      )}
      <TextEditor
        ref={editorRef}
        value={text}
        onChange={handleChange}
      />
      <button onClick={handleSaveChapter}>Save Chapter</button>
  
      <div>
        <input
          type="text"
          placeholder="New chapter title"
          value={newChapterTitle}
          onChange={(e) => setNewChapterTitle(e.target.value)}
        />
        <button onClick={handleAddChapter}>Add Chapter</button>
      </div>
    </div>
  );
  
  }

  export default EditBook;
