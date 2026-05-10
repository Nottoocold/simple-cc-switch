import { useState } from 'react';
import { X } from 'lucide-react';
import type { Provider } from '../types';

interface EnvEntry {
  id: string;
  key: string;
  value: string;
}

interface Props {
  provider: Provider | null;
  onSave: (p: Provider) => void;
  onCancel: () => void;
}

const ENV_KEYS = [
  'ANTHROPIC_BASE_URL',
  'ANTHROPIC_AUTH_TOKEN',
  'ANTHROPIC_MODEL',
  'ANTHROPIC_DEFAULT_HAIKU_MODEL',
  'ANTHROPIC_DEFAULT_SONNET_MODEL',
  'ANTHROPIC_DEFAULT_OPUS_MODEL',
];

function buildInitial(provider: Provider | null): EnvEntry[] {
  return ENV_KEYS.map(key => ({
    id: crypto.randomUUID(),
    key,
    value: provider?.env?.[key] ?? '',
  }));
}

export default function ProviderForm({ provider, onSave, onCancel }: Props) {
  const [id, setId] = useState(provider?.id ?? '');
  const [name, setName] = useState(provider?.name ?? '');
  const [envEntries, setEnvEntries] = useState(buildInitial(provider));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleEnvChange = (entryId: string, value: string) => {
    setEnvEntries(prev => prev.map(e => e.id === entryId ? { ...e, value } : e));
    setErrors(prev => {
      const next = { ...prev };
      delete next[entryId];
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!id.trim()) newErrors._id = '标识不能为空';
    if (!name.trim()) newErrors._name = '名称不能为空';

    for (const entry of envEntries) {
      if (!entry.value.trim()) {
        newErrors[entry.id] = '此项为必填';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const env: Record<string, string> = {};
    for (const entry of envEntries) {
      env[entry.key] = entry.value;
    }
    onSave({ id: id.trim(), name: name.trim(), env });
  };

  return (
    <div className="modal-overlay">
      <div className="modal provider-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{provider ? '编辑提供商' : '新增提供商'}</h3>
          <button type="button" className="modal-close" onClick={onCancel}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>标识 (ID)</label>
            <input value={id} onChange={e => { setId(e.target.value); setErrors(p => { const n = { ...p }; delete n._id; return n; }); }} placeholder="如: deepseek" disabled={!!provider} />
            {errors._id && <p className="field-error">{errors._id}</p>}
          </div>
          <div className="form-group">
            <label>显示名称</label>
            <input value={name} onChange={e => { setName(e.target.value); setErrors(p => { const n = { ...p }; delete n._name; return n; }); }} placeholder="如: DeepSeek" />
            {errors._name && <p className="field-error">{errors._name}</p>}
          </div>
          <label className="form-group" style={{ display: 'block', marginBottom: 6 }}>
            环境变量 (env)
          </label>
          <div className="env-entries">
            {envEntries.map((entry) => (
              <div key={entry.id} className="env-row">
                <input
                  value={entry.key}
                  disabled
                  className="env-key-input"
                />
                <input
                  placeholder="必填"
                  value={entry.value}
                  onChange={e => handleEnvChange(entry.id, e.target.value)}
                  className={`env-value-input${errors[entry.id] ? ' input-error' : ''}`}
                />
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onCancel}>取消</button>
            <button type="submit" className="btn primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}
