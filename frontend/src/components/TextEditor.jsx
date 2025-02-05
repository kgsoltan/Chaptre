import React, { useRef, forwardRef, useImperativeHandle } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Define modules for toolbar
const modules = {
  toolbar: [
    [{ 'font': [] }, { 'size': [] }],
    [{ 'align': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['image'],
    ['undo', 'redo'],
    [{ 'color': [] }, { 'background': [] }],
  ],
};

const TextEditor = forwardRef((props, ref) => {
  const { className, value, onChange, placeholder } = props;
  const quillRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getContents: () => quillRef.current.getEditor().getContents(),
    getHTML: () => quillRef.current.getEditor().root.innerHTML,
  }));

  return (
      <ReactQuill
        ref={quillRef}
        theme="snow" 
        value={value} 
        onChange={onChange}
        modules={modules} 
        placeholder={placeholder}
      />
  );
});

export default TextEditor;
