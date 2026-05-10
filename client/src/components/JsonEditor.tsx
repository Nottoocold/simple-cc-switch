import Editor from '@monaco-editor/react';

interface Props {
  value: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}

export default function JsonEditor({ value, onChange }: Props) {
  const handleChange = (raw: string | undefined) => {
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      onChange(parsed);
    } catch {
      // user is mid-edit, ignore parse errors
    }
  };

  return (
    <Editor
      height="100%"
      defaultLanguage="json"
      value={JSON.stringify(value, null, 2)}
      onChange={handleChange}
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
