import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import { getChapters, createChapter, deleteChapter, getBookDetails, updateBook, updateCoverImage, updateChapter } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { validateFile, uploadToS3 } from "../services/imageUpload";
import '../EditBook.css'; 

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

  const moveChapter = async (index, direction) => {
    const newChapters = [...chapters];
    if (direction === 'up' && index > 0) {
      [newChapters[index], newChapters[index - 1]] = [newChapters[index - 1], newChapters[index]];
    } else if (direction === 'down' && index < newChapters.length - 1) {
      [newChapters[index], newChapters[index + 1]] = [newChapters[index + 1], newChapters[index]];
    }

    const updatedChapters = newChapters.map((chapter, idx) => ({ ...chapter, chapter_num: idx + 1 }));
    setChapters(updatedChapters);

    try {
      for (const [idx, chapter] of updatedChapters.entries()) {
        await updateChapter(bookId, chapter.id, { chapter_num: idx + 1 });
      }
      fetchChapters();
    } catch (error) {
      console.error('Error updating chapter numbers in backend:', error);
      alert('Failed to update chapter order. Please try again.');
      fetchChapters();
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    try {
      await deleteChapter(bookId, chapterId);
      const updatedChapters = chapters.filter(chapter => chapter.id !== chapterId);
      setChapters(updatedChapters);
      await updateChapterNumbers(updatedChapters);
      fetchChapters();
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };
 
  const updateChapterNumbers = async (chaptersToUpdate) => {
    try {
        const updatedChapters = chaptersToUpdate.map((chapter, index) => ({ ...chapter, chapter_num: index + 1 }));
        setChapters(updatedChapters);

        for (const [index, chapter] of updatedChapters.entries()) {
            await updateChapter(bookId, chapter.id, { chapter_num: index + 1 });
        }

        fetchChapters();
    } catch (error) {
        console.error('Error updating chapter numbers:', error);
        alert('Failed to update chapter numbers. Please try again.');

        fetchChapters();
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

  return (
    <div className="edit-book-container">
      <h2>Edit Book</h2>
      <div className="book-details-form">
        <label>Title</label>
        <input
          type="text"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          placeholder="Book Title"
        />
        
        {/* <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author"
        /> */}
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
        <Select
          isMulti
          options={genreOptions}
          value={genreOptions.filter(option => genreTags.includes(option.value))}
          onChange={(selectedOptions) => setGenreTags(selectedOptions.map(option => option.value))}
        />
      </div>
      <h3>Chapters:</h3>
      <ul className="chapter-list">
        {chapters.map((chapter, index) => (
          <li key={chapter.id} className="chapter-item">
             Chapter {chapter.chapter_num}: {chapter.title}
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
                disabled={index === chapters.length - 1}
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