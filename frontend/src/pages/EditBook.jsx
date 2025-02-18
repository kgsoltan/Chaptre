import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Select from 'react-select';
import { getChapters, createChapter, deleteChapter, getBookDetails, updateBook } from '../services/api';
import '../EditBook.css'; 
import { useNavigate } from 'react-router-dom';

function EditBook() {
  const [bookTitle, setBookTitle] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [author, setAuthor] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [genreTags, setGenreTags] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterNumber, setNewChapterNumber] = useState(1);
  const { bookId } = useParams();
  const navigate = useNavigate();

  const genreOptions = [
    { value: "Fantasy", label: "Fantasy" },
    { value: "Sci-Fi", label: "Sci-Fi" },
    { value: "Mystery", label: "Mystery" },
    { value: "Romance", label: "Romance" },
    { value: "Horror", label: "Horror" },
    { value: "Comedy", label: "Comedy" },
    { value: "Action", label: "Action" },
    { value: "Adventure", label: "Adventure" },
    { value: "Drama", label: "Drama" },
    { value: "Coming of age", label: "Coming of age" },
    { value: "Fiction", label: "Fiction" },
    { value: "Non-Fiction", label: "Non-Fiction" },
  ];

  useEffect(() => {
    fetchBookDetails();
    fetchChapters();
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      const bookData = await getBookDetails(bookId);
      setBookTitle(bookData.book_title);
      setIsPublished(bookData.is_published);
      setAuthor(bookData.author);
      setCoverImageUrl(bookData.cover_image_url);
      setGenreTags(bookData.genre_tags);
    } catch (error) {
      console.error('Error fetching book details:', error);
    }
  };

  const fetchChapters = async () => {
    try {
      const chaptersData = await getChapters(bookId);
      setChapters(chaptersData);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const handleSaveBook = async () => {
    try {
      const updatedBook = {
        book_title: bookTitle,
        is_published: isPublished,
        author: author,
        cover_image_url: coverImageUrl,
        genre_tags: genreTags
      };
      await updateBook(bookId, updatedBook);
      alert('Book saved successfully!');
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Failed to save book. Please try again.');
    }
  };

  const handleAddChapter = async () => {
    try {
      const newChapter = {
        chapter_num: newChapterNumber,
        title: newChapterTitle,
        text: '',
        is_published: false,
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

  const togglePublished = () => {
    setIsPublished(!isPublished);
  }

  return (
    <div className="edit-book-container">
      <h2>Edit Book</h2>
      
      <div className="book-details-form">
        <input
          type="text"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          placeholder="Book Title"
        />
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author"
        />
        <input
          type="text"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="Cover Image URL"
        />
        <label>Genre</label>
        <Select
          isMulti
          options={genreOptions}
          value={genreOptions.filter(option => genreTags.includes(option.value))}
          onChange={(selectedOptions) => setGenreTags(selectedOptions.map(option => option.value))}
        />
      </div>

      <h3>Chapters:</h3>
      <ul className="chapter-list">
        {chapters.map((chapter) => (
          <li key={chapter.id} className="chapter-item">
            Chapter {chapter.chapter_num}: {chapter.title}
            <div className="chapter-buttons">
            <button onClick={() => handleDeleteChapter(chapter.id)} className="delete-button">
              Delete
            </button>
            <button
              onClick={() => navigate(`/book/${bookId}/chapter/${chapter.id}/editor`)}
              className="chapter-button"
            >
              Edit Chapter
            </button>
            </div>
          </li>
        ))}
        </ul>

      <div className="add-chapter-form">
        <input
          type="number"
          className='chapter-number'
          placeholder="Chapter Number"
          value={newChapterNumber}
          onChange={(e) => setNewChapterNumber(parseInt(e.target.value))}
        />
        <input
          type="text"
          placeholder="New chapter title"
          value={newChapterTitle}
          onChange={(e) => setNewChapterTitle(e.target.value)}
        />
        <button className='save-button' onClick={handleAddChapter}>Add Chapter</button>
      </div>
      <div className="chapter-buttons">
      <button 
          className={`${isPublished ? 'unpublish-button' : 'publish-button'}`} 
          onClick={togglePublished}
        >
          {isPublished ? 'Unpublish' : 'Publish'}
      </button>
      <button className='save-button' onClick={handleSaveBook}>Save Book</button>
      </div>
    </div>
  );
}

export default EditBook;