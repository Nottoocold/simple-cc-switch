# Git 代码提交规范

## 提交格式

```
<type>(<scope>): <subject>

[body]
```

## Type 类型

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 bug |
| `refactor` | 重构（不改变功能） |
| `style` | 代码格式（空格、分号等，不影响逻辑） |
| `docs` | 文档变更（README、注释等） |
| `chore` | 构建/工具/依赖变更 |
| `test` | 添加或修改测试 |
| `perf` | 性能优化 |

## Scope 范围

本项目 scope 按模块划分：

| Scope | 说明 |
|-------|------|
| `server` | Express 后端 |
| `client` | React 前端 |
| `api` | API 通信层 |
| `presets` | 预设/配置管理 |

无明确模块归属时可省略 scope。

## Subject 主题

- 使用中文描述，简明扼要
- 不超过 50 个字符
- 不以句号结尾
- 使用祈使句（如："新增提取通用配置功能"）

## 示例

```
feat(client): 新增提取通用配置功能
fix(server): 修复全局配置读取路径错误
refactor(client): 提取配置合并逻辑为独立函数
chore: 更新依赖版本
docs: 补充 README 开发环境说明
```
