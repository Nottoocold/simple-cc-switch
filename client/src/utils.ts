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

export function detectCurrentProvider(
  providers: Provider[],
  settingsEnv: Record<string, unknown> | undefined,
): Provider | null {
  if (!settingsEnv || providers.length === 0) return null;

  let best: Provider | null = null;
  let bestScore = 0;

  for (const p of providers) {
    const keys = Object.keys(p.env).filter(k => k.trim());
    if (keys.length === 0) continue;
    const matched = keys.filter(k => String(p.env[k]) === String(settingsEnv[k] ?? ''));
    if (matched.length > bestScore) {
      bestScore = matched.length;
      best = p;
    }
  }

  return best;
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
