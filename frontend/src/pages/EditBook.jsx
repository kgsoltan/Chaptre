import React, { useRef, useState, useEffect } from 'react';
import TextEditor from '../components/TextEditor';

function EditBook() {
  const editorRef = useRef(null);
  const [content, setContent] = useState(""); 

  const handleContentChange = (newContent) => {
    setContent(newContent); 
  };

  useEffect(() => {

  }, []);

  return (
    <div className="text-editor-container">
      <h2>Chapter Name</h2>
      <TextEditor 
        ref={editorRef}
        value={content}        
        onChange={handleContentChange} 
        placeholder="Start typing here..." 
      />
    </div>
  );
  
}

export default EditBook;
