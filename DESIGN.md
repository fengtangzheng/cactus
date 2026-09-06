# Cactus Design System

> Cactus / 掌仙人是祁珞（Kiro，简称 KK）的虚拟个人空间。
> Keep Keen — 保持敏锐，也保持热忱。

## 1. Product Definition

Cactus 同时包含两个边界清晰的产品表面：

1. **公开个人网站**：面向访客，展示祁珞的公开身份、随笔、创作内容和经过筛选的角色素材。
2. **本地内容工作台**：只在本机运行，用于编辑随笔、设定、角色、关系图、小说章节、媒体素材和公开范围。

祁珞是网站唯一对外身份。网站、页面标题、作者署名和社交分享信息中不得出现现实身份信息。

### Identity hierarchy

| 层级 | 名称 | 用途 |
|---|---|---|
| 品牌 | Cactus / 掌仙人 | 网站、工作台和内容系统的名称 |
| 虚拟身份 | 祁珞 / Kiro | 完整人物身份，用于 About 和正式署名 |
| 简称 | KK / 卡卡 | 导航、头像、图形标志和日常称呼 |
| 精神标语 | Keep Keen | 品牌签名：保持敏锐，也保持热忱 |

不要在同一视觉层级同时展示全部名称。常规页面优先使用 `Cactus` 和 `KK`；`祁珞 / Kiro` 仅在正式介绍、作者署名或角色档案中展开。

## 2. Information Architecture

### Local studio

```text
Cactus Studio
├── 个人总览
│   ├── 公开内容统计
│   ├── 私密创作统计
│   └── 最近活动足迹
├── 随笔
│   ├── 全部
│   ├── 草稿
│   ├── 已发布
│   └── 随笔编辑器
├── 创作空间
│   ├── 设定集
│   ├── 角色档案
│   │   ├── 基础资料
│   │   ├── 人物设定
│   │   └── 图片 / 视频库
│   ├── 角色关系图
│   └── 小说
│       ├── 小说列表
│       ├── 小说概览
│       └── 章节编辑器
├── 关于
└── 发布中心
```

### Public site

```text
/
├── /essays
├── /essays/:slug
├── /creation
├── /fiction/:novelSlug
├── /fiction/:novelSlug/chapters/:chapterSlug
└── /about
```

公开网站最终采用真实多页面结构。首页负责建立身份、展示摘要和提供入口，不承载所有完整内容。

## 3. Data Relationships

创作空间的各模块拥有独立入口和独立编辑界面，但允许受控引用。

### Resource ownership

设定、角色和关系保存在全局资料库中，小说中的 ID 数组是关联关系的唯一数据源：

```text
0 个小说引用  → 独立资料
1 个小说引用  → 小说专属
2 个以上引用  → 多作品共享
```

资料范围不单独存储，由引用数量实时推导。设定与角色另外拥有互不冲突的内容阶段：`inspiration`（灵感）、`developing`（整理中）、`canonical`（正式资料）、`archived`（归档）。公开范围仍由 `visibility` 独立控制。

- 从小说移除资料只解除引用，不删除资料本体。
- 删除资料本体时清理所有小说中的对应引用。
- 删除小说时保留设定、角色和关系；失去最后一个引用的资料自动成为独立资料。
- 共享资料被编辑时，所有引用它的小说读取同一份内容。
- 不同作品中的同名异版角色应复制为独立角色，避免共享档案产生冲突。

### Character and relationship graph

- 角色档案是角色数据的唯一来源。
- 关系图节点引用 `characterId`，不得复制角色资料。
- 关系边记录 `sourceId`、`targetId`、关系类型、说明和公开范围。
- 从角色档案可跳转到该角色在关系图中的位置。
- 从关系图节点可返回对应角色档案。
- 删除角色前必须提示关联关系数量，不得静默级联删除。

### Novel overview

小说概览通过 ID 弱关联设定、角色、关系和章节：

```text
settingIds
characterIds
relationshipIds
chapterIds
```

小说概览只展示摘要、数量、进度和跳转入口。实际编辑仍发生在各自独立模块中。

### Footprints

个人总览中的“足迹”首期定义为活动时间线：

- 新建或修改随笔
- 新建角色或关系
- 更新设定
- 完成章节
- 发布公开内容

不使用没有稳定数据来源的旅行地图、虚构热力图或装饰性统计。

## 4. Visual Direction

### Style name

**Cactus Archive — 温暖纸张上的编辑式个人档案**

风格参考：

- 公开网站：Refero `Home` 的编辑式大标题、留白和细线结构。
- 本地工作台：Refero `Notion` 的温暖纸张与清晰操作密度。
- 小说专题：Refero `Miranda` 的深色整版和戏剧化字体层级。

### Five non-negotiable principles

1. **内容优先于容器**：优先使用字体、留白和细线分区，避免把每段内容装进圆角卡片。
2. **只有一个主强调色**：仙人掌绿承担主操作和品牌识别；戈壁橙只用于编号、印章和低频状态。
3. **中文必须可读**：正文不得小于 15px，辅助信息不得小于 11px，不以极小字号换取“精致感”。
4. **KK 是向导而非装饰模特**：人物素材只出现在身份、About 和少量叙事节点中，不在每个模块重复出现。
5. **公开与私密在数据层隔离**：公开页面不得依靠 CSS 隐藏私密信息，必须只读取独立公开快照。

## 5. Design Tokens

### Colors

| Token | Value | Role |
|---|---|---|
| `--paper` | `#F3EFE5` | 页面背景、温暖纸张 |
| `--paper-raised` | `#F8F5ED` | 工作台面板和编辑区域 |
| `--ink` | `#1D211C` | 主文字、深色表面 |
| `--cactus` | `#3F5141` | 主按钮、链接、品牌标记 |
| `--sage` | `#C5CEC2` | 图片底色、辅助表面 |
| `--fog` | `#CBCBC7` | 边框、禁用状态和媒体背景 |
| `--desert` | `#B8663D` | 编号、印章、少量警示 |
| `--muted` | `#716B62` | 次要文字 |

禁止引入第二个高饱和主色。功能状态色应保持低饱和，并避免与品牌色竞争。

### Typography

| Role | Font | Desktop size | Mobile size |
|---|---|---:|---:|
| Hero display | Songti SC / Source Han Serif SC | 72–96px | 48–60px |
| Section heading | Songti SC / Source Han Serif SC | 36–44px | 28–34px |
| Card heading | Songti SC / Source Han Serif SC | 20–24px | 18–21px |
| Body | PingFang SC / Inter | 15–17px | 15–16px |
| UI label | PingFang SC / Inter | 13–14px | 13–14px |
| Metadata | PingFang SC / Inter | 11–12px | 11–12px |

- 中文展示标题字距控制在 `0–0.04em`。
- 英文微标签可使用大写和 `0.12–0.18em` 字距。
- 长正文行宽控制在 32–40 个汉字。
- 正文行高为 `1.75–1.95`。

### Spacing and shape

- 公开页面最大内容宽度：`1280–1400px`。
- 公开章节垂直间距：`88–120px`。
- 工作台面板间距：`16–24px`。
- 公开卡片圆角：`0–6px`。
- 工作台控件圆角：`8–10px`。
- 不使用通用灰色悬浮阴影；主要依靠边框、留白和表面色区分层级。

## 6. KK Image System

首期只使用以下三张素材：

| File | Use |
|---|---|
| `kaka-v1-promo-half-body.png` | 首页 Hero 右侧主视觉，保留袖口 KK 刺绣 |
| `kaka-v1-full-body.png` | About / Meet KK 人物档案主图 |
| `kaka-v1-face-standard.png` | 人物特写、社交分享图或页面间的编辑插图 |

### Image rules

- 所有页面必须明确标注 `VIRTUAL PERSONA · KK`，避免被理解为现实人物照片。
- 原图不直接上线。必须生成 WebP/AVIF 响应式版本。
- 默认使用硬边矩形或 `0–4px` 小圆角，不使用常见圆形头像卡片。
- 对图像加入轻微暖灰、灰绿调色和少量印刷颗粒，降低摄影棚与生成式写真感。
- 每张主图在单个长页面中最多出现一次；可通过裁切产生眼部、袖口或半身细节，但不重复完整构图。
- 导航栏使用 `KK` 字母标志，不使用写实人脸头像。

### Required derivatives

```text
hero-1200.webp       首页主视觉
portrait-960.webp    About 人物档案
face-800.webp        人物特写
social-1200x630.webp 社交分享图
thumb-480.webp       媒体库缩略图
```

## 7. Page Composition

### Public home

```text
Cactus / 掌仙人                     随笔  创作  关于

KEEP KEEN.                         KK 半身图
保持敏锐，也保持热忱。             VIRTUAL PERSONA · KK
祁珞的个人内容空间

最近随笔
创作中的内容
Meet KK 摘要
页脚品牌签名
```

首页使用半身图一次。不得同时堆叠全身图和脸部特写。

### About

About 页面包含：

- 祁珞 / Kiro、KK / 卡卡
- Cactus / 掌仙人的品牌关系
- Keep Keen 的含义
- 精简人物介绍
- 完整虚拟人物小传
- 全身图与脸部特写组成的双栏编辑画面
- 生成式素材说明

### Essay pages

- 列表页使用标题、摘要、发布日期和标签，不使用图片卡片瀑布流。
- 详情页采用长文阅读版式。
- 编辑入口只存在于本地工作台。
- 状态首期包含 `draft`、`published`、`archived`。

### Creation space

- 设定集、角色档案、关系图和小说拥有平级入口。
- 关系图使用角色指定的“关系图头像”，不加载完整媒体库。
- 小说概览展示关联数据摘要和章节列表。
- 章节页以正文编辑器为中心，其他信息通过侧栏引用。

## 8. Character Media Library

### Media model

```ts
interface MediaAsset {
  id: string
  characterId: string
  type: 'image' | 'video'
  localPath: string
  posterPath?: string
  title: string
  caption?: string
  tags: string[]
  visibility: 'private' | 'public'
  role?: 'portrait' | 'cover' | 'graph-avatar' | 'gallery'
  sortOrder: number
  source?: string
  createdAt: string
}
```

### Media behavior

- 支持图片和视频上传、排序、标题、说明、标签和公开范围。
- 每个角色最多指定一个主头像、一个封面和一个关系图头像。
- 视频必须生成封面、时长、尺寸和网页转码版本。
- 原始媒体保存在本地私有目录，元数据保存在本地数据库。
- GitHub Pages 只接收公开且经过压缩的衍生文件。

## 9. Publishing and Privacy

### GitHub Pages can display

- Cactus / 掌仙人品牌信息。
- 祁珞 / Kiro、KK / 卡卡和 Keep Keen 的公开人物介绍。
- 个人总览中基于公开数据生成的统计。
- 公开活动足迹，不包含本地编辑历史。
- 状态为 `published` 的随笔。
- 标记为公开的小说及已发布章节。
- 明确标记公开的设定条目。
- 明确标记公开的角色字段。
- 当两个角色均公开且关系本身公开时，对应的角色关系。
- 明确标记公开并经过压缩、转码的图片和视频。

### GitHub Pages must never receive

- 草稿随笔、未发布章节和归档内容。
- 作者秘密、内部备注和人物隐藏字段。
- 私密设定、私密角色和私密关系。
- 原始图片、原始视频、私密媒体和本地媒体路径。
- 本地活动日志、文件路径、数据库文件和编辑器状态。
- 现实身份信息、登录信息、Token 或其他凭据。
- 本地工作台的编辑能力和管理入口。

### Public repository warning

GitHub Pages 的页面内容来自 `content/public.json` 和公开媒体快照，但当前 GitHub 仓库本身是公开的。因此：

- 所有被提交到 Git 的源码、历史提交和文件都可以被查看。
- 私密内容不得写入源码中的种子数据。
- 本地数据库、媒体原图、导出中间文件必须加入 `.gitignore`。
- 发布前必须运行公开产物检查，阻止现实姓名、私密标记和本地路径进入构建结果。
- 如果 GitHub 用户名也需要隐藏，应使用自定义域名或独立匿名 GitHub 账号。

## 10. Responsive Rules

- 桌面端 Hero 使用文字与半身图双栏。
- 小屏幕先显示文字，再显示人物图；不得因裁切丢失脸部或袖口 KK 标记。
- 公开站导航在移动端折叠为菜单。
- 本地工作台侧栏在短屏幕必须独立滚动，不能让导航溢出背景。
- 关系图在移动端退化为可滚动关系列表，完整画布优先在平板和桌面展示。
- 视频默认不自动播放；尊重 `prefers-reduced-motion`。

## 11. Accessibility

- 正文与背景对比度至少满足 WCAG AA。
- 所有图片必须提供描述其叙事作用的替代文本。
- 装饰性裁切使用空 `alt`，避免重复朗读。
- 视频必须提供字幕或文字摘要。
- 不能只依靠颜色表达公开状态、草稿状态或关系倾向。
- 键盘可以完成导航、编辑、媒体排序和关系图节点选择。

## 12. Do and Don't

### Do

- 使用真实内容、编辑痕迹和明确的公开范围建立可信度。
- 用一张人物素材建立一个视觉章节。
- 让公开页面通过排版和留白形成节奏。
- 让本地工作台保持直接、清晰和高效率。
- 在每次发布时生成新的独立公开快照。

### Don't

- 不把网站设计成虚拟偶像写真站。
- 不在多个区块反复出现同一张 KK 完整照片。
- 不使用大量大圆角卡片、玻璃拟态和通用灰色阴影。
- 不虚构没有数据来源的统计与足迹。
- 不把现实姓名、真实身份或本地隐私写入公开内容。
- 不直接把大型 PNG 和原始视频提交到 Pages。
