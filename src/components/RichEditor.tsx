import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { useEffect } from 'react';

interface Props {
  value: string;
  onChange: (text: string) => void;
  highlights?: { start: number; end: number }[];
}

export function RichEditor({ value, onChange, highlights = [] }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Highlight],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getText());
    },
  });

  // Apply highlight marks
  useEffect(() => {
    if (!editor) return;

    editor.commands.unsetHighlight();

    highlights.forEach(({ start, end }) => {
      editor.commands.setTextSelection({ from: start + 1, to: end });
      editor.commands.setHighlight();
    });

    editor.commands.setTextSelection(0); // Clear selection
  }, [editor, highlights]);

  return (
    <div className="border p-2 min-h-[300px]">
      <EditorContent editor={editor} />
    </div>
  );
}
