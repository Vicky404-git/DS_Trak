interface Props {
  label: string
  value: number
  max?: number
  width?: number
}

export default function BarRow({ label, value, max = 10, width = 10 }: Props) {
  const ratio = max === 0 ? 0 : Math.max(0, Math.min(1, value / max))
  const filled = Math.round(ratio * width)
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled)
  return (
    <div className="flex items-center gap-2 font-mono text-[13px]">
      <span className="w-40 shrink-0 truncate text-gray-300">{label}</span>
      <span className="text-[#4ec9b0]">{bar}</span>
      <span className="text-gray-400">
        {value.toFixed(1)}/{max}
      </span>
    </div>
  )
}
