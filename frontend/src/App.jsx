import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ReadBook from './pages/ReadBook';
import LoginPage from './pages/LoginPage';
import EditBook from './pages/EditBook';
import EditChapter from './pages/EditChapter';

function App() {
  return (
    
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile/:authorId" element={<Profile />} />
          <Route path="/book/:bookId" element={<ReadBook />} />
          <Route path="/book/:bookId/editor" element={<EditBook />} />
          <Route path="/book/:bookId/chapter/:chapterId/editor" element={<EditChapter />} />
          <Route path="/search" element={<Home />} />
        </Routes>
      </div>
      <div id="modal-root"></div>
    </Router>
  );
}

export default App;