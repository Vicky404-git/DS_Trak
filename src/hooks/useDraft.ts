import { useEffect, useRef, useState } from 'react'

/**
 * Keeps a local draft of a value and commits it after `delay` ms of inactivity.
 * Resyncs when the external value changes and no edit is pending.
 */
export function useDraft<T>(value: T, onCommit: (next: T) => void, delay = 500): [T, (next: T) => void] {
  const [draft, setDraft] = useState<T>(value)
  const dirty = useRef(false)
  const onCommitRef = useRef(onCommit)

  useEffect(() => {
    onCommitRef.current = onCommit
  }, [onCommit])

  useEffect(() => {
    if (!dirty.current) setDraft(value)
  }, [value])

  useEffect(() => {
    if (!dirty.current) return
    const id = window.setTimeout(() => {
      dirty.current = false
      onCommitRef.current(draft)
    }, delay)
    return () => window.clearTimeout(id)
  }, [draft, delay])

  function update(next: T) {
    dirty.current = true
    setDraft(next)
  }

  return [draft, update]
}
