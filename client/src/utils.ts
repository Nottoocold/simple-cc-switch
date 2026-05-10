import type { Provider } from './types';

export function mergeProviderConfig(
  provider: Provider | null,
  common: Record<string, unknown> | undefined,
  merge: boolean,
): Record<string, unknown> {
  if (!provider) return {};

  const config: Record<string, unknown> = { env: { ...provider.env } };

  if (merge && common) {
    const commonCopy = structuredClone(common);
    const commonEnv = (commonCopy.env as Record<string, unknown>) ?? {};
    delete commonCopy.env;
    Object.assign(config, commonCopy);
    config.env = { ...commonEnv, ...provider.env };
  }

  return config;
}

export function filterAnthropicEnv(settings: Record<string, unknown>): Record<string, unknown> {
  if (!settings.env || typeof settings.env !== 'object') return settings;
  const filteredEnv: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(settings.env as Record<string, unknown>)) {
    if (!k.startsWith('ANTHROPIC')) {
      filteredEnv[k] = v;
    }
  }
  return { ...settings, env: filteredEnv };
}
