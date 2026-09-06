# Cactus 跨设备创作配置

## 架构边界

- `https://fengtangzheng.github.io/cactus/`：公开阅读站，只包含已发布内容。
- `https://fengtangzheng.github.io/cactus/studio/`：创作后台前端，必须登录后才读取云端项目。
- Supabase `cactus_projects`：完整私密创作数据。
- Supabase `cactus_project_revisions`：每次成功保存后的历史版本。
- Supabase Storage `cactus-private`：角色图片与视频，使用短期签名地址读取。

前端只能使用 Publishable Key。不要在网页、GitHub 仓库或 GitHub Pages 变量中放置 `service_role` Key。

## 1. 创建 Supabase 项目

在 Supabase Dashboard 创建项目，保存以下两项：

- Project URL
- Publishable Key（旧项目可能显示为 anon key）

## 2. 初始化数据库与私有媒体库

在 Supabase SQL Editor 执行：

```text
supabase/migrations/202609060001_cactus_sync.sql
```

迁移会创建项目表、版本历史、原子保存函数、RLS 策略和私有 Storage bucket。

## 3. 配置登录回调

在 Authentication → URL Configuration 中添加：

```text
https://fengtangzheng.github.io/cactus/studio/
http://127.0.0.1:5173/
```

邮箱 Magic Link 默认即可使用。若启用 GitHub 登录，还需在 Supabase 的 GitHub Provider 页面按提示配置 GitHub OAuth App；OAuth callback 使用 Supabase 页面给出的 `/auth/v1/callback` 地址。

## 4. 本地配置

复制 `.env.example` 为 `.env.local`，填写：

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

然后重新运行：

```bash
./start
```

在本机后台右上角打开“跨设备创作”，登录后会执行首次迁移：

1. 上传当前本地项目。
2. 将 IndexedDB 中尚未同步的私有图片和视频上传到私有 bucket。
3. 保留本地缓存，不删除原始本地数据。

## 5. GitHub Pages 配置

在仓库 Settings → Secrets and variables → Actions → Variables 添加：

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
```

重新运行 Pages 工作流后，平板访问：

```text
https://fengtangzheng.github.io/cactus/studio/
```

## 冲突规则

- 单设备编辑：约 1.2 秒后自动保存。
- 云端版本和本地版本只有一方变化：自动使用变化的一方。
- 两台设备都基于旧版本修改：停止自动覆盖，要求明确选择“保留当前设备”或“使用云端版本”。
- 每次云端保存都会生成历史版本，便于后续恢复。

## 当前阶段限制

- 公开站仍读取仓库中的 `content/public.json`；云端创作内容不会自动发布。
- 版本历史已写入数据库，但恢复历史版本的界面尚未实现。
- 首次启用需要先从保存现有内容的电脑执行迁移，再在平板登录。
