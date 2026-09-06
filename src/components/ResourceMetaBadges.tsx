import { getResourceScope, stageLabels } from '../resourceLinks'
import type { Novel, ResourceStage } from '../types'

export function ResourceMetaBadges({ stage, novelIds, novels }: { stage: ResourceStage; novelIds: string[]; novels: Novel[] }) {
  const scope = getResourceScope(novelIds)
  const linkedTitles = novels.filter((novel) => novelIds.includes(novel.id)).map((novel) => novel.title)
  const scopeLabel = scope === 'independent'
    ? '独立资料'
    : scope === 'exclusive'
      ? `《${linkedTitles[0] ?? '未知小说'}》专属`
      : `共享 · ${linkedTitles.length} 部小说`

  return <span className="resource-badges"><i className={`resource-stage ${stage}`}>{stageLabels[stage]}</i><i className={`resource-scope ${scope}`}>{scopeLabel}</i></span>
}
