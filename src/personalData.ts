export interface PersonalEntry {
  id: string
  title: string
  excerpt: string
  category: string
  date: string
  status: 'published' | 'draft'
}

export interface PersonalProject {
  id: string
  title: string
  summary: string
  kind: string
  status: string
  accent: string
}

export const profile = {
  name: '冯唐正',
  handle: 'fengtangzheng',
  tagline: '在技术、创作与生活之间持续记录。',
  introduction: '这里收集我正在学习的事、做过的项目、偶尔成形的想法，以及还在生长中的故事。',
}

export const notes: PersonalEntry[] = [
  {
    id: 'note-personal-site',
    title: '把个人网站重新当作一个长期项目',
    excerpt: '主页不是一次性交付物，而是一个持续生长的入口。先把真正会长期使用的内容放进来。',
    category: '随手记',
    date: '2026.08.31',
    status: 'published',
  },
  {
    id: 'note-human-touch',
    title: 'Vibe Coding 之后，仍然需要人的时间',
    excerpt: 'AI 可以加快搭建速度，但内容是否值得读，最后还是取决于作者愿意投入多少真实判断。',
    category: '思考',
    date: '2026.08.30',
    status: 'draft',
  },
]

export const learning: PersonalEntry[] = [
  {
    id: 'learning-design-system',
    title: '设计系统：先写下不可违反的原则',
    excerpt: '颜色、字体和圆角只是表层，稳定的视觉判断来自一组明确的约束。',
    category: '设计 × AI',
    date: '学习中',
    status: 'published',
  },
  {
    id: 'learning-graph-data',
    title: '关系图不只是画布，而是结构化数据',
    excerpt: '当节点和关系可以被查询、引用和校验时，图才真正参与创作。',
    category: '产品 × 工程',
    date: '已整理',
    status: 'published',
  },
  {
    id: 'learning-writing',
    title: '长篇故事中的人物一致性',
    excerpt: '从动机、秘密和关系变化出发，建立能够被章节引用的人物档案。',
    category: '写作',
    date: '待补充',
    status: 'draft',
  },
]

export const projects: PersonalProject[] = [
  {
    id: 'project-cactus',
    title: 'Cactus',
    summary: '本地优先的个人内容工作台，以及与之配套的公开主页。',
    kind: '个人网站',
    status: '持续构建',
    accent: '#5d745f',
  },
  {
    id: 'project-fog-letter',
    title: '雾都来信',
    summary: '关于记忆、城市与送信人的长篇悬疑幻想小说。',
    kind: '小说创作',
    status: '草稿中',
    accent: '#687889',
  },
  {
    id: 'project-learning-log',
    title: '学习档案',
    summary: '把零散阅读、实验和技术调查整理成可复用的知识。',
    kind: '知识整理',
    status: '长期更新',
    accent: '#a36c4f',
  },
]
