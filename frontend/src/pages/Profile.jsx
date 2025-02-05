import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import { getAllBooks, getAuthorProfileByID, updateAuthorProfile, addBook } from '../services/api';
import Modal from 'react-modal';

function Profile() {
  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAuthor, setEditedAuthor] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [newBook, setNewBook] = useState({
    book_title: '',
    is_published: false,
    num_chapters: 0,
    num_drafts: 0,
    date: new Date().toISOString().split('T')[0],
    cover_image_url: '',
    genre_tags: []
  });
  const { authorId } = useParams();
  
  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const authorProfile = await getAuthorProfileByID(authorId);
        setAuthor(authorProfile);
        setEditedAuthor(authorProfile);
      } catch(e){
        alert("FAILED TO LOAD AUTHOR");
      }
    }
    fetchAuthor();

    const fetchBooks = async () => {
      try {
        const allBooks = await getAllBooks();
        const authorBooks = allBooks.books.filter(b => b.authorID == authorId);
        setBooks(authorBooks);
      } catch(e){
        alert("FAILED TO LOAD BOOKS");
      }
    }
    fetchBooks();
  }, [authorId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateAuthorProfile(authorId, editedAuthor);
      setAuthor(editedAuthor);
      setIsEditing(false);
    } catch (e) {
      alert("FAILED TO UPDATE AUTHOR");
    }
  };

  const handleCancel = () => {
    setEditedAuthor(author);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedAuthor(prev => ({ ...prev, [name]: value }));
  };
  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const bookData = {
        ...newBook,
        author: author.name,
        author_id: authorId
      };
      await addBook(bookData);
      setModalIsOpen(false);
      // Refresh the book list
      const allBooks = await getAllBooks();
      const authorBooks = allBooks.books.filter(b => b.authorID == authorId);
      setBooks(authorBooks);
    } catch (error) {
      alert("Failed to add book");
    }
  };

  if (!author) return <div>Loading...</div>;

  return (
    <div className="profile">
      {isEditing ? (
        <>
          <input
            name="name"
            value={editedAuthor.name}
            onChange={handleChange}
          />
          <textarea
            name="bio"
            value={editedAuthor.bio}
            onChange={handleChange}
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </>
      ) : (
        <>
          <h1>{author.name}'s Profile</h1>
          <p>{author.bio}</p>
          <button onClick={handleEdit}>Edit Profile</button>
        </>
      )}
      <h3>{author.name}'s books:</h3>
      <button onClick={() => setModalIsOpen(true)}>Add New Book</button>
      <BookGrid books={books} />

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Add New Book"
      >
        <h2>Add New Book</h2>
        <form onSubmit={handleAddBook}>
          <input
            type="text"
            placeholder="Book Title"
            value={newBook.book_title}
            onChange={(e) => setNewBook({...newBook, book_title: e.target.value})}
          />
          <input
            type="checkbox"
            checked={newBook.is_published}
            onChange={(e) => setNewBook({...newBook, is_published: e.target.checked})}
          /> Published
          <input
            type="number"
            placeholder="Number of Chapters"
            value={newBook.num_chapters}
            onChange={(e) => setNewBook({...newBook, num_chapters: parseInt(e.target.value)})}
          />
          <input
            type="number"
            placeholder="Number of Drafts"
            value={newBook.num_drafts}
            onChange={(e) => setNewBook({...newBook, num_drafts: parseInt(e.target.value)})}
          />
          <input
            type="date"
            value={newBook.date}
            onChange={(e) => setNewBook({...newBook, date: e.target.value})}
          />
          <input
            type="text"
            placeholder="Cover Image URL"
            value={newBook.cover_image_url}
            onChange={(e) => setNewBook({...newBook, cover_image_url: e.target.value})}
          />
          <input
            type="text"
            placeholder="Genre Tags (comma-separated)"
            value={newBook.genre_tags.join(',')}
            onChange={(e) => setNewBook({...newBook, genre_tags: e.target.value.split(',')})}
          />
          <button type="submit">Add Book</button>
        </form>
      </Modal>
    </div>
  );
}

export default Profile;
