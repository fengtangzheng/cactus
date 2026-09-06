import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@xyflow/react/dist/style.css'
import '../../src/styles.css'
import { CloudStudioApp } from './CloudStudioApp'

createRoot(document.getElementById('root')!).render(<StrictMode><CloudStudioApp /></StrictMode>)
