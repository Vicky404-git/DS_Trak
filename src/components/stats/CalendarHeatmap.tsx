import { useMemo } from 'react'
import { useDataStore } from '../../store/dataStore'
import { buildHeatmap } from '../../core/stats/heatmap'
import { formatDuration } from '../../core/utils/dateUtils'
import { useNow } from '../../hooks/useNow'

function level(minutes: number): number {
  if (minutes <= 0) return 0
  if (minutes < 30) return 1
  if (minutes < 60) return 2
  if (minutes < 120) return 3
  return 4
}

const COLORS = ['#2d2d2d', '#0e4429', '#006d32', '#26a641', '#39d353']

export default function CalendarHeatmap() {
  const activity = useDataStore((s) => s.activity)
  const now = useNow(60_000)
  const grid = useMemo(() => buildHeatmap(activity, new Date(now), 16), [activity, now])
  const total = useMemo(() => activity.reduce((sum, a) => sum + a.minutes, 0), [activity])

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-300">
          Study heatmap
        </h3>
        <span className="text-xs text-gray-400">total {formatDuration(total * 60_000)}</span>
      </div>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((cell) => (
              <div
                key={cell.date}
                title={`${cell.date}: ${cell.minutes}m`}
                className="h-3.5 w-3.5 rounded-[2px]"
                style={{ backgroundColor: COLORS[level(cell.minutes)] }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-500">
        Less
        {COLORS.map((c) => (
          <span key={c} className="inline-block h-3 w-3 rounded-[2px]" style={{ backgroundColor: c }} />
        ))}
        More
      </div>
    </div>
  )
}
