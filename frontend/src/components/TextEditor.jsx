import { useRef, forwardRef, useImperativeHandle } from "react";
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
    getContents: () => quillRef.current.getEditor().getContents(),
    getHTML: () => quillRef.current.getEditor().root.innerHTML,
  }));

  return (
    <div>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        modules={modules}
        value={props.value}
        onChange={props.onChange}
      />
    </div>
  );
});

TextEditor.displayName = 'TextEditor';
export default TextEditor;