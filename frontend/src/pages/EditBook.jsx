import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import { getChapters, createChapter, deleteChapter, getBookDetails, updateBook, updateCoverImage, updateChapter, deleteBook } from '../services/api'; // Assuming you have these API functions
import { useNavigate } from 'react-router-dom';
import { validateFile, uploadToS3 } from "../services/imageUpload";
import pubIcon from "../assets/published.png";
import unpubIcon from "../assets/unpublished.png";

import './EditBook.css'

function EditBook() {
  const [bookTitle, setBookTitle] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [author, setAuthor] = useState('');
  const [synonpsis, setSynonpsis] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [genreTags, setGenreTags] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [reorderedChapters, setReorderedChapters] = useState([]); // New state for reordering
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [titleError, setTitleError] = useState('');
  const [synopsisError, setSynopsisError] = useState('');
  const [chapterTitleError, setChapterTitleError] = useState('');
  const [tagsError, setTagsError] = useState('');

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

  useEffect(() => {
    setReorderedChapters([...chapters]);
  }, [chapters]);

  const fetchBookDetails = async () => {
    try {
      const bookData = await getBookDetails(bookId);
      setBookTitle(bookData.book_title);
      setIsPublished(bookData.is_published);
      setAuthor(bookData.author);
      setSynonpsis(bookData.book_synopsis);
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

  // Validation functions
  const validateTitle = (title) => {
    if (title.length > 50 || title.length <= 0) {
      return 'Title must be between 1 and 50 characters.';
    }
    return '';
  };

  const validateSynopsis = (synopsis) => {
    if (synopsis.length > 500 || synopsis.length <= 49) {
      return 'Synopsis must be between 50 and 500 characters.';
    }
    return '';
  };

  const validateChapterTitle = (title) => {
    if (title.length > 50 || title.length <= 0) {
      return 'Chapter title must be between 1 and 50 characters.';
    }
    return '';
  };

  const validateTags = (tags) => {
    if (tags.length > 3|| tags.length <= 0) {
      return 'You must select between 1 and 3 tags.';
    }
    return '';
  };

  const handleSaveBook = async () => {
    // Clear existing errors
    setTitleError('');
    setSynopsisError('');
    setTagsError('');

    // Perform validation
    const titleError = validateTitle(bookTitle);
    const synopsisError = validateSynopsis(synonpsis);
    const tagsError = validateTags(genreTags);

    // Update state with errors
    setTitleError(titleError);
    setSynopsisError(synopsisError);
    setTagsError(tagsError);

    // If there are any errors, stop here
    if (titleError || synopsisError || tagsError) {
      return;
    }

    try {
      const updatedBook = {
        book_title: bookTitle,
        is_published: isPublished,
        author: author,
        book_synopsis: synonpsis,
        cover_image_url: coverImageUrl,
        genre_tags: genreTags
      };
      await updateBook(bookId, updatedBook);

      const updates = reorderedChapters.map((chapter, index) => ({
        id: chapter.id,
        chapter_num: index + 1
      }));

      for (const update of updates) {
        await updateChapter(bookId, update.id, { chapter_num: update.chapter_num });
      }

      alert('Book saved successfully!');
      fetchChapters();
    } catch (error) {
      console.error('Error saving book:', error);
      alert('Failed to save book. Please try again.');
    }
  };

  const handleAddChapter = async () => {
    setChapterTitleError('');
    const chapterTitleError = validateChapterTitle(newChapterTitle);
    setChapterTitleError(chapterTitleError);
    if (chapterTitleError) {
      return;
    }

    try {
      const newChapter = {
        chapter_num: chapters.length > 0 ? Math.max(...chapters.map(c => c.chapter_num)) + 1 : 1,
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

  const moveChapter = (index, direction) => {
    const newChapters = [...reorderedChapters];
    if (direction === 'up' && index > 0) {
      [newChapters[index], newChapters[index - 1]] = [newChapters[index - 1], newChapters[index]];
    } else if (direction === 'down' && index < newChapters.length - 1) {
      [newChapters[index], newChapters[index + 1]] = [newChapters[index + 1], newChapters[index]];
    }
    setReorderedChapters(newChapters);
  };

  const handleDeleteChapter = async (chapterId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this chapter? This action cannot be undone.");

    if (isConfirmed) {
      try {
        await deleteChapter(bookId, chapterId);
        const updatedChapters = chapters.filter(chapter => chapter.id !== chapterId);
        setChapters(updatedChapters);
        setReorderedChapters(updatedChapters); // Update reorderedChapters as well
        fetchChapters();
      } catch (error) {
        console.error('Error deleting chapter:', error);
      }
    }
  };

  const handleDeleteBook = async () => {
    const isConfirmed = window.confirm("Are you sure you want to delete this book? This action cannot be undone.");

    if (isConfirmed) {
      try {
        await deleteBook(bookId);
        alert('Book deleted successfully!');
        navigate('/'); // Redirect to home page or author's books list
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('Failed to delete book. Please try again.');
      }
    }
  };

  const togglePublished = () => {
    setIsPublished(!isPublished);
  }

  const handleCoverImage = async (event, bookId, updateCoverImage, setCoverImageUrl) => {
    const file = event.target.files[0];
    if (!validateFile(file)) return;

    try {
      const s3ImageUrl = await uploadToS3(file);
      setCoverImageUrl(s3ImageUrl);
      await updateCoverImage(bookId, s3ImageUrl);
      console.log("Cover image updated in Firestore:", s3ImageUrl);
    } catch (error) {
      console.error("Error during cover image upload:", error);
      alert("Failed to upload cover image.");
    }
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="edit-book-container">
      <div className="edit-book-title-delete">
        <h2>Edit Book</h2>
        <button className='delete-button' onClick={handleDeleteBook}>Delete Book</button>
      </div>
      <div className="book-details-form">
        <label>Title</label>
        {titleError && <p className="error-message">{titleError}</p>}
        <input
          type="text"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          placeholder="Book Title"
        />
        <label>Synonpsis</label>
        {synopsisError && <p className="error-message">{synopsisError}</p>}
        <textarea
          type="text"
          value={synonpsis}
          onChange={(e) => setSynonpsis(e.target.value)}
          placeholder="Synopsis"
          className='synopsis-input'
        />
        <button onClick={() => document.getElementById('cover-photo-upload').click()} className="cover-photo-upload-btn">
          Cover Photo Upload
        </button>
        <input
          id="cover-photo-upload"
          type="file"
          accept="image/*"
          className="file-upload"
          onChange={(event) => handleCoverImage(event, bookId, updateCoverImage, setCoverImageUrl)}
          style={{ display: 'none' }}
        />
        <label>Genre</label>
        {tagsError && <p className="error-message">{tagsError}</p>}
        <Select
          isMulti
          options={genreOptions}
          value={genreOptions.filter(option => genreTags.includes(option.value))}
          onChange={(selectedOptions) => setGenreTags(selectedOptions.map(option => option.value))}
        />
      </div>
      <h3>Chapters:</h3>
      <ul className="chapter-list">
        {reorderedChapters.map((chapter, index) => (
          <li key={chapter.id} className="chapter-item">
            <div className="chapter-buttons">
              <img className="published-icon" src={chapter.is_published ? pubIcon : unpubIcon} alt="published" />
              {index + 1}: {truncateText(chapter.title, 50)}
            </div>
            <div className="chapter-buttons">
              <div className="chapter-order-buttons">
                <button
                  onClick={() => moveChapter(index, 'up')}
                  disabled={index === 0}
                  className="order-button"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveChapter(index, 'down')}
                  disabled={index === reorderedChapters.length - 1}
                  className="order-button"
                >
                  ▼
                </button>
              </div>
              <button
                onClick={() => navigate(`/book/${bookId}/chapter/${chapter.id}/editor`)}
                className="chapter-button"
              >
                Edit Chapter
              </button>
              <button onClick={() => handleDeleteChapter(chapter.id)} className="delete-button">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {chapterTitleError && <p className="error-message">{chapterTitleError}</p>}
      <div className="add-chapter-form">
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