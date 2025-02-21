## Frontend Project Structure

### Frontend/src
#### 📂 assets (TO DO)
- **ChaptreLogo.png** – Site logo

#### 📂 components
- **BookCard.jsx** – Displays a book preview card.
- **BookGrid.jsx** – Shows a grid of books using Book Cards
- **Footer.jsx** – Website footer
- **Header.jsx** – Website header with navigation, login, search, etc.
- **NewBookModal.jsx** – Modal for creating a new book.
- **SearchBar.jsx** – Search input for finding books.
- **TextEditor.jsx** – General purpose rich text editor for writing chapters.

#### 📂 pages
- **EditBook.jsx** – Page to edit book in general.
- **EditChapter.jsx** – Page to edit individual chapters of a book.
- **Home.jsx** – Homepage displaying featured books. Updates upon searches/filters.
- **LoginPage.jsx** – Login page for user authentication.
- **Profile.jsx** – User profile page.
- **ReadBook.jsx** – Page for reading a published book.

#### 📂 services
- **api.js** – Manages API calls between frontend and backend.
- **firebaseConfig.js** – Firebase config file.

### Src Root Files
- **App.jsx** – Root component handling routing.
- **EditBook.css** – Styling for the EditBook page.
- **index.css** – General styles for the site.
- **Login.css** – Styling for the Login page.
- **main.jsx** – Entry point going to App.jsx.
- **index.html** – Main HTML entry point.

### Other files
- **eslint.config.js** – ESLint configuration for code linting.
- **jest.config.ts** – TO DO