# Cactus Personal Studio

一个“公开个人主页 + 私密创作工作台”。祁珞以 Cactus / 掌仙人的身份记录随笔与虚构世界，小说写作是创作区中的一个独立模块。

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

- 个人总览、随笔编辑与关于祁珞
- 创作概览与章节状态
- 设定条目的新增、编辑、分类与公开范围
- 角色档案与强制隔离的“作者秘密”字段
- 可拖拽角色关系图、关系新增和编辑
- 公开主页本地预览
- 使用 `localStorage` 保存当前浏览器里的创作数据
- 可选的 Supabase 登录、跨设备同步、版本冲突保护与私有媒体存储
- 将脱敏内容导出为 `public.json`
- 独立构建 GitHub Pages 公开站点

## 跨设备创作

未配置 Supabase 时，工作台继续使用浏览器本地数据；配置后可通过 `/cactus/studio/` 在电脑和平板之间同步项目和私有媒体。

完整配置步骤见 [SUPABASE.md](SUPABASE.md)。

## 隐私边界

公开主页预览会过滤私密设定、私密角色和私密关系，并始终排除“作者秘密”。Supabase 云端项目启用 RLS，完整创作数据只允许所属登录账号访问。

私密数据不会写入 `content/public.json`。公开站点只读取独立公开快照，部署到 `/cactus/studio/` 的工作台代码本身不包含用户的云端文档。

当前 GitHub Pages 构建只读取 [content/public.json](content/public.json)，不会引用创作区的本地数据或种子数据。更新公开内容的流程是：

1. 在本地创作区的“发布中心”点击“导出公开快照”。
2. 用下载的文件替换 `content/public.json`。
3. 运行 `npm run public:build && npm run public:verify`。
4. 将变更推送到 `main`，GitHub Actions 会部署到 `https://fengtangzheng.github.io/cactus/`。

首次建库后，还需在 GitHub 仓库 **Settings → Pages → Build and deployment** 中把 Source 设置为 **GitHub Actions**。

## 下一阶段

1. 将云端公开快照接入“发布中心”，支持平板直接发布。
2. 增加作品、卷、章、场景的数据层级。
3. 增加云端历史版本恢复界面。
4. 在章节中引用设定与角色，为一致性检查提供证据链。
