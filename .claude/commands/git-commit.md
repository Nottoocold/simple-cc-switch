---
description: 按项目规范创建 git commit，参数可选（文件路径或提交描述）
argument-hint: "[文件路径或描述]"
---

请严格按照 `.claude/COMMIT_CONVENTION.md` 中定义的提交规范执行以下步骤。

## 步骤

### 1. 确定要提交的文件

如果用户提供了参数（如文件路径），则只提交那些文件。如果用户没有提供参数，则提交所有已暂存（staged）的文件。

执行 `git status` 和 `git diff --staged --stat` 确认当前状态。

如果没有暂存文件且用户未指定文件，执行 `git diff --stat` 查看未暂存的变更，询问用户是否需要暂存并提交。

### 2. 查看变更内容

执行 `git diff --staged` 查看即将提交的变更详情。如果用户指定了未暂存的文件，先 `git add` 这些文件后再查看 diff。

### 3. 生成提交信息

根据 diff 内容和用户的描述（如有），严格按照 `.claude/COMMIT_CONVENTION.md` 规范生成提交信息：

- 格式：`<type>(<scope>): <subject>`
- `type` 从以下中选择：feat, fix, refactor, style, docs, chore, test, perf
- `scope` 从以下中选择：server, client, api, presets，无明确归属时可省略
- `subject` 使用中文祈使句，不超过 50 字符，不以句号结尾
- 如果变更涉及多个不相关的改动，在 body 中分行说明

### 4. 展示提交信息并确认

向用户展示生成的提交信息，简要说明 type 和 scope 的选择依据，然后直接执行 `git commit`（无需再次确认，因为用户调用此命令即表示同意提交）。

如果用户参数中明确提出了提交信息的要求（如 "提交信息为 xxx"），优先使用用户指定的信息。
