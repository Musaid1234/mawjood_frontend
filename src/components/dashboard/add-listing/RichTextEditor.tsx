'use client';

import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import ImageExtension from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Link as LinkIcon } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api.config';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  error?: string;
}

const InsertParagraphAfterHeading = Extension.create({
  name: 'insertParagraphAfterHeading',
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { editor } = this;
        if (editor.isActive('heading')) {
          editor.chain().focus().splitBlock().setParagraph().run();
          return true;
        }
        return false;
      },
    };
  },
});

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Describe your business...',
  error,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'max-h-80 w-auto rounded-md',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      InsertParagraphAfterHeading,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const triggerImagePicker = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) {
      return;
    }

    setImageUploadError('');
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axiosInstance.post(
        API_ENDPOINTS.UPLOAD.IMAGE,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const imageUrl = response.data?.data?.imageUrl;
      if (!imageUrl) {
        throw new Error('Image URL missing from upload response.');
      }

      editor.chain().focus().setImage({ src: imageUrl, alt: file.name }).run();
    } catch (uploadError: any) {
      setImageUploadError(
        uploadError?.message || 'Failed to upload image. Please try again.'
      );
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLinkClick = () => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);
    
    // Check if link is already active
    if (editor.isActive('link')) {
      const attrs = editor.getAttributes('link');
      setLinkUrl(attrs.href || '');
    } else {
      setLinkUrl(selectedText || '');
    }
    
    setShowLinkInput(true);
  };

  const handleLinkSubmit = () => {
    if (!editor || !linkUrl.trim()) return;

    const url = linkUrl.trim().startsWith('http://') || linkUrl.trim().startsWith('https://')
      ? linkUrl.trim()
      : `https://${linkUrl.trim()}`;

    // If text is selected, convert it to a link
    // Otherwise, insert the URL as a link
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);

    if (selectedText) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } else {
      editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
    }

    setLinkUrl('');
    setShowLinkInput(false);
  };

  const handleUnlink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setShowLinkInput(false);
    setLinkUrl('');
  };

  return (
    <div>
      <div className={`border rounded-lg ${
        error ? 'border-red-500' : 'border-gray-300 focus-within:ring-2 focus-within:ring-[#1c4233] focus-within:border-transparent'
      }`}>
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-wrap">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
            title="Heading 3"
          >
            H3
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('strike') ? 'bg-gray-200' : ''}`}
            title="Strikethrough"
          >
            <span className="line-through">S</span>
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bulletList') ? 'bg-gray-200' : ''}`}
            title="Bullet List"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('orderedList') ? 'bg-gray-200' : ''}`}
            title="Numbered List"
          >
            1.
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('blockquote') ? 'bg-gray-200' : ''}`}
            title="Quote"
          >
            "
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <button
            type="button"
            onClick={() => editor?.chain().focus().setParagraph().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('paragraph') ? 'bg-gray-200' : ''}`}
            title="Paragraph"
          >
            P
          </button>

          <button
            type="button"
            onClick={triggerImagePicker}
            className="p-2 rounded hover:bg-gray-200"
            title="Insert Image"
            disabled={isUploadingImage}
          >
            {isUploadingImage ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
            ) : (
              <ImagePlus className="h-4 w-4 text-gray-600" />
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />

          <div className="w-px h-6 bg-gray-300 mx-1"></div>

          <button
            type="button"
            onClick={handleLinkClick}
            className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('link') ? 'bg-gray-200' : ''}`}
            title="Insert/Edit Link"
          >
            <LinkIcon className="h-4 w-4 text-gray-600" />
          </button>
          
          {editor?.isActive('link') && (
            <button
              type="button"
              onClick={handleUnlink}
              className="p-2 rounded hover:bg-gray-200"
              title="Remove Link"
            >
              <span className="text-xs text-gray-600">Unlink</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            title="Undo"
            className={`p-2 rounded hover:bg-gray-200 ${!editor?.can().undo() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            ↶
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            title="Redo"
            className={`p-2 rounded hover:bg-gray-200 ${!editor?.can().redo() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            ↷
          </button>
        </div>

        {/* Link Input - Inside Editor */}
        {showLinkInput && (
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLinkSubmit();
                  } else if (e.key === 'Escape') {
                    setShowLinkInput(false);
                    setLinkUrl('');
                    editor?.chain().focus().run();
                  }
                }}
                placeholder="Enter URL (e.g., https://example.com)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1c4233] focus:border-transparent text-sm"
                autoFocus
              />
              <button
                type="button"
                onClick={handleLinkSubmit}
                className="px-4 py-2 bg-[#1c4233] text-white rounded-lg hover:bg-[#1c4233]/90 text-sm font-medium"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkUrl('');
                  editor?.chain().focus().run();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Editor Content */}
        <EditorContent editor={editor} />
      </div>

      {imageUploadError ? (
        <p className="mt-2 text-sm text-red-600">{imageUploadError}</p>
      ) : null}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
