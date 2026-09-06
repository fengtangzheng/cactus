import { useState, type FormEvent, type ReactNode } from 'react'
import { Cloud, CloudOff, LoaderCircle, LogOut, Mail, RefreshCw, TriangleAlert, X } from 'lucide-react'
import type { CloudSyncController } from '../cloud/useCloudSync'

const statusLabels = {
  disabled: '云同步未配置',
  'signed-out': '仅保存在本地',
  'link-sent': '登录邮件已发送',
  loading: '正在连接云端',
  saving: '正在同步',
  synced: '已同步到云端',
  conflict: '需要选择版本',
  error: '云同步异常',
} as const

function CloudAuthPanel({ cloud }: { cloud: CloudSyncController }) {
  const [email, setEmail] = useState('')

  function submitEmail(event: FormEvent) {
    event.preventDefault()
    if (email.trim()) void cloud.signInWithEmail(email.trim())
  }

  if (!cloud.configured) return <div className="cloud-panel-copy"><CloudOff size={22} /><h3>云同步尚未配置</h3><p>配置 Supabase 项目地址和 Publishable Key 后，即可在电脑与平板之间同步。</p></div>

  if (!cloud.userEmail) return <div className="cloud-auth-options">
    <div className="cloud-panel-copy"><Cloud size={22} /><h3>连接私密创作空间</h3><p>登录后，小说、角色、设定及私有媒体将保存到你的云端账户。</p></div>
    <form onSubmit={submitEmail}><label>邮箱<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></label><button className="primary-button" type="submit"><Mail size={15} /> 发送登录链接</button></form>
    {cloud.status === 'link-sent' && <p className="cloud-success">登录链接已经发送，请在同一设备打开邮件。</p>}
    {cloud.error && <p className="cloud-error">{cloud.error}</p>}
  </div>

  return <div className="cloud-account-panel">
    <div className="cloud-panel-copy"><Cloud size={22} /><h3>{statusLabels[cloud.status]}</h3><p>{cloud.userEmail}</p>{cloud.lastSyncedAt && <small>最近同步：{new Date(cloud.lastSyncedAt).toLocaleString('zh-CN')}</small>}</div>
    {cloud.hasConflict && <div className="cloud-conflict"><TriangleAlert size={17} /><div><strong>电脑和平板都修改了内容</strong><p>请选择要保留的版本，操作前本地内容不会被覆盖。</p></div><button onClick={() => void cloud.keepLocalVersion()}>保留当前设备</button><button onClick={cloud.useCloudVersion}>使用云端版本</button></div>}
    {cloud.error && <p className="cloud-error">{cloud.error}</p>}
    <div className="cloud-account-actions"><button onClick={() => void cloud.syncNow()} disabled={cloud.status === 'saving' || cloud.status === 'loading'}><RefreshCw size={14} /> 立即同步</button><button onClick={() => void cloud.signOut()}><LogOut size={14} /> 退出登录</button></div>
  </div>
}

export function CloudSyncControl({ cloud }: { cloud: CloudSyncController }) {
  const [open, setOpen] = useState(false)
  const Icon = cloud.status === 'disabled' || cloud.status === 'signed-out' || cloud.status === 'error' ? CloudOff : cloud.status === 'loading' || cloud.status === 'saving' ? LoaderCircle : Cloud
  return <>
    <button className={`cloud-status-button status-${cloud.status}`} onClick={() => setOpen(true)}><Icon size={15} /> {statusLabels[cloud.status]}</button>
    {open && <div className="cloud-dialog-backdrop" onMouseDown={() => setOpen(false)}><section className="cloud-dialog" role="dialog" aria-modal="true" aria-label="云同步" onMouseDown={(event) => event.stopPropagation()}><header><div><span className="eyebrow">CACTUS CLOUD</span><h2>跨设备创作</h2></div><button className="icon-button" aria-label="关闭云同步" onClick={() => setOpen(false)}><X size={18} /></button></header><CloudAuthPanel cloud={cloud} /></section></div>}
  </>
}

export function CloudStudioGate({ cloud, children }: { cloud: CloudSyncController; children: ReactNode }) {
  if (cloud.userEmail && cloud.ready) return <>{children}</>
  return <main className="cloud-studio-gate"><section><span className="brand-mark">KK</span><p className="eyebrow">CACTUS PRIVATE STUDIO</p><h1>祁珞的创作空间</h1><CloudAuthPanel cloud={cloud} /></section></main>
}
