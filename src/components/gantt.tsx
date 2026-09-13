import { PLAN, isKeyPhase, phaseShort } from '@/lib/plan'
import { fd, fy, today0, diff, type SchedItem } from '@/lib/schedule'
import { BLOCK_COLOR } from '@/lib/plan'
import { cn } from '@/lib/utils'
import { AlertTriangle, Check } from 'lucide-react'

const DONE = 'hsl(var(--success))'
const OVERDUE = 'hsl(var(--destructive))'
const ACTIVE = 'hsl(var(--muted-foreground))'
const FUTURE = 'hsl(var(--gantt-future))'

interface GanttProps {
  items: SchedItem[]
  selectedId: string
  onSelect: (pid: string) => void
}

/**
 * 甘特图：以「今天」基准竖线为界。
 * 基准线左侧：黑=已完成，红=已延期，深灰=进行中/未完成；右侧浅灰=未来。
 * 点击行可切换右侧详情。
 */
export function Gantt({ items, selectedId, onSelect }: GanttProps) {
  const t = today0()
  let min = items[0].start.getTime()
  let max = Math.max(...items.map((i) => i.end.getTime()))
  if (t.getTime() < min) min = t.getTime()
  if (t.getTime() > max) max = t.getTime()
  const minD = new Date(min)
  const maxD = new Date(max)
  const range = Math.max(1, diff(minD, maxD))

  const pos = (d: Date) => (diff(minD, d) / range) * 100
  const width = (a: Date, b: Date) => ((diff(a, b) + 1) / range) * 100

  // 月份刻度
  const months: Date[] = []
  let m = new Date(minD.getFullYear(), minD.getMonth(), 1)
  while (m <= maxD) {
    months.push(new Date(m))
    m = new Date(m.getFullYear(), m.getMonth() + 1, 1)
  }

  return (
    <div className="flex h-full flex-col rounded-lg border bg-card">
      <div className="flex flex-wrap items-center gap-4 border-b px-5 py-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-5 rounded-sm bg-success" aria-hidden /> 已完成
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-5 rounded-sm bg-[hsl(var(--muted-foreground))]" aria-hidden /> 进行中 / 未完成
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-5 rounded-sm bg-destructive" aria-hidden /> 已延期
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-5 rounded-sm bg-[hsl(var(--gantt-future))]" aria-hidden /> 未来计划
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-0.5 bg-foreground" aria-hidden /> 今天（基准线）
        </span>
      </div>

      <div className="overflow-x-auto p-4">
        <div className="min-w-[640px]">
          {/* 月份刻度 */}
          <div className="relative ml-32 h-5 border-b">
            {months.map((mm) => {
              const x = pos(mm)
              if (x < 0 || x > 99) return null
              return (
                <span
                  key={mm.getTime()}
                  className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-[11px] tabular-nums text-muted-foreground"
                  style={{ left: `${x}%` }}
                >
                  {mm.getMonth() === 0 ? `${mm.getFullYear()}年 ` : ''}
                  {mm.getMonth() + 1}月
                </span>
              )
            })}
          </div>

          {/* 行 */}
          <div className="relative">
            {items.map((it) => {
              const selected = it.p.id === selectedId
              const pastEnd = t < it.end ? t : it.end
              const hasPast = it.start < t
              const hasFuture = it.end >= t
              const overdue = !it.done && t > it.end
              const pastColor = it.done ? DONE : overdue ? OVERDUE : ACTIVE

              return (
                <div
                  key={it.p.id}
                  onClick={() => onSelect(it.p.id)}
                  className={cn(
                    'gantt-row flex h-12 cursor-pointer items-center border-b border-dashed last:border-0',
                    selected && 'selected',
                  )}
                >
                  <div className={cn('w-32 shrink-0 px-2 text-xs font-bold leading-tight', isKeyPhase(it.p) && 'text-destructive')}>
                    {phaseShort(it.p)}
                    <span className="flex items-center gap-1 font-medium tabular-nums text-muted-foreground">
                      {fd(it.start)} – {fd(it.end)}
                      {overdue && <AlertTriangle className="size-3 text-destructive" aria-label="已延期" />}
                    </span>
                  </div>
                  <div className="relative h-full flex-1">
                    {/* 竖向网格 */}
                    {months.map((mm) => {
                      const x = pos(mm)
                      if (x <= 0 || x >= 100) return null
                      return <div key={mm.getTime()} className="absolute inset-y-0 w-px bg-border/70" style={{ left: `${x}%` }} />
                    })}

                    {/* 过去段：黑=已完成 / 红=延期 / 深灰=进行中 */}
                    {hasPast && (
                      <div
                        className="absolute top-1/2 h-4 -translate-y-1/2 rounded-sm"
                        style={{
                          left: `${pos(it.start)}%`,
                          width: `${Math.min(width(it.start, pastEnd), 100 - pos(it.start))}%`,
                          background: pastColor,
                        }}
                        title={`${it.p.name}（${it.done ? '已完成' : overdue ? '已延期' : '进行中'}）：${fy(it.start)} ~ ${fy(it.end)}`}
                      />
                    )}
                    {/* 未来段：浅灰 */}
                    {hasFuture && (
                      <div
                        className="absolute top-1/2 h-4 -translate-y-1/2 rounded-sm"
                        style={{
                          left: `${pos(hasPast ? t : it.start)}%`,
                          width: `${width(hasPast ? t : it.start, it.end)}%`,
                          background: FUTURE,
                        }}
                        title={`${it.p.name}：${fy(it.start)} ~ ${fy(it.end)}`}
                      />
                    )}

                    {/* 已完成勾标 */}
                    {it.done && (
                      <Check
                        className="absolute top-1/2 z-10 size-3 -translate-y-1/2 text-white"
                        strokeWidth={3.5}
                        style={{ left: `calc(${pos(it.start)}% + 4px)` }}
                        aria-hidden
                      />
                    )}
                  </div>
                </div>
              )
            })}

            {/* 今天基准线 */}
            <div className="today-line" style={{ left: `calc(8rem + (100% - 8rem) * ${(pos(t) / 100).toFixed(4)})` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function blockColorOf(pid: string) {
  const p = PLAN.phases.find((x) => x.id === pid)
  return p ? BLOCK_COLOR[p.block] : '#888'
}
