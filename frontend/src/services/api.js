

export const getAllBooks = async () => {

    // mock book database
    return (
        [
            { "id": 1, "title": "John's Story", "author": "John Smith", "coverImage" : "https://picsum.photos/id/24/600/900"},
            { "id": 2, "title": "Another Story", "author": "David", "coverImage" : "https://picsum.photos/id/25/600/900" }
        ]
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

export const getBookContentByID = async () => {

    //delete code above this as its mock data

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



