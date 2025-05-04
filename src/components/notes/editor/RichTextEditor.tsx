
import { useEditor, EditorContent } from '@tiptap/react';
import { cn } from '@/lib/utils';
import { createEditorExtensions } from './editorExtensions';
import { EditorToolbar } from './EditorToolbar';
import '../editor.css';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  minHeight?: string;
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = 'Write something...', 
  editable = true,
  minHeight = '200px'
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: createEditorExtensions(),
    content,
    editable,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none p-4',
          'min-h-[200px] h-full',
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    
    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border rounded-md bg-background flex flex-col" style={{ minHeight }}>
      {editable && (
        <EditorToolbar 
          editor={editor} 
          setLink={setLink} 
          addImage={addImage}
        />
      )}
      
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
