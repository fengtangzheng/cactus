import { Eye, EyeOff } from 'lucide-react'
import type { Visibility } from '../types'

export function VisibilityBadge({ value }: { value: Visibility }) {
  return value === 'public' ? (
    <span className="visibility public"><Eye size={12} /> 可公开</span>
  ) : (
    <span className="visibility private"><EyeOff size={12} /> 仅自己</span>
  )
}
