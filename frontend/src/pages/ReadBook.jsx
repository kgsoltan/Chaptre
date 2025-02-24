import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getChapterDetails, getChapters } from "../services/api";
import "../ReadBook.css";

function ReadBook() {
  const { bookId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterContent, setChapterContent] = useState("");
  const [selectedChapterName, setSelectedChapterName] = useState("Chapter Name");

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const chapterList = await getChapters(bookId);
        const publishedChapterList = chapterList.filter((chapter) => chapter.is_published);
        setChapters(publishedChapterList);
        if (publishedChapterList.length > 0) {
          fetchChapterContent(publishedChapterList[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch chapters:", error);
      }
    };

    fetchChapters();
  }, [bookId]);

  const fetchChapterContent = async (chapterId) => {
    try {
      const chapterData = await getChapterDetails(bookId, chapterId);
      setSelectedChapter(chapterId);
      setSelectedChapterName(chapterData.title);
      setChapterContent(chapterData.text);
    } catch (error) {
      console.error("Failed to fetch chapter content:", error);
    }
  };

  return (
    <div className="read-book-container">
      <div className="chapter-list">
        <h3>Chapters</h3>
        <ul>
          {chapters.map((chapter) => (
            <li
              key={chapter.id}
              className={selectedChapter === chapter.id ? "active" : ""}
              onClick={() => fetchChapterContent(chapter.id)}
            >
              {chapter.title}
            </li>
          ))}
        </ul>
      </div>

      <div className="chapter-content">
        <h2>{selectedChapterName}</h2>
        <div className="content" dangerouslySetInnerHTML={{ __html: chapterContent }} />
      </div>
    </div>
  );
}

export default ReadBook;