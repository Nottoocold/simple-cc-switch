import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface Props {
  config: Record<string, unknown>;
  onSave: (config: Record<string, unknown>) => void;
  onCancel: () => void;
  onExtract: () => Promise<Record<string, unknown>>;
  theme: 'light' | 'dark';
}

export default function CommonConfigModal({ config, onSave, onCancel, onExtract, theme }: Props) {
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
      const current = JSON.parse(text);
      const extracted = await onExtract();
      const merged = { ...current, ...extracted };
      // deep-merge env fields separately
      if (current.env && typeof current.env === 'object' && extracted.env && typeof extracted.env === 'object') {
        merged.env = { ...current.env as Record<string, unknown>, ...extracted.env as Record<string, unknown> };
      }
      setText(JSON.stringify(merged, null, 2));
      setError(null);
    } catch {
      setError('提取失败，请确认 ~/.claude/settings.json 存在');
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>编辑通用配置</h3>
          <button type="button" className="modal-close" onClick={onCancel}><X size={18} /></button>
        </div>
        <p className="modal-desc">
          勾选「合并通用配置」时，此处的配置将与当前提供商的配置合并。<br />
          env 字段会与提供商的 env 深度合并（通用配置作为基础，提供商同名 key 优先）。
        </p>
        <div className="modal-editor">
          <Editor
            defaultLanguage="json"
            value={text}
            onChange={(v) => { setText(v ?? ''); setError(null); }}
            theme={theme === 'light' ? 'vs' : 'vs-dark'}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              tabSize: 2,
              automaticLayout: true,
              scrollBeyondLastLine: false,
            }}
          />
        </div>
        {error && <p className="field-error" style={{ marginBottom: 8 }}>JSON 解析错误: {error}</p>}
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
