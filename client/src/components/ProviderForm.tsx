import { useState } from 'react';
import type { Provider } from '../types';

interface EnvEntry {
  id: string;
  key: string;
  value: string;
}

interface Props {
  provider: Provider | null; // null = creating new
  onSave: (p: Provider) => void;
  onCancel: () => void;
}

function buildInitial(provider: Provider | null): EnvEntry[] {
  if (provider) {
    return Object.entries(provider.env).map(([k, v]) => ({ id: crypto.randomUUID(), key: k, value: v }));
  }
  return [{ id: crypto.randomUUID(), key: '', value: '' }];
}

export default function ProviderForm({ provider, onSave, onCancel }: Props) {
  const [id, setId] = useState(provider?.id ?? '');
  const [name, setName] = useState(provider?.name ?? '');
  const [envEntries, setEnvEntries] = useState(buildInitial(provider));

  const handleAddEnv = () => setEnvEntries([...envEntries, { id: crypto.randomUUID(), key: '', value: '' }]);
  const handleEnvChange = (id: string, field: 'key' | 'value', val: string) => {
    setEnvEntries(envEntries.map(e => e.id === id ? { ...e, [field]: val } : e));
  };
  const handleEnvRemove = (id: string) => {
    if (envEntries.length <= 1) return;
    setEnvEntries(envEntries.filter(e => e.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const env: Record<string, string> = {};
    envEntries.forEach(({ key, value }) => { if (key.trim()) env[key.trim()] = value; });
    onSave({ id: id.trim(), name: name.trim(), env });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{provider ? '编辑提供商' : '新增提供商'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>标识 (ID)</label>
            <input value={id} onChange={e => setId(e.target.value)} placeholder="如: deepseek" required disabled={!!provider} />
          </div>
          <div className="form-group">
            <label>显示名称</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="如: DeepSeek" required />
          </div>
          <label className="form-group" style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
            环境变量 (env)
          </label>
          <div className="env-entries">
            {envEntries.map((entry) => (
              <div key={entry.id} className="env-row">
                <input
                  placeholder="KEY"
                  value={entry.key}
                  onChange={e => handleEnvChange(entry.id, 'key', e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  placeholder="VALUE"
                  value={entry.value}
                  onChange={e => handleEnvChange(entry.id, 'value', e.target.value)}
                  style={{ flex: 2 }}
                />
                <button type="button" className="icon-btn danger" onClick={() => handleEnvRemove(entry.id)}>✕</button>
              </div>
            ))}
          </div>
          <button type="button" className="add-env-btn" onClick={handleAddEnv}>+ 添加环境变量</button>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onCancel}>取消</button>
            <button type="submit" className="btn primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
}
