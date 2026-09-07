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
