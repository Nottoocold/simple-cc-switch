const express = require("express");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();
app.use(express.json());

const PRESETS_FILE = path.join(__dirname, "cc-switch-presets.json");
const SETTINGS_FILE = process.env.NODE_ENV === "production"
  ? path.join(os.homedir(), ".claude", "settings.json")
  : path.join(__dirname, "settings.dev.json");

const DEFAULT_PRESETS = {
  providers: [],
  commonConfig: {
    alwaysThinkingEnabled: true,
    attribution: { commit: "", pr: "" },
    enabledPlugins: {},
    extraKnownMarketplaces: {},
  },
};

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function writeJSON(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

// Meta
app.get("/api/config", (req, res) => {
  res.json({ settingsFile: SETTINGS_FILE });
});

// Presets endpoints
app.get("/api/presets", (req, res) => {
  let presets = readJSON(PRESETS_FILE);
  if (!presets) {
    presets = DEFAULT_PRESETS;
    writeJSON(PRESETS_FILE, presets);
  }
  res.json(presets);
});

app.put("/api/presets", (req, res) => {
  writeJSON(PRESETS_FILE, req.body);
  res.json({ ok: true });
});

// Global settings — always reads ~/.claude/settings.json
app.get("/api/settings/global", (req, res) => {
  const globalFile = path.join(os.homedir(), ".claude", "settings.json");
  const settings = readJSON(globalFile);
  if (!settings) {
    return res.status(404).json({ error: "Global settings.json not found" });
  }
  res.json(settings);
});

// Settings endpoints
app.get("/api/settings", (req, res) => {
  const settings = readJSON(SETTINGS_FILE);
  if (!settings) {
    return res.status(404).json({ error: "settings.json not found" });
  }
  res.json(settings);
});

app.put("/api/settings", (req, res) => {
  writeJSON(SETTINGS_FILE, req.body);
  res.json({ ok: true });
});

// Serve static frontend in production
const distPath = path.join(__dirname, "client", "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

const PORT = 3456;
app.listen(PORT, () => {
  console.log(`cc-switch server running at http://localhost:${PORT}`);
  console.log(`Settings target: ${SETTINGS_FILE}`);
});
