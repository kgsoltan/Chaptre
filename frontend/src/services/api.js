import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_BASE_URL = 'http://localhost:5001'; // Adjust as needed

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Function to get the Firebase authentication token
const getAuthToken = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    return user ? await user.getIdToken() : null;
  } catch (error) {
    console.error("Error fetching auth token:", error);
    return null;
  }
};


// -------------------------------- Unprotected Endpoints -------------------------------- //

export const getAuthorDetails = async (authorId) => {
  const response = await api.get(`/authors/${authorId}`);
  return response.data;
};

export const getBookDetails = async (bookId) => {
  const response = await api.get(`/books/${bookId}`);
  return response.data;
};

export const getChapterDetails = async (bookId, chapterId) => {
  const response = await api.get(`/books/${bookId}/chapters/${chapterId}`);
  return response.data;
};

export const getChapters = async (bookId) => {
  try {
    const response = await api.get(`/books/${bookId}/chapters`);
    return response.data;
  } catch (error) {
    console.error("Error fetching chapters:", error);
    throw error;
  }
};

export const getPublishedChapters = async (bookId) => {
  try {
    const response = await api.get(`/books/${bookId}/chapters`);
    return response.data;
  } catch (error) {
    console.error("Error fetching chapters:", error);
    throw error;
  }
};

export const getS3UploadUrl = async () => {
  try {
    console.log("Sending request to get S3 upload URL...");
    const response = await api.get('/s3Url');
    console.log("poop");
    console.log(response);
    return response.data.url;
  } catch (error) {
    console.error("Error fetching S3 URL:", error);
    throw error;
  }
 };

export const getPublishedBooks = async (count) => {
    const response = await api.get(`/books?count=${count}`);
    return response.data;

};

export const getAuthorBooks = async (authorId) => {
  const response = await api.get(`/authors/${authorId}/books`);
  return response.data;
};

//search books route
export const searchBooks = async (searchTerm, genres) => {
  try {
    const searchParams = new URLSearchParams();

    //add search terms and genres
    if (searchTerm) {
      searchParams.append("q", searchTerm);
    }

    if (genres && genres.length > 0) {
      genres.forEach((genre) => searchParams.append("genre", genre));
    }

    const url = `/books/search?${searchParams.toString()}`;
  
    // Make the API request and return response
    const response = await api.get(url);
    const books = await response.data;
    return books; 
  } catch (error) {
    console.error("Error during search:", error);
    return [];
  }
};

export const getComments = async (bookId, chapterId) => {
  try {
    const response = await api.get(`/books/${bookId}/chapters/${chapterId}/comments`);
    return response.data;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
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


// Generic PATCH request function
const patchRequest = async (endpoint, data, errorMessage) => {
  try {
    const token = await getAuthToken();
    await api.patch(endpoint, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    alert(errorMessage);
  }
};

// Update an author's profile
export const updateAuthor = async (authorId, updates) => {
  return await patchRequest(`/authors/${authorId}`, updates, "Error updating author");
};

// Update an author's profile picture
export const updateProfilePic = async (authorId, profilePicUrl) => {
  await patchRequest(
    `/authors/${authorId}/profile_pic_url`,
    { profilePicUrl },
    'Failed to update profile picture'
  );
};

// Update a book's cover image
export const updateCoverImage = async (bookId, coverImageUrl) => {
  await patchRequest(
    `/books/${bookId}/cover_image_url`,
    { coverImageUrl },
    'Failed to update cover photo'
  );
};

// Create a new book
export const createBook = async (bookData) => {
  const token = await getAuthToken();
  const response = await api.post('/books', bookData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Delete a book
export const deleteBook = async (bookId) => {
  try {
    const token = await getAuthToken();
    const response = await api.delete(`/books/${bookId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting book:", error);
    throw error;
  }
};

// Create a new chapter
export const createChapter = async (bookId, chapterData) => {
  try {
      const token = await getAuthToken();
      const response = await api.post(`/books/${bookId}/chapters`, chapterData, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
      return response.data;
  } catch (error) {
      console.error("Error creating chapter:", error);
      throw error;
  }
};

// Delete a chapter
export const deleteChapter = async (bookId, chapterId) => {
  try {
      const token = await getAuthToken();
      const response = await api.delete(`/books/${bookId}/chapters/${chapterId}`, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
      return response.data;
  } catch (error) {
      console.error("Error deleting chapter:", error);
      throw error;
  }
};

// Update a specific chapter by chapter ID
export const updateChapter = async (bookId, chapterId, updates) => {
  return await patchRequest(
    `/books/${bookId}/chapters/${chapterId}`,
    updates,
    'Error updating chapter details'
  );
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
export const updateBook = async (bookId, updates) => {
  return await patchRequest(
    `/books/${bookId}`,
    updates,
    'Error updating book'
  );
};

//create new comment
export const createComment = async (bookId, chapterId, commentData) => {
  try {
      const token = await getAuthToken();
      const response = await api.post(`/books/${bookId}/chapters/${chapterId}/comments`, commentData, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
      return response.data;
  } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
  }
};

// Delete a comment
export const deleteComment = async (bookId, chapterId, commentId) => {
  try {
      const token = await getAuthToken();
      const response = await api.delete(`/books/${bookId}/chapters/${chapterId}/comments/${commentId}`, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
      return response.data;
  } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
  }
};

// Update a specific comment by comment ID
export const updateComment = async (bookId, chapterId, commentId, updates) => {
  return await patchRequest(
    `/books/${bookId}/chapters/${chapterId}/comments/${commentId}`,
    updates,
    'Error updating chapter details'
  );
};

// api.js
export const getFollowing = async (authorId) => {
  try {
    console.log(`Requesting following for ${authorId}`);  // Log to see if the request is triggered
    const response = await api.get(`/authors/${authorId}/following`);
    console.log(response.data.following)
    return response.data.following;  // Adjust based on your response structure
  } catch (error) {
    console.error('Error fetching following:', error);
    throw error;
  }
};

export const updateFavoriteBooks = async (authorId, updatedFavorites) => {
  return await patchRequest(
    `/authors/${authorId}`,
    { favorited_books: updatedFavorites },
    'Error updating favorite books'
  );
};