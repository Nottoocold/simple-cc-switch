import { useState, useEffect, useCallback } from 'react';
import type { Provider, Presets } from './types';
import { fetchPresets, savePresets, saveSettings, fetchConfig, type ServerConfig } from './api';
import ProviderList from './components/ProviderList';
import ProviderForm from './components/ProviderForm';
import JsonEditor from './components/JsonEditor';
import CommonConfigModal from './components/CommonConfigModal';

export default function App() {
  const [presets, setPresets] = useState<Presets | null>(null);
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
  const [mergedConfig, setMergedConfig] = useState<Record<string, unknown>>({});
  const [settingsFile, setSettingsFile] = useState<string>('');
  const [mergeCommon, setMergeCommon] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [showCommonModal, setShowCommonModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchPresets().then(setPresets);
    fetchConfig().then(c => setSettingsFile(c.settingsFile));
  }, []);

  const doMerge = useCallback((provider: Provider | null, common: Record<string, unknown> | undefined, merge: boolean) => {
    if (!provider) { setMergedConfig({}); return; }
    const config: Record<string, unknown> = { env: { ...provider.env } };
    if (merge && common) {
      const commonCopy = JSON.parse(JSON.stringify(common)) as Record<string, unknown>;
      const commonEnv = (commonCopy.env as Record<string, unknown>) ?? {};
      delete commonCopy.env;
      Object.assign(config, commonCopy);
      // common env as base, provider env overrides same keys
      config.env = { ...commonEnv, ...provider.env };
    }
    setMergedConfig(config);
  }, []);

  const handleSelect = useCallback((p: Provider) => {
    setActiveProvider(p);
    doMerge(p, presets?.commonConfig, mergeCommon);
  }, [presets, mergeCommon, doMerge]);

  const handleToggleMerge = useCallback((checked: boolean) => {
    setMergeCommon(checked);
    doMerge(activeProvider, presets?.commonConfig, checked);
  }, [activeProvider, presets, doMerge]);

  const handleSaveSettings = async () => {
    try {
      await saveSettings(mergedConfig);
      showToast(`已保存到 ${settingsFile}`, 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    }
  };

  const handleSaveProvider = async (provider: Provider) => {
    if (!presets) return;
    const updated = { ...presets };
    const idx = updated.providers.findIndex(p => p.id === provider.id);
    if (idx >= 0) {
      updated.providers[idx] = provider;
    } else {
      updated.providers.push(provider);
    }
    await savePresets(updated);
    setPresets(updated);
    setShowForm(false);
    setEditingProvider(null);
    if (!activeProvider || activeProvider.id === provider.id) {
      setActiveProvider(provider);
      doMerge(provider, updated.commonConfig, mergeCommon);
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!presets) return;
    const updated = { ...presets, providers: presets.providers.filter(p => p.id !== id) };
    await savePresets(updated);
    setPresets(updated);
    if (activeProvider?.id === id) {
      setActiveProvider(null);
      setMergedConfig({});
    }
  };

  const handleEditProvider = (provider: Provider) => {
    setEditingProvider(provider);
    setShowForm(true);
  };

  const handleSaveCommonConfig = async (config: Record<string, unknown>) => {
    if (!presets) return;
    const updated = { ...presets, commonConfig: config };
    await savePresets(updated);
    setPresets(updated);
    setShowCommonModal(false);
    if (activeProvider) {
      doMerge(activeProvider, config, mergeCommon);
    }
    showToast('通用配置已保存', 'success');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">Provider 提供商</div>
        <ProviderList
          providers={presets?.providers ?? []}
          activeId={activeProvider?.id ?? null}
          onSelect={handleSelect}
          onEdit={handleEditProvider}
          onDelete={handleDeleteProvider}
        />
        <button className="add-provider-btn" onClick={() => { setEditingProvider(null); setShowForm(true); }}>
          + 新增提供商
        </button>
        <div className="sidebar-footer">
          <div className="sidebar-header">通用配置</div>
          <button className="btn" style={{ margin: 8, width: 'calc(100% - 16px)' }} onClick={() => setShowCommonModal(true)}>
            编辑通用配置
          </button>
        </div>
      </div>
      <div className="main">
        <div className="toolbar">
          <label>
            <input
              type="checkbox"
              checked={mergeCommon}
              onChange={e => handleToggleMerge(e.target.checked)}
            />
            合并通用配置
          </label>
          <span className="spacer" />
          <button className="btn primary" onClick={handleSaveSettings}>
            保存配置
          </button>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            → {settingsFile || '...'}
          </span>
        </div>
        <div className="editor-container">
          <JsonEditor value={mergedConfig} onChange={setMergedConfig} />
        </div>
      </div>
      {showForm && (
        <ProviderForm
          provider={editingProvider}
          onSave={handleSaveProvider}
          onCancel={() => { setShowForm(false); setEditingProvider(null); }}
        />
      )}
      {showCommonModal && (
        <CommonConfigModal
          config={presets?.commonConfig ?? {}}
          onSave={handleSaveCommonConfig}
          onCancel={() => setShowCommonModal(false)}
        />
      )}
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
