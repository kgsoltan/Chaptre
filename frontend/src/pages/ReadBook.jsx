import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getChapterDetails, getChapters} from '../services/api';

function ReadBook() {
  const { bookId } = useParams();
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterContent, setChapterContent] = useState("");
  const [selectedChapterName, setselectedChapterName] = useState("Chapter Name")


  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const chapterList = await getChapters(bookId);
        setChapters(chapterList);
        console.log(chapterList);
        if (chapterList.length > 0) {
          fetchChapterContent(chapterList[0].id); 
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
      setselectedChapterName(chapterData.title)
      setChapterContent(chapterData.text);
    } catch (error) {
      console.error("Failed to fetch chapter content:", error);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "250px", borderRight: "1px solid #ccc", padding: "10px" }}>
        <h3>Chapters</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {chapters.map((chapter) => (
            <li
              key={chapter.id}
              style={{
                padding: "8px",
                cursor: "pointer",
                background: selectedChapter === chapter.id ? "#ddd" : "transparent",
              }}
              onClick={() => fetchChapterContent(chapter.id)}
            >
              {chapter.title}
            </li>
          ))}
        </ul>
      </div>
      
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <h2>{selectedChapterName}</h2>
        <div dangerouslySetInnerHTML={{ __html: chapterContent }} />
      </div>
    </div>
  );
}

export default ReadBook;