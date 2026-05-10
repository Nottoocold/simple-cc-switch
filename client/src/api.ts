import type { Presets } from './types';

const BASE = '/api';

export interface ServerConfig {
  settingsFile: string;
}

export async function fetchConfig(): Promise<ServerConfig> {
  const res = await fetch(`${BASE}/config`);
  return res.json();
}

export async function fetchPresets(): Promise<Presets> {
  const res = await fetch(`${BASE}/presets`);
  return res.json();
}

export async function savePresets(presets: Presets): Promise<void> {
  await fetch(`${BASE}/presets`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(presets)
  });
}

export async function fetchSettings(): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE}/settings`);
  if (!res.ok) {
    throw new Error('Failed to load settings.json');
  }
  return res.json();
}

export async function saveSettings(settings: Record<string, unknown>): Promise<void> {
  await fetch(`${BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
}
