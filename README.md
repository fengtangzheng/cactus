# Cactus Novel Studio

一个“公开阅读站 + 私密创作工作台”的小说创作原型。首期集中验证设定、角色档案和角色关系图三类核心创作数据。

## 本地启动

```bash
npm install
npm run dev
```

构建检查：

```bash
npm run typecheck
npm run build
```

公开阅读站：

```bash
npm run public:dev
npm run public:build
npm run public:verify
```

## 当前能力

- 创作概览与章节状态
- 设定条目的新增、编辑、分类与公开范围
- 角色档案与强制隔离的“作者秘密”字段
- 可拖拽角色关系图、关系新增和编辑
- 公开主页本地预览
- 使用 `localStorage` 保存当前浏览器里的创作数据
- 将脱敏内容导出为 `public.json`
- 独立构建 GitHub Pages 公开站点

## 隐私边界

当前版本是本地原型，不包含账号、服务端数据库或真正的发布操作。公开主页预览会过滤私密设定、私密角色和私密关系，并始终排除“作者秘密”。

正式部署时不能直接复用这一前端过滤方式：私密数据不得下发到公开页面。应由服务端从草稿数据生成独立的公开快照，公开站点只读取快照，并为创作工作台增加身份认证和数据权限校验。

当前 GitHub Pages 构建只读取 [content/public.json](content/public.json)，不会引用创作区的本地数据或种子数据。更新公开内容的流程是：

1. 在本地创作区的“发布中心”点击“导出公开快照”。
2. 用下载的文件替换 `content/public.json`。
3. 运行 `npm run public:build && npm run public:verify`。
4. 将变更推送到 `main`，GitHub Actions 会部署到 `https://fengtangzheng.github.io/cactus/`。

首次建库后，还需在 GitHub 仓库 **Settings → Pages → Build and deployment** 中把 Source 设置为 **GitHub Actions**。

## 下一阶段

1. 接入章节正文编辑器与自动保存。
2. 增加作品、卷、章、场景的数据层级。
3. 建立服务端草稿库、登录和公开快照发布流程。
4. 在章节中引用设定与角色，为一致性检查提供证据链。
