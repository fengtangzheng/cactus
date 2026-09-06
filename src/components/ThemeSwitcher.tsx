import { Palette } from 'lucide-react'
import { themeOptions, useTheme } from '../theme'

export function ThemeSwitcher({ storageKey, compact = false }: { storageKey: string; compact?: boolean }) {
  const { choice, resolved, selectTheme } = useTheme(storageKey)
  return (
    <label className={`theme-picker${compact ? ' compact' : ''}`} title={`当前配色：${themeOptions.find((option) => option.value === resolved)?.label}`}>
      <Palette size={14} />
      {!compact && <span>主题</span>}
      <select aria-label="选择主题" value={choice} onChange={(event) => selectTheme(event.target.value as typeof choice)}>
        {themeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  )
}
