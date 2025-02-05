import React, { useRef, useState, useEffect } from 'react';
import TextEditor from '../components/TextEditor';

function EditBook() {
  const editorRef = useRef(null);
  const [content, setContent] = useState("");

  return (
    <div>
      <h2>Chapter Name should go here</h2>
      <TextEditor ref={editorRef} value={content} />
    </div>
  );
}

export default EditBook;
