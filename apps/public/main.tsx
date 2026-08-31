import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import snapshot from '../../content/public.json'
import { PublicSite } from './PublicSite'
import type { PublicSnapshot } from './types'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PublicSite snapshot={snapshot as PublicSnapshot} />
  </StrictMode>,
)
