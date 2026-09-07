import { useEffect, useMemo, useRef, useState } from 'react'
import { Background, Controls, ReactFlow, ReactFlowProvider, applyNodeChanges, useNodesInitialized, useReactFlow, useStore, type Node, type NodeProps, type Viewport } from '@xyflow/react'
import { MapPin } from 'lucide-react'
import { MediaAssetMedia } from './MediaAssetMedia'
import type { MapMarker, MediaAsset, SettingMap } from '../types'
import '@xyflow/react/dist/style.css'

type MapNode = Node<{ label: string; asset?: MediaAsset; temporary?: boolean }, 'mapBase' | 'mapPin'>

function BaseNode({ data }: NodeProps<MapNode>) {
  return <div className="map-base-node">{data.asset && <MediaAssetMedia asset={data.asset} />}</div>
}

function PinNode({ data, selected }: NodeProps<MapNode>) {
  const zoom = useStore((state) => state.transform[2])
  return <div style={{ transform: `scale(${1 / zoom})` }} className={`map-pin ${data.temporary ? 'temporary' : ''} ${selected ? 'selected' : ''}`}>
    <MapPin size={23} /><span>{data.label}</span>
  </div>
}

const nodeTypes = { mapBase: BaseNode, mapPin: PinNode }

interface Props {
  map: SettingMap
  asset?: MediaAsset
  markers: Array<MapMarker & { displayLabel: string }>
  selectedId?: string
  focusToken: number
  adding: boolean
  viewport?: Viewport
  viewportSize?: { width: number; height: number }
  onViewport: (viewport: Viewport, size: { width: number; height: number }) => void
  onSelect: (id: string) => void
  onAdd: (x: number, y: number) => void
  onMove: (id: string, x: number, y: number) => void
}

function Canvas({ map, asset, markers, selectedId, focusToken, adding, viewport, viewportSize, onViewport, onSelect, onAdd, onMove }: Props) {
  const flow = useReactFlow<MapNode>()
  const [nodes, setNodes] = useState<MapNode[]>([])
  const initialized = useRef(false)
  const focusedMarker = useRef<string | undefined>(undefined)
  const width = useStore((state) => state.width)
  const height = useStore((state) => state.height)
  const lastSize = useRef({ width: 0, height: 0 })
  const nodesInitialized = useNodesInitialized()
  const initialNodes = useMemo<MapNode[]>(() => [
    {
      id: 'map-background', type: 'mapBase', position: { x: 0, y: 0 }, origin: [0, 0],
      data: { label: '地图底图', asset }, style: { width: map.width, height: map.height },
      draggable: false, selectable: false, focusable: false, connectable: false, zIndex: -1,
    },
    ...markers.map((marker): MapNode => ({
      id: marker.id, type: 'mapPin', origin: [0.5, 0.5], position: { x: marker.x * map.width, y: marker.y * map.height },
      data: { label: marker.displayLabel, temporary: !marker.locationId }, selected: marker.id === selectedId,
      ariaLabel: `地图标记：${marker.displayLabel}`, connectable: false,
    })),
  ], [asset, map.height, map.width, markers, selectedId])

  useEffect(() => setNodes(initialNodes), [initialNodes])
  useEffect(() => {
    if (!selectedId || focusedMarker.current === `${selectedId}:${focusToken}`) return
    const marker = markers.find((item) => item.id === selectedId)
    if (!marker) return
    focusedMarker.current = `${selectedId}:${focusToken}`
    void flow.setCenter(marker.x * map.width, marker.y * map.height, { zoom: flow.getZoom(), duration: 180 })
  }, [flow, focusToken, map.height, map.width, markers, selectedId])
  useEffect(() => {
    if (!width || !height || !nodesInitialized) return
    const previous = lastSize.current
    lastSize.current = { width, height }
    const reference = previous.width ? previous : viewportSize
    if (!reference || reference.width !== width || reference.height !== height) void flow.fitView({ padding: 0.08 })
  }, [flow, height, nodesInitialized, viewportSize, width])

  return <div className={`setting-map-canvas ${adding ? 'adding' : ''}`} aria-label="地图画布" onKeyDown={(event) => {
    const id = (event.target as HTMLElement).closest('[data-id]')?.getAttribute('data-id')
    const node = nodes.find((item) => item.id === id)
    if (!node || node.id === 'map-background') return
    if (event.key === 'Enter') onSelect(node.id)
    const moves: Record<string, [number, number]> = { ArrowLeft: [-0.01, 0], ArrowRight: [0.01, 0], ArrowUp: [0, -0.01], ArrowDown: [0, 0.01] }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    onMove(node.id, Math.max(0, Math.min(1, node.position.x / map.width + move[0])), Math.max(0, Math.min(1, node.position.y / map.height + move[1])))
  }}>
    <ReactFlow<MapNode>
      nodes={nodes} nodeTypes={nodeTypes} edges={[]} minZoom={0.01} maxZoom={4}
      fitView={!viewport} defaultViewport={viewport} fitViewOptions={{ padding: 0.08 }}
      nodesConnectable={false} deleteKeyCode={null} panOnDrag={!adding} nodesDraggable={!adding}
      onInit={() => { initialized.current = true }}
      onMoveEnd={(_event, next) => { if (initialized.current) onViewport(next, { width, height }) }}
      onNodesChange={(changes) => setNodes((current) => applyNodeChanges(changes, current))}
      onNodeDragStop={(_event, node) => onMove(node.id, Math.max(0, Math.min(1, node.position.x / map.width)), Math.max(0, Math.min(1, node.position.y / map.height)))}
      onNodeClick={(_event, node) => { if (node.id !== 'map-background') onSelect(node.id) }}
      onPaneClick={(event) => {
        if (!adding) return
        const point = flow.screenToFlowPosition({ x: event.clientX, y: event.clientY })
        if (point.x < 0 || point.y < 0 || point.x > map.width || point.y > map.height) return
        onAdd(point.x / map.width, point.y / map.height)
      }}
      disableKeyboardA11y
    >
      <Background gap={32} color="var(--line)" />
      <Controls showInteractive={false} fitViewOptions={{ padding: 0.08 }} />
    </ReactFlow>
    {adding && <p className="map-canvas-hint">点击底图范围内放置标记；完成后可拖动调整。</p>}
  </div>
}

export function SettingMapCanvas(props: Props) {
  return <ReactFlowProvider><Canvas {...props} /></ReactFlowProvider>
}
