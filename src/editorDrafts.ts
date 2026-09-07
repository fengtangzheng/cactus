const DRAFT_PREFIX = 'cactus-editor-draft-v1'

interface StoredEditorDraft<T> {
  value: T
  savedAt: number
}

function draftKey(scope: string, id: string) {
  return `${DRAFT_PREFIX}:${scope}:${id}`
}

export function loadEditorDraft<T>(scope: string, id: string): T | null {
  try {
    const raw = window.localStorage.getItem(draftKey(scope, id))
    if (!raw) return null
    return (JSON.parse(raw) as StoredEditorDraft<T>).value
  } catch {
    return null
  }
}

export function saveEditorDraft<T>(scope: string, id: string, value: T) {
  try {
    window.localStorage.setItem(draftKey(scope, id), JSON.stringify({ value, savedAt: Date.now() } satisfies StoredEditorDraft<T>))
  } catch {
    // localStorage may be unavailable or full; editing should still work in memory.
  }
}

export function clearEditorDraft(scope: string, id: string) {
  try {
    window.localStorage.removeItem(draftKey(scope, id))
  } catch {
    // Ignore storage cleanup failures.
  }
}

export function listEditorDrafts<T>(scope: string): Array<{ id: string; value: T; savedAt: number }> {
  const prefix = `${DRAFT_PREFIX}:${scope}:`
  const drafts: Array<{ id: string; value: T; savedAt: number }> = []
  try {
    for (let index = 0; index < window.localStorage.length; index++) {
      const key = window.localStorage.key(index)
      if (!key?.startsWith(prefix)) continue
      try {
        const stored = JSON.parse(window.localStorage.getItem(key)!) as StoredEditorDraft<T>
        drafts.push({ id: key.slice(prefix.length), ...stored })
      } catch { /* 单份损坏草稿不影响其他草稿恢复。 */ }
    }
  } catch { /* 无法使用存储时仍可在内存中编辑。 */ }
  return drafts.sort((a, b) => b.savedAt - a.savedAt)
}
