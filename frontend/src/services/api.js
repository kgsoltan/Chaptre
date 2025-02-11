

import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_BASE_URL = 'http://localhost:5001'; // Adjust as needed

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Function to get the Firebase authentication token
const getAuthToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  return user ? await user.getIdToken() : null;
};

// -------------------------------- Unprotected Endpoints -------------------------------- //

// Get author profile
export const getAuthorDetails = async (authorId) => {
    /*
                return(
                    {
                        "id": "43252",
                        "first_name": "John",
                        "bio": "John's Bio",
                        "location": "California",
                        "books_as_author": ["64353", "845"],
                        "following": ["5434", "345"],
                        "profile_pic_url": "exampleurl"
                    }
                )
                    */
  const response = await api.get(`/authors/${authorId}`);
  return response.data;
};

// Get book details if published
export const getBookDetails = async (bookId) => {
  const response = await api.get(`/books/${bookId}`);
  return response.data;
};

// Get a non-draft chapter from a published book
export const getChapterDetails = async (bookId, chapterNum) => {
  const response = await api.get(`/books/${bookId}/${chapterNum}`);
  return response.data;
};

// Get x number of published books
export const getPublishedBooks = async (count) => {
    const response = await api.get(`/books?count=${count}`);
    return response.data;

};

// Get all published books associated with an author
export const getAuthorBooks = async (authorId) => {
  const response = await api.get(`/authors/${authorId}/books`);
  return response.data;
};

// -------------------------------- Protected Endpoints -------------------------------- //
// Must include Firebase ID token in the Authorization header

// Create a new author profile
export const createAuthor = async (authorData) => {
  const token = await getAuthToken();
  const response = await api.post('/authors', authorData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Update an author's profile
export const updateAuthor = async (authorId, updates) => {
  const token = await getAuthToken();
  const response = await api.patch(`/authors/${authorId}`, updates, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Create a new book
export const createBook = async (bookData) => {
  const token = await getAuthToken();
  const response = await api.post('/books', bookData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Create a new chapter in a book
export const createChapter = async (bookId, chapterData) => {
  const token = await getAuthToken();
  const response = await api.post(`/books/${bookId}/newChapter`, chapterData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Modify an existing chapter
export const updateChapter = async (bookId, chapterNum, updates) => {
  const token = await getAuthToken();
  const response = await api.patch(`/books/${bookId}/${chapterNum}`, updates, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Check if the user is authorized to edit the book
export const canEditBook = async (bookId) => {
  try {
    const token = await getAuthToken();
    if (!token) return false;

    const response = await api.get(`/books/${bookId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const bookData = response.data;
    const user = getAuth().currentUser;

    if (!user || !bookData.author_id) return false;

    const authorResponse = await api.get(`/authors/${bookData.author_id}`);
    const authorData = authorResponse.data;

    return authorData.books_as_author.includes(bookId);
  } catch (error) {
    console.error('Error checking edit permissions:', error);
    return false;
  }
};






