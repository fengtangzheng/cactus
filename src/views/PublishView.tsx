import { Check, Download, Eye, EyeOff, Globe2, ShieldCheck } from 'lucide-react'
import type { NovelProject } from '../types'

export function PublishView({ project, onPreview, onExport }: { project: NovelProject; onPreview: () => void; onExport: () => void }) {
  const publicCharacters = project.characters.filter((item) => item.visibility === 'public').length
  const publicSettings = project.settings.filter((item) => item.visibility === 'public').length
  const publicRelationships = project.relationships.filter((item) => item.visibility === 'public').length

  return (
    <div className="view-stack publish-view">
      <section className="publish-hero">
        <span className="publish-icon"><Globe2 size={25} /></span>
        <span className="eyebrow">公开阅读区</span>
        <h2>把故事交给读者之前，再看一眼。</h2>
        <p>公开主页只会使用明确标记为“可公开”的内容，作者秘密和私密关系不会进入发布数据。</p>
        <div className="publish-actions">
          <button className="ghost-button" onClick={onExport}><Download size={16} /> 导出公开快照</button>
          <button className="primary-button" onClick={onPreview}><Eye size={16} /> 预览公开主页</button>
        </div>
      </section>
      <section className="publish-checks">
        <article><Check size={16} /><div><strong>{publicCharacters} 位公开角色</strong><small>{project.characters.length - publicCharacters} 位角色保持私密</small></div></article>
        <article><Check size={16} /><div><strong>{publicSettings} 条公开设定</strong><small>{project.settings.length - publicSettings} 条设定保持私密</small></div></article>
        <article><Check size={16} /><div><strong>{publicRelationships} 条公开关系</strong><small>{project.relationships.length - publicRelationships} 条关系保持私密</small></div></article>
        <article className="secure"><ShieldCheck size={18} /><div><strong>秘密字段强制隔离</strong><small>即使角色公开，“作者秘密”也不会发布</small></div></article>
      </section>
      <section className="publish-warning"><EyeOff size={18} /><div><strong>发布采用独立快照</strong><p>导出的 public.json 只包含可公开内容。替换 content/public.json 并推送后，GitHub Pages 才会更新。</p></div></section>
    </div>
  )
}
