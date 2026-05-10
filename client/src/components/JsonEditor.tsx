import { useRef, useCallback } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';

interface Props {
  value: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}

export default function JsonEditor({ value, onChange }: Props) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const isUpdatingRef = useRef(false);

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  const handleChange = useCallback((raw: string | undefined) => {
    if (!raw || isUpdatingRef.current) return;
    try {
      const parsed = JSON.parse(raw);
      onChange(parsed);
    } catch {
      // user is mid-edit, ignore parse errors
    }
  }, [onChange]);

  const handleFormat = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.getAction('editor.action.formatDocument')?.run();
  }, []);

  return (
    <Editor
      height="100%"
      defaultLanguage="json"
      value={JSON.stringify(value, null, 2)}
      onChange={handleChange}
      onMount={handleMount}
      theme="vs-light"
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: 'on',
        tabSize: 2,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
      }}
    />
  );
}
