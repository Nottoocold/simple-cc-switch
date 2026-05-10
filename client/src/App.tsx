import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import type { Provider, Presets } from './types';
import { fetchPresets, savePresets, saveSettings, fetchGlobalSettings, fetchConfig } from './api';
import { mergeProviderConfig, filterAnthropicEnv } from './utils';
import { useToast } from './hooks/useToast';
import { useTheme } from './hooks/useTheme';
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
  const [loading, setLoading] = useState(true);
  const { toast, showToast } = useToast();
  const { theme, toggle: toggleTheme } = useTheme();

  useEffect(() => {
    Promise.all([fetchPresets(), fetchConfig()]).then(([p, c]) => {
      setPresets(p);
      setSettingsFile(c.settingsFile);
      setLoading(false);
    });
  }, []);

  const recompute = (provider: Provider | null, common: Record<string, unknown> | undefined, merge: boolean) => {
    setMergedConfig(mergeProviderConfig(provider, common, merge));
  };

  const handleSelect = (p: Provider) => {
    setActiveProvider(p);
    recompute(p, presets?.commonConfig, mergeCommon);
  };

  const handleToggleMerge = (checked: boolean) => {
    setMergeCommon(checked);
    recompute(activeProvider, presets?.commonConfig, checked);
  };

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
      recompute(provider, updated.commonConfig, mergeCommon);
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
      recompute(activeProvider, config, mergeCommon);
    }
    showToast('通用配置已保存', 'success');
  };

  const handleExtractCommonConfig = async (): Promise<Record<string, unknown>> => {
    const settings = await fetchGlobalSettings();
    return filterAnthropicEnv(settings);
  };

  if (loading) {
    return <div className="app"><div className="loading">加载中...</div></div>;
  }

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
          <button className="btn sidebar-btn" onClick={() => setShowCommonModal(true)}>
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
          <button className="btn theme-btn" onClick={toggleTheme} title="切换主题">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <span className="spacer" />
          <button className="btn primary" onClick={handleSaveSettings}>
            保存配置
          </button>
          <span className="toolbar-path">
            → {settingsFile || '...'}
          </span>
        </div>
        <div className="editor-container">
          <JsonEditor value={mergedConfig} onChange={setMergedConfig} theme={theme} />
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
          onExtract={handleExtractCommonConfig}
          theme={theme}
        />
      )}
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
