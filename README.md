# CC Switch

Claude Code 配置管理工具，通过 Web GUI 管理多个 LLM 提供商并一键切换 `~/.claude/settings.json`。

## 功能

- **Provider 管理**：新增、编辑、删除多个 LLM 提供商，每个提供商管理独立的 `env` 环境变量（`ANTHROPIC_BASE_URL`、`ANTHROPIC_AUTH_TOKEN`、`ANTHROPIC_MODEL` 等），新增时预填 6 个常用 KEY
- **表单校验**：必填项（URL、Token、Model）非空校验，必填项不可删除
- **通用配置管理**：编辑非 `env` 的通用设置（`alwaysThinkingEnabled`、`enabledPlugins`、`attribution` 等），通用配置的 `env` 字段会与提供商 `env` 深度合并
- **提取通用配置**：从当前 `~/.claude/settings.json` 一键提取非提供商专属配置，合并而非覆盖
- **实时预览与编辑**：选择提供商后自动合并生成最终配置，支持 Monaco JSON 编辑器自由修改
- **主题切换**：亮色 / 暗色双主题，跟随系统偏好，持久化存储
- **一键保存**：保存到 `settings.json`，生产环境直接写入 `~/.claude/settings.json`

## 快速开始

```bash
cd simple-cc-switch
npm install
npm --prefix client install
```

### 开发环境

```bash
npm run dev          # 同时启动后端 (:3456) 和前端 (:5173)
```

或分别启动：

```bash
npm run dev:server   # 后端 http://localhost:3456
npm run dev:client   # 前端 http://localhost:5173 (HMR)
```

开发环境写入 `settings.dev.json`，不影响真实配置。

### 生产环境

**前台运行（适合临时使用）：**

```bash
npm start            # 构建前端 + 启动单端口服务
```

**守护进程（推荐，适合长期使用）：**

```bash
npm install -g pm2               # 全局安装 pm2（仅需一次）
npm run start:daemon             # 构建 + 启动后台守护进程
pm2 startup && pm2 save          # 配置开机自启（可选）
```

常用运维命令：

```bash
npm run stop        # 停止
npm run restart     # 重启
npm run logs        # 实时日志
npm run status      # 运行状态
```

## 项目结构

```
simple-cc-switch/
├── server.js                    # Express 后端 (API + 静态文件)
├── ecosystem.config.cjs         # pm2 守护进程配置
├── package.json                 # 项目脚本
├── cc-switch-presets.json       # 预设数据 (Provider + 通用配置)
├── settings.dev.json            # 开发环境配置目标
└── client/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    └── src/
        ├── main.tsx
        ├── App.tsx              # 主应用
        ├── App.css              # 全局样式 + 主题变量
        ├── api.ts               # API 通信层
        ├── types.ts             # 类型定义
        ├── utils.ts             # 纯工具函数 (合并、过滤)
        ├── hooks/
        │   ├── useToast.ts      # Toast 通知 hook
        │   └── useTheme.ts      # 主题切换 hook
        └── components/
            ├── ProviderList.tsx        # 左侧提供商列表
            ├── ProviderForm.tsx        # 新增/编辑提供商弹窗
            ├── JsonEditor.tsx          # Monaco JSON 编辑器
            └── CommonConfigModal.tsx   # 通用配置编辑弹窗
```

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/config` | 获取当前配置目标路径 |
| GET | `/api/presets` | 获取所有预设 (Provider + 通用配置) |
| PUT | `/api/presets` | 保存预设 |
| GET | `/api/settings` | 读取目标 settings.json |
| PUT | `/api/settings` | 写入目标 settings.json |
| GET | `/api/settings/global` | 始终读取 `~/.claude/settings.json` |

## 技术栈

- **后端**：Node.js + Express
- **前端**：React 18 + TypeScript + Vite
- **编辑器**：Monaco Editor
- **图标**：lucide-react
- **进程管理**：pm2

## 开发规范

- Git 提交遵循 [`.claude/COMMIT_CONVENTION.md`](.claude/COMMIT_CONVENTION.md)
- 使用 `/git-commit` 命令按规范生成提交信息
