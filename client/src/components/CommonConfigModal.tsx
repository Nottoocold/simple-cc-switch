import { useState, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';

interface Props {
  config: Record<string, unknown>;
  onSave: (config: Record<string, unknown>) => void;
  onCancel: () => void;
  onExtract: () => Promise<Record<string, unknown>>;
}

export default function CommonConfigModal({ config, onSave, onCancel, onExtract }: Props) {
  const [text, setText] = useState(() => JSON.stringify(config, null, 2));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(JSON.stringify(config, null, 2));
  }, [config]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(text);
      onSave(parsed);
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  };

  const [extracting, setExtracting] = useState(false);

  const handleExtract = async () => {
    setExtracting(true);
    try {
      const data = await onExtract();
      setText(JSON.stringify(data, null, 2));
      setError(null);
    } catch {
      setError('提取失败，请确认 ~/.claude/settings.json 存在');
    } finally {
      setExtracting(false);
    }
  };

  const handleFormat = (editor: Parameters<OnMount>[0]) => {
    editor.getAction('editor.action.formatDocument')?.run();
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ width: 640 }} onClick={e => e.stopPropagation()}>
        <h3>编辑通用配置</h3>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
          勾选「合并通用配置」时，此处的配置将与当前提供商的配置合并。<br />
          env 字段会与提供商的 env 深度合并（通用配置作为基础，提供商同名 key 优先）。
        </p>
        <div style={{ height: 360, border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 12 }}>
          <Editor
            defaultLanguage="json"
            value={text}
            onChange={(v) => { setText(v ?? ''); setError(null); }}
            onMount={(editor) => {
              // save reference for format button
              (editor as any).__format = () => handleFormat(editor);
            }}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              tabSize: 2,
              automaticLayout: true,
              scrollBeyondLastLine: false,
            }}
          />
        </div>
        {error && <p style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 8 }}>JSON 解析错误: {error}</p>}
        <div className="modal-actions">
          <button className="btn" onClick={handleExtract} disabled={extracting}>
            {extracting ? '提取中...' : '提取通用配置'}
          </button>
          <span className="spacer" />
          <button className="btn" onClick={onCancel}>取消</button>
          <button className="btn primary" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  );
}
