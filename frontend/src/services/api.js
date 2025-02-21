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

    const url = `/search?${searchParams.toString()}`;

    // Make the API request and return response
    const response = await api.get(url);
    const books = await response.data;
    return books; 
  } catch (error) {
    console.error("Error during search:", error);
    return [];
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

// Update an author's profile
export const updateAuthor = async (authorId, updates) => {
  const token = await getAuthToken();
  const response = await api.patch(`/authors/${authorId}`, updates, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


// Update an author's profile picture
export const updateProfilePic = async (authorId, profilePicUrl) => {
  try {

    const token = await getAuthToken();  // Assuming getAuthToken() is a function to retrieve the token
    const response = await api.patch(`/authors/${authorId}/profile_pic_url`,

    {
      profilePicUrl: profilePicUrl
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
 
 
    if (response.status === 200) {
      alert('Profile picture updated successfully!');
    } else {
      throw new Error('Failed to update profile picture');
    }
  } catch (error) {
    console.error('Error updating profile picture:', error);
    alert('Failed to update profile picture.');
  }
 };
 
// Update a book's cover image
export const updateCoverImage = async (bookId, coverImageUrl) => {
  try {
    const token = await getAuthToken();
    console.log('bookId:', bookId); 
  console.log('coverImageUrl:', coverImageUrl); 
    const response = await api.patch(`/books/${bookId}/cover_image_url`, 
      {
        coverImageUrl: coverImageUrl
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    console.log("hellloooooo")
    if (response.status === 200) {
      alert('Cover photo updated successfully!');
    } else {
      throw new Error('Failed to update cover photo');
    }
  } catch (error) {
    console.error('Error updating cover photo:', error);
    alert('Failed to update cover photo.');
  }
};

// Create a new book
export const createBook = async (bookData) => {
  const token = await getAuthToken();
  const response = await api.post('/books', bookData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
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
  try {
      const token = await getAuthToken();
      const response = await api.patch(`/books/${bookId}/chapters/${chapterId}`, updates, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
      return response.data;
  } catch (error) {
      console.error("Error updating chapter details:", error);
      throw error;
  }
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
  try {
    const token = await getAuthToken();
    const response = await api.patch(`/books/${bookId}`, updates, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating book:", error);
    throw error;
  }
};