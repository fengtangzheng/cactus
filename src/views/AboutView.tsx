import { PersonaGallery } from '../components/PersonaGallery'
import type { NovelProject } from '../types'

export function AboutView({ project }: { project: NovelProject }) {
  const kiroAssets = (project.media ?? []).filter((asset) => asset.characterId === 'kiro')
  return <div className="about-studio-page">
    <div className="about-studio">
      <section className="about-studio-copy"><span className="eyebrow">VIRTUAL PERSONA · KK</span><h2>祁珞 <i>/ Kiro</i></h2><p className="about-lead">于风沙之中立身，于荒芜之地守心。<br />纵使身处旷野，亦不熄灭心中的光。</p><div className="about-divider" /><p>祁珞生长在祁连山北麓的河西戈壁。环境教会她自持与边界，如同仙人掌生出尖刺，不为攻击，只为守住内里的温热。</p><p>她是 Cactus / 掌仙人面向公开世界的虚拟身份。KK 是日常称呼，Keep Keen 则代表永葆热忱、保持敏锐。</p><dl><div><dt>品牌</dt><dd>Cactus / 掌仙人</dd></div><div><dt>代号</dt><dd>KK / 卡卡</dd></div><div><dt>精神内核</dt><dd>Keep Keen</dd></div></dl></section>
      <figure className="about-studio-portrait"><img src="/media/kk/portrait-960.webp?v=1.1" alt="虚拟人物祁珞的全身档案形象" /><figcaption>VIRTUAL PERSONA · GENERATED VISUAL ASSET</figcaption></figure>
    </div>
    <PersonaGallery assets={kiroAssets} />
  </div>
}
