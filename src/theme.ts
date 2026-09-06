import { useEffect, useState } from 'react'

export type ThemeChoice = 'system' | 'gobi' | 'mist' | 'frost'
export type ResolvedTheme = Exclude<ThemeChoice, 'system'>

export const themeOptions: Array<{ value: ThemeChoice; label: string }> = [
  { value: 'system', label: '跟随系统' },
  { value: 'gobi', label: '戈壁青' },
  { value: 'mist', label: '雾夜' },
  { value: 'frost', label: '霜蓝' },
]

const themeColors: Record<ResolvedTheme, string> = {
  gobi: '#efede7',
  mist: '#171a18',
  frost: '#e7ebef',
}

function isThemeChoice(value: string | null): value is ThemeChoice {
  return themeOptions.some((option) => option.value === value)
}

function resolveTheme(choice: ThemeChoice, prefersDark: boolean): ResolvedTheme {
  if (choice === 'system') return prefersDark ? 'mist' : 'gobi'
  return choice
}

export function useTheme(storageKey: string) {
  const [choice, setChoice] = useState<ThemeChoice>(() => {
    const saved = window.localStorage.getItem(storageKey)
    if (saved === 'paper') return 'frost'
    return isThemeChoice(saved) ? saved : 'system'
  })
  const [resolved, setResolved] = useState<ResolvedTheme>('gobi')

  useEffect(() => {
    window.localStorage.setItem(storageKey, choice)
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const next = resolveTheme(choice, media.matches)
      setResolved(next)
      document.documentElement.dataset.theme = next
      document.documentElement.style.colorScheme = next === 'mist' ? 'dark' : 'light'
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColors[next])
    }
    applyTheme()
    if (choice !== 'system') return
    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [choice])

  function selectTheme(next: ThemeChoice) {
    window.localStorage.setItem(storageKey, next)
    setChoice(next)
  }

  return { choice, resolved, selectTheme }
}
