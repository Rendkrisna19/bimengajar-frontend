'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const QuillNoSSRWrapper = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="h-40 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg border border-gray-200 dark:border-gray-700"></div>,
});

const modules = {
  toolbar: [
    [{ header: '1' }, { header: '2' }, { header: '3' }, { font: [] }],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'indent',
  'link', 'image', 'video', 'color', 'background'
];

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  return (
    <div className="rich-text-container bg-white dark:bg-black rounded-lg">
      <style dangerouslySetInnerHTML={{__html: `
        .ql-toolbar.ql-snow {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-color: inherit;
        }
        .ql-container.ql-snow {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border-color: inherit;
          min-height: 300px;
          font-family: inherit;
        }
        .dark .ql-toolbar.ql-snow,
        .dark .ql-container.ql-snow {
          border-color: #374151; /* border-gray-700 */
        }
        .dark .ql-snow .ql-stroke {
          stroke: #d1d5db; /* text-gray-300 */
        }
        .dark .ql-snow .ql-fill {
          fill: #d1d5db; /* text-gray-300 */
        }
        .dark .ql-snow .ql-picker {
          color: #d1d5db; /* text-gray-300 */
        }
      `}} />
      <QuillNoSSRWrapper 
        theme="snow" 
        value={value} 
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
}
