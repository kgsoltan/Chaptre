export const getAllBooks = async () => {

    // mock book database
    return (
        {
            "books" : [
                { "authorID" : 1 ,"bookId": 1, "title": "John's Story", "author": "John Smith", "coverImage" : "https://picsum.photos/id/24/600/900"},
                { "authorID" : 2 ,"bookId": 2, "title": "Another Story", "author": "David", "coverImage" : "https://picsum.photos/id/25/600/900" },
                { "authorID" : 1 ,"bookId": 3, "title": "John's Alternative Story", "author": "John Smith", "coverImage" : "https://picsum.photos/id/27/600/900" },
                { "authorID" : 2 ,"bookId": 4, "title": "David's Story", "author": "David", "coverImage" : "https://picsum.photos/id/25/600/900" },
                { "authorID" : 2 ,"bookId": 5, "title": "Book that's cool Story", "author": "David", "coverImage" : "https://picsum.photos/id/25/600/900" },
                { "authorID" : 2 ,"bookId": 6, "title": "Zoo Story", "author": "David", "coverImage" : "https://picsum.photos/id/25/600/900" },
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

// In api.js
export const updateAuthorProfile = async (authorId, updatedProfile) => {
    const response = await fetch(`/api/authors/${authorId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedProfile),
    });
    if (!response.ok) {
      throw new Error('Failed to update author profile');
    }
    return response.json();
  };
  

export const getAuthorProfileByID = async (ID) => {

    // mock book database
    return (
          { "authorID" : 1 ,
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
            { "id": 1, 
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




export const addBook = async (bookData) => {
    const response = await fetch('http://localhost:5001/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookData),
    });
    if (!response.ok) {
      throw new Error('Failed to add book');
    }
    return response.json();
  };
  