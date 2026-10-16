import Editor from '@monaco-editor/react'

interface Props {
  language: 'markdown' | 'cpp'
  value: string
  onChange: (value: string) => void
  height?: number | string
}

export default function MonacoEditor({ language, value, onChange, height = 260 }: Props) {
  return (
    <div className="overflow-hidden rounded border border-[var(--vscode-border)]">
      <Editor
        height={height}
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(v) => onChange(v ?? '')}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "'JetBrains Mono', Consolas, ui-monospace, monospace",
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          renderLineHighlight: 'none',
          tabSize: 4,
          automaticLayout: true,
        }}
      />
    </div>
  )
}
