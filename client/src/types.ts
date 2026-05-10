export interface Provider {
  id: string;
  name: string;
  env: Record<string, string>;
}

export interface Presets {
  providers: Provider[];
  commonConfig: Record<string, unknown>;
}
