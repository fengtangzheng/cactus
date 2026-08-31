import { useEffect, useMemo, useState } from 'react'
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeMouseHandler,
} from '@xyflow/react'
import { Eye, EyeOff, GitFork, Plus, Trash2, X } from 'lucide-react'
import type { Character, NovelProject, Relationship } from '../types'

interface GraphViewProps {
  project: NovelProject
  onChange: (project: NovelProject) => void
}

const toneColors: Record<Relationship['tone'], string> = {
  positive: '#6f8f78',
  negative: '#a75c52',
  neutral: '#8b8173',
  hidden: '#665a78',
}

function characterNodes(characters: Character[]): Node[] {
  const centerX = 390
  const centerY = 235
  const radius = 190
  return characters.map((character, index) => {
    const angle = (index / Math.max(characters.length, 1)) * Math.PI * 2 - Math.PI / 2
    return {
      id: character.id,
      position: { x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius },
      data: { label: character.name, role: character.role, visibility: character.visibility, color: character.color },
      className: 'story-node',
      style: { borderColor: character.color, boxShadow: `0 8px 24px ${character.color}22` },
    }
  })
}

function relationshipEdges(relationships: Relationship[]): Edge[] {
  return relationships.map((relationship) => ({
    id: relationship.id,
    source: relationship.sourceId,
    target: relationship.targetId,
    label: relationship.label,
    markerEnd: { type: MarkerType.ArrowClosed, color: toneColors[relationship.tone] },
    animated: relationship.tone === 'hidden',
    style: { stroke: toneColors[relationship.tone], strokeWidth: 1.8, strokeDasharray: relationship.visibility === 'private' ? '5 4' : undefined },
    labelStyle: { fill: '#4e4942', fontSize: 11, fontWeight: 600 },
    labelBgStyle: { fill: '#f7f4ed', fillOpacity: 0.9 },
  }))
}

const emptyRelationship = (project: NovelProject): Relationship => ({
  id: `relationship-${Date.now()}`,
  sourceId: project.characters[0]?.id ?? '',
  targetId: project.characters[1]?.id ?? project.characters[0]?.id ?? '',
  label: '新关系',
  detail: '',
  tone: 'neutral',
  visibility: 'private',
})

export function GraphView({ project, onChange }: GraphViewProps) {
  const [scope, setScope] = useState<'all' | 'public'>('all')
  const visibleCharacters = useMemo(() => scope === 'all' ? project.characters : project.characters.filter((character) => character.visibility === 'public'), [project.characters, scope])
  const visibleRelationships = useMemo(() => project.relationships.filter((relationship) => {
    if (scope === 'all') return true
    return relationship.visibility === 'public' && visibleCharacters.some((character) => character.id === relationship.sourceId) && visibleCharacters.some((character) => character.id === relationship.targetId)
  }), [project.relationships, scope, visibleCharacters])
  const [nodes, setNodes, onNodesChange] = useNodesState(characterNodes(visibleCharacters))
  const [edges, setEdges, onEdgesChange] = useEdgesState(relationshipEdges(visibleRelationships))
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [editingRelation, setEditingRelation] = useState<Relationship | null>(null)

  useEffect(() => setNodes(characterNodes(visibleCharacters)), [setNodes, visibleCharacters])
  useEffect(() => setEdges(relationshipEdges(visibleRelationships)), [setEdges, visibleRelationships])

  const onNodeClick: NodeMouseHandler = (_, node) => {
    setSelectedCharacter(project.characters.find((character) => character.id === node.id) ?? null)
  }

  function saveRelationship() {
    if (!editingRelation || editingRelation.sourceId === editingRelation.targetId || !editingRelation.label.trim()) return
    const exists = project.relationships.some((relationship) => relationship.id === editingRelation.id)
    onChange({
      ...project,
      relationships: exists
        ? project.relationships.map((relationship) => relationship.id === editingRelation.id ? editingRelation : relationship)
        : [...project.relationships, editingRelation],
    })
    setEditingRelation(null)
  }

  function removeRelationship(id: string) {
    onChange({ ...project, relationships: project.relationships.filter((relationship) => relationship.id !== id) })
    setEditingRelation(null)
  }

  return (
    <div className="graph-layout">
      <section className="graph-canvas-panel">
        <div className="graph-toolbar">
          <div className="segmented-control">
            <button className={scope === 'all' ? 'active' : ''} onClick={() => setScope('all')}><EyeOff size={14} /> 创作全图</button>
            <button className={scope === 'public' ? 'active' : ''} onClick={() => setScope('public')}><Eye size={14} /> 公开预览</button>
          </div>
          <button className="primary-button" onClick={() => setEditingRelation(emptyRelationship(project))}><Plus size={16} /> 添加关系</button>
        </div>
        <div className="graph-canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onEdgeClick={(_, edge) => setEditingRelation(project.relationships.find((relationship) => relationship.id === edge.id) ?? null)}
            fitView
            fitViewOptions={{ padding: 0.24 }}
            minZoom={0.55}
            maxZoom={1.7}
          >
            <Background color="#d8d1c4" gap={22} size={1} />
            <Controls showInteractive={false} />
            <MiniMap nodeColor={(node) => String(node.data.color)} maskColor="rgba(244, 241, 234, .72)" pannable />
          </ReactFlow>
        </div>
        <div className="graph-legend"><span><i className="solid" /> 可公开关系</span><span><i className="dashed" /> 私密 / 剧透</span><span><i className="moving" /> 隐藏关系</span></div>
      </section>

      <aside className="graph-inspector">
        {selectedCharacter ? (
          <>
            <button className="inspector-close" onClick={() => setSelectedCharacter(null)}><X size={16} /></button>
            <div className="inspector-portrait" style={{ '--character-color': selectedCharacter.color } as React.CSSProperties}>{selectedCharacter.name.slice(0, 1)}</div>
            <span className="eyebrow">角色节点</span>
            <h2>{selectedCharacter.name}</h2>
            <p className="inspector-role">{selectedCharacter.role} · {selectedCharacter.faction}</p>
            <dl className="character-facts">
              <div><dt>核心欲望</dt><dd>{selectedCharacter.motivation || '尚未填写'}</dd></div>
              <div><dt>性格</dt><dd>{selectedCharacter.personality || '尚未填写'}</dd></div>
            </dl>
            <div className="secret-block"><EyeOff size={14} /><span><strong>作者秘密</strong>{selectedCharacter.secret || '尚未填写'}</span></div>
            <div className="relation-list">
              <h3>相关关系</h3>
              {project.relationships.filter((relationship) => relationship.sourceId === selectedCharacter.id || relationship.targetId === selectedCharacter.id).map((relationship) => {
                const otherId = relationship.sourceId === selectedCharacter.id ? relationship.targetId : relationship.sourceId
                const other = project.characters.find((character) => character.id === otherId)
                return <button key={relationship.id} onClick={() => setEditingRelation(relationship)}><span>{other?.name ?? '未知角色'}</span><strong>{relationship.label}</strong></button>
              })}
            </div>
          </>
        ) : (
          <div className="inspector-empty"><GitFork size={27} /><h3>选择一个角色</h3><p>查看角色动机、秘密与全部关系。点击连线可以编辑关系。</p></div>
        )}
      </aside>

      {editingRelation && (
        <div className="drawer-backdrop" onMouseDown={() => setEditingRelation(null)}>
          <aside className="editor-drawer relation-drawer" onMouseDown={(event) => event.stopPropagation()}>
            <header className="drawer-header"><div><span className="eyebrow">故事网络</span><h2>编辑角色关系</h2></div><button className="icon-button" onClick={() => setEditingRelation(null)}><X size={18} /></button></header>
            <div className="form-stack">
              <label>发起角色<select value={editingRelation.sourceId} onChange={(event) => setEditingRelation({ ...editingRelation, sourceId: event.target.value })}>{project.characters.map((character) => <option value={character.id} key={character.id}>{character.name}</option>)}</select></label>
              <label>关联角色<select value={editingRelation.targetId} onChange={(event) => setEditingRelation({ ...editingRelation, targetId: event.target.value })}>{project.characters.map((character) => <option value={character.id} key={character.id}>{character.name}</option>)}</select></label>
              <label>关系标签<input value={editingRelation.label} onChange={(event) => setEditingRelation({ ...editingRelation, label: event.target.value })} placeholder="例如：盟友、宿敌、单向暗恋" /></label>
              <label>关系说明<textarea rows={5} value={editingRelation.detail} onChange={(event) => setEditingRelation({ ...editingRelation, detail: event.target.value })} /></label>
              <label>关系倾向<select value={editingRelation.tone} onChange={(event) => setEditingRelation({ ...editingRelation, tone: event.target.value as Relationship['tone'] })}><option value="positive">正向</option><option value="negative">负向</option><option value="neutral">中性</option><option value="hidden">隐藏关系</option></select></label>
              <div className="visibility-picker"><span>公开范围</span><div><button className={editingRelation.visibility === 'private' ? 'active' : ''} onClick={() => setEditingRelation({ ...editingRelation, visibility: 'private' })}>仅自己</button><button className={editingRelation.visibility === 'public' ? 'active' : ''} onClick={() => setEditingRelation({ ...editingRelation, visibility: 'public' })}>可公开</button></div></div>
            </div>
            <footer className="drawer-footer relation-footer">
              {project.relationships.some((relationship) => relationship.id === editingRelation.id) && <button className="danger-button" onClick={() => removeRelationship(editingRelation.id)}><Trash2 size={15} /> 删除</button>}
              <span />
              <button className="ghost-button" onClick={() => setEditingRelation(null)}>取消</button><button className="primary-button" onClick={saveRelationship}>保存关系</button>
            </footer>
          </aside>
        </div>
      )}
    </div>
  )
}
