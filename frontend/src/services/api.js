export const getAllBooks = async () => {

    // mock book database
    return (
        {
            "books" : [
                { "authorID" : "92OCa3p6pLNIap93D5mLced4DrJ2" ,"bookId": 1, "title": "John's Story", "author": "John Smith", "coverImage" : "https://picsum.photos/id/24/600/900"},
                { "authorID" : "111" ,"bookId": 2, "title": "Another Story", "author": "David", "coverImage" : "https://picsum.photos/id/25/600/900" },
                { "authorID" : "92OCa3p6pLNIap93D5mLced4DrJ2" ,"bookId": 3, "title": "John's Alternative Story", "author": "John Smith", "coverImage" : "https://picsum.photos/id/27/600/900" }
            ]
        }
    )
    //delete code above after adding filling out the API stuff below

    try {
        const response = await fetch(""); //Add the url later
        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error(error.message);
        throw error;
    }
};

export const getAuthorProfileByID = async (ID) => {

    // mock book database
    return (
          { "authorID" : "92OCa3p6pLNIap93D5mLced4DrJ2" ,
            "name" : "John Smith",
            "listOfBookIDs": [1, 3],
            "bio" : "John's Bio John's Bio John's Bio John's Bio John's Bio John's Bio John's Bio",
            "profilePicture" : "https://picsum.photos/id/27/1200/900"}
    )
    //delete code above after adding filling out the API stuff below

    try {
        const response = await fetch(""); //Add the url later
        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error(error.message);
        throw error;
    }
};

export const getBookContentByBookID = async (ID) => {

    // mock book database
    return (
            { "id": "92OCa3p6pLNIap93D5mLced4DrJ2", 
             "title": "John's Story",
             "author": "John Smith",
             "content" : "Hello this is the entire book. Hello this is the entire book. Hello this is the entire book. "}
    )
    //delete code above after adding filling out the API stuff below

    try {
        const response = await fetch(""); //Add the url later
        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error(error.message);
        throw error;
    }
};

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
                    //MOCK DATA
                    return(
                        {
                            "books": [
                                        {
                                            "id": "2432",
                                            "title": "johns book",
                                            "author": "John Smith",
                                            "author_id": "43242",
                                            "genre_tags": ["horror", "action"],
                                            "num_chapters": 10,
                                            "date": "datetime",
                                            "cover_image_url": "https://picsum.photos/id/24/600/900"
                                    },
                                    {
                                            "id": "53453",
                                            "title": "david's book",
                                            "author": "David",
                                            "author_id": "242",
                                            "genre_tags": ["action"],
                                            "num_chapters": 4,
                                            "date": "datetime",
                                            "cover_image_url": "https://picsum.photos/id/25/600/900"
                                    }
                
                                    ]
                        }
                    )


    const response = await api.get(`/books?count=${count}`);
    return response.data;

};

// Get all published books associated with an author
export const getAuthorBooks = async (authorId) => {
            return({
                "books": [
                            {
                                "id": "2432",
                                "title": "johns book",
                                "author": "John Smith",
                                "author_id": "43242",
                                "genre_tags": ["horror", "action"],
                                "num_chapters": 10,
                                "date": "datetime",
                                "cover_image_url": "coverurl"
                        },
                        {
                                "id": "534453",
                                "title": "johns second book",
                                "author": "John Smith",
                                "author_id": "43242",
                                "genre_tags": ["action"],
                                "num_chapters": 5,
                                "date": "datetime",
                                "cover_image_url": "coverurl"
                        }
                        ]
            })
  const response = await api.get(`/books/${authorId}`);
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






