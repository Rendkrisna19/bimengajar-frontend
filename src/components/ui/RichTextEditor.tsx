'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const FONT_OPTIONS = [
  'Inter',
  'Poppins',
  'Roboto',
  'Montserrat',
  'Plus Jakarta Sans',
  'Outfit',
  'Playfair Display',
  'Merriweather',
  'Caveat',
  'Cinzel',
  'Oswald',
  'Fira Code',
  'Lato',
  'Open Sans'
];

const QuillNoSSRWrapper = dynamic(
  async () => {
    const ReactQuill = await import('react-quill-new');
    const Quill = ReactQuill.default.Quill;
    if (Quill) {
      const Font = Quill.import('attributors/style/font');
      Font.whitelist = FONT_OPTIONS;
      Quill.register(Font, true);
    }
    return ReactQuill.default;
  },
  {
    ssr: false,
    loading: () => <div className="h-40 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg border border-gray-200 dark:border-gray-700"></div>,
  }
);

const modules = {
  toolbar: [
    [{ header: '1' }, { header: '2' }, { header: '3' }],
    [{ font: FONT_OPTIONS }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    [{ color: [] }, { background: [] }],
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
          min-height: 320px;
          font-family: inherit;
        }
        .dark .ql-toolbar.ql-snow,
        .dark .ql-container.ql-snow {
          border-color: #374151;
        }
        .dark .ql-snow .ql-stroke {
          stroke: #d1d5db;
        }
        .dark .ql-snow .ql-fill {
          fill: #d1d5db;
        }
        .dark .ql-snow .ql-picker {
          color: #d1d5db;
        }

        /* Custom Font Picker Items Preview */
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Inter"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Inter"]::before { content: "Inter"; font-family: "Inter", sans-serif; }

        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Poppins"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Poppins"]::before { content: "Poppins"; font-family: "Poppins", sans-serif; }

        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Roboto"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Roboto"]::before { content: "Roboto"; font-family: "Roboto", sans-serif; }

        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Montserrat"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Montserrat"]::before { content: "Montserrat"; font-family: "Montserrat", sans-serif; }

        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Plus Jakarta Sans"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Plus Jakarta Sans"]::before { content: "Plus Jakarta Sans"; font-family: "Plus Jakarta Sans", sans-serif; }

        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Outfit"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Outfit"]::before { content: "Outfit"; font-family: "Outfit", sans-serif; }

        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Playfair Display"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Playfair Display"]::before { content: "Playfair Display"; font-family: "Playfair Display", serif; }

        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Merriweather"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Merriweather"]::before { content: "Merriweather"; font-family: "Merriweather", serif; }

        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Caveat"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Caveat"]::before { content: "Caveat (Handwriting)"; font-family: "Caveat", cursive; }

        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Cinzel"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Cinzel"]::before { content: "Cinzel (Classic)"; font-family: "Cinzel", serif; }

        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Oswald"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Oswald"]::before { content: "Oswald (Bold)"; font-family: "Oswald", sans-serif; }

        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Fira Code"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Fira Code"]::before { content: "Fira Code (Code)"; font-family: "Fira Code", monospace; }

        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Lato"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Lato"]::before { content: "Lato"; font-family: "Lato", sans-serif; }

        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Open Sans"]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Open Sans"]::before { content: "Open Sans"; font-family: "Open Sans", sans-serif; }
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
