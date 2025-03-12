
# 📚 Chaptre

**Chaptre** is  a collaborative website for authors and readers. The platform allows users to sign up, create profiles, write books, publish chapters, and read a library of stories. 

##  Usage

#### Install Node.js with NPM: 
Download Link: `https://nodejs.org/en/download/`

Check installation with `node -v` and `npm -v`


#### In `/backend`: 
Must have: `serviceAccountKey.json` and `.env` for Firebase and AWS S3

Run: `npm install` and then `node server.js`

#### In `/frontend`: 
Must have:`.env` with Vite API key

Run: `npm install` and then `npm run dev`

Then `http://localhost:5173/` to see the website.


##  Features

### 👥 User Profiles
- Sign up and create a personalized profile.
- Upload a profile picture and customize your author page.

### ✍️ Write & Publish
- Become an author and start writing your own books.
- Create chapters, save drafts, and publish them when ready.
- Add cover titles and genre tags to help readers discover your work.

### 📖 Discover & Read
- Browse and read published books.
- Search by book title or filter by genre tags.

## 🚀 Tech Stack

| **Technology**  | **Usage** |
|-----------------|-----------|
| **React + Vite**  | Frontend framework |
| **Express.js**  | Backend server handling API requests |
| **Firebase**  | User authentication and database management |
| **Quill**  | Rich text editor for book writing |
| **Amazon S3**  | Image storage for profile pictures and book covers |

