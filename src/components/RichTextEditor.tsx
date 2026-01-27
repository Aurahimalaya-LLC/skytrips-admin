'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'clean'],
      ],
    }),
    []
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'link',
  ];

  return (
    <div className={`rich-text-editor ${className || ''}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-background text-foreground"
      />
      <style jsx global>{`
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-color: var(--input);
          background-color: var(--muted);
        }
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border-color: var(--input);
          font-family: inherit;
          min-height: 150px;
        }
        .rich-text-editor .ql-editor {
          min-height: 150px;
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
        .rich-text-editor .ql-stroke {
          stroke: var(--foreground) !important;
        }
        .rich-text-editor .ql-fill {
          fill: var(--foreground) !important;
        }
        .rich-text-editor .ql-picker {
          color: var(--foreground) !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
