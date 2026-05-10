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

const DEFAULT_ENV_ENTRIES: { key: string; value: string }[] = [
  { key: 'ANTHROPIC_BASE_URL', value: '' },
  { key: 'ANTHROPIC_AUTH_TOKEN', value: '' },
  { key: 'ANTHROPIC_MODEL', value: '' },
  { key: 'ANTHROPIC_DEFAULT_HAIKU_MODEL', value: '' },
  { key: 'ANTHROPIC_DEFAULT_SONNET_MODEL', value: '' },
  { key: 'ANTHROPIC_DEFAULT_OPUS_MODEL', value: '' },
];

const REQUIRED_KEYS = new Set(['ANTHROPIC_BASE_URL', 'ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_MODEL']);

function buildInitial(provider: Provider | null): EnvEntry[] {
  if (provider) {
    return Object.entries(provider.env).map(([k, v]) => ({ id: crypto.randomUUID(), key: k, value: v }));
  }
  return DEFAULT_ENV_ENTRIES.map(e => ({ id: crypto.randomUUID(), ...e }));
}

export default function ProviderForm({ provider, onSave, onCancel }: Props) {
  const [id, setId] = useState(provider?.id ?? '');
  const [name, setName] = useState(provider?.name ?? '');
  const [envEntries, setEnvEntries] = useState(buildInitial(provider));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddEnv = () => setEnvEntries([...envEntries, { id: crypto.randomUUID(), key: '', value: '' }]);

  const handleEnvChange = (entryId: string, field: 'key' | 'value', val: string) => {
    setEnvEntries(prev => prev.map(e => e.id === entryId ? { ...e, [field]: val } : e));
    setErrors(prev => {
      const next = { ...prev };
      delete next[entryId];
      return next;
    });
  };

  const handleEnvRemove = (entryId: string) => {
    const entry = envEntries.find(e => e.id === entryId);
    if (!entry || REQUIRED_KEYS.has(entry.key)) return;
    setEnvEntries(envEntries.filter(e => e.id !== entryId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!id.trim()) newErrors['_id'] = '标识不能为空';
    if (!name.trim()) newErrors['_name'] = '名称不能为空';

    for (const entry of envEntries) {
      if (REQUIRED_KEYS.has(entry.key) && !entry.value.trim()) {
        newErrors[entry.id] = '此项为必填';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const env: Record<string, string> = {};
    envEntries.forEach(({ key, value }) => { if (key.trim()) env[key.trim()] = value; });
    onSave({ id: id.trim(), name: name.trim(), env });
  };

  return (
    <div className="modal-overlay">
      <div className="modal provider-form-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{provider ? '编辑提供商' : '新增提供商'}</h3>
          <button type="button" className="modal-close" onClick={onCancel}>✕</button>
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
          <label className="form-group" style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>
            环境变量 (env)
          </label>
          <div className="env-entries">
            {envEntries.map((entry) => {
              const isRequired = REQUIRED_KEYS.has(entry.key);
              return (
                <div key={entry.id} className="env-row">
                  <input
                    placeholder="KEY"
                    value={entry.key}
                    onChange={e => handleEnvChange(entry.id, 'key', e.target.value)}
                    className="env-key-input"
                    disabled={!!provider && Object.keys(provider.env).includes(entry.key)}
                  />
                  <input
                    placeholder={isRequired ? '必填' : 'VALUE'}
                    value={entry.value}
                    onChange={e => handleEnvChange(entry.id, 'value', e.target.value)}
                    className={`env-value-input${errors[entry.id] ? ' input-error' : ''}`}
                  />
                  <button
                    type="button"
                    className={`icon-btn danger${isRequired ? ' icon-btn-disabled' : ''}`}
                    onClick={() => handleEnvRemove(entry.id)}
                    disabled={isRequired}
                    title={isRequired ? '必填项不可删除' : '删除'}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
          {errors._env && <p className="field-error">{errors._env}</p>}
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
