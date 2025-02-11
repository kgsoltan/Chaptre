import React, {useRef, forwardRef, useImperativeHandle } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const modules = {
  toolbar: [
    ["bold", "italic", "underline"], //Add more options if we need
  ],
};

const TextEditor = forwardRef((props, ref) => {
  const quillRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getContents: () => quillRef.current.getEditor().getContents(), // Get Delta format
    getHTML: () => quillRef.current.getEditor().root.innerHTML, // Get HTML content
  }));

  return (
    <div>
    <ReactQuill
      ref={quillRef}
      theme="snow"
      modules={modules}
    />
    </div>
  );
});

export default TextEditor;