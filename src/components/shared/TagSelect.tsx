import { useState } from 'react'

interface Props {
  value: string[]
  options: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}

export default function TagSelect({ value, options, onChange, placeholder }: Props) {
  const [custom, setCustom] = useState('')
  const all = [...options, ...value.filter((v) => !options.includes(v))]

  function toggle(tag: string) {
    if (value.includes(tag)) onChange(value.filter((t) => t !== tag))
    else onChange([...value, tag])
  }

  function addCustom() {
    const tag = custom.trim()
    if (!tag || value.includes(tag)) return
    onChange([...value, tag])
    setCustom('')
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {value.length === 0 && <span className="text-xs text-gray-500">None selected</span>}
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded bg-[var(--vscode-tab-inactive-bg)] px-2 py-0.5 text-xs text-[#9cdcfe]"
          >
            {tag}
            <button className="text-gray-500 hover:text-white" onClick={() => toggle(tag)}>
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="flex max-h-28 flex-wrap gap-1.5 overflow-auto rounded border border-[var(--vscode-border)] bg-[var(--vscode-editor-bg)] p-2">
        {all.map((tag) => {
          const selected = value.includes(tag)
          return (
            <button
              key={tag}
              onClick={() => toggle(tag)}
              className={`rounded px-2 py-0.5 text-xs ${
                selected
                  ? 'bg-[var(--vscode-status-bar-bg)] text-white'
                  : 'bg-[var(--vscode-tab-inactive-bg)] text-gray-300 hover:bg-[var(--vscode-tab-active-bg)]'
              }`}
            >
              {tag}
            </button>
          )
        })}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addCustom()
          }}
          placeholder={placeholder ?? 'Add custom tag…'}
          className="flex-1 rounded border border-[var(--vscode-border)] bg-[var(--vscode-editor-bg)] px-2 py-1 text-xs outline-none"
        />
        <button
          onClick={addCustom}
          className="rounded border border-[var(--vscode-border)] px-2 py-1 text-xs hover:bg-[var(--vscode-tab-inactive-bg)]"
        >
          Add
        </button>
      </div>
    </div>
  )
}
