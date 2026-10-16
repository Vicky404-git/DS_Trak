import { useMemo } from 'react'
import { useDataStore } from '../../store/dataStore'
import { summarizeHintLog } from '../../core/stats/logs'

export default function HintLogView() {
  const hintLog = useDataStore((s) => s.hintLog)
  const rows = useMemo(() => summarizeHintLog(hintLog), [hintLog])

  if (rows.length === 0) {
    return <div className="text-sm text-gray-500">No hint log entries yet.</div>
  }

  return (
    <table className="w-full font-mono text-[12px]">
      <thead>
        <tr className="text-left text-gray-400">
          <th className="py-1 pr-3">Week</th>
          <th className="py-1 pr-3">CLEAN</th>
          <th className="py-1 pr-3">H1</th>
          <th className="py-1 pr-3">H2</th>
          <th className="py-1 pr-3">H3</th>
          <th className="py-1 pr-3">SOL</th>
          <th className="py-1 pr-3">Total</th>
          <th className="py-1 pr-3">Clean rate</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.week} className="border-t border-[var(--vscode-border)]">
            <td className="py-1 pr-3">W{row.week}</td>
            <td className="py-1 pr-3 text-[#4ec9b0]">{row.counts.CLEAN}</td>
            <td className="py-1 pr-3">{row.counts.H1}</td>
            <td className="py-1 pr-3">{row.counts.H2}</td>
            <td className="py-1 pr-3">{row.counts.H3}</td>
            <td className="py-1 pr-3">{row.counts.SOL}</td>
            <td className="py-1 pr-3">{row.total}</td>
            <td className="py-1 pr-3">{(row.cleanRate * 100).toFixed(0)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
