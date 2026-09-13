import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DeltaBadge, StatusBadge } from '@/components/phase-panel'
import { useOverview, useProgress, useSchedule } from '@/components/progress-provider'
import { BLOCK_COLOR, BLOCK_FG, TAG_LABEL, type TaskTag } from '@/lib/plan'
import { fy, today0, phasePct, phaseDays, deltaOf, schedBase } from '@/lib/schedule'
import { cn } from '@/lib/utils'
import { Minus, Plus, SlidersHorizontal, ClipboardCheck } from 'lucide-react'

const TAG_VARIANT: Record<TaskTag, 'warning' | 'secondary' | 'destructive' | 'info' | 'success'> = {
  out: 'warning',
  skip: 'secondary',
  ms: 'destructive',
  fix: 'info',
  opt: 'success',
}

export default function CheckinPage() {
  const { update } = useProgress()
  const S = useSchedule()
  const { current } = useOverview()
  const base = schedBase()
  const t = today0()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedIdEff = selectedId ?? current.p.id
  const item = useMemo(() => S.find((i) => i.p.id === selectedIdEff)!, [S, selectedIdEff])
  const baseItem = base.find((b) => b.id === selectedIdEff)!
  const pct = phasePct(item)
  const days = phaseDays(item.p, item.st)

  // 勾选任务；全部勾完自动标记本阶段完成（记今天），取消任意勾选则自动撤销
  const toggleTask = (i: number, v: boolean) =>
    update((d) => {
      const phase = d.phases[item.p.id]
      phase.checks[i] = v
      const all = phase.checks.every(Boolean)
      if (all && !phase.done) {
        phase.done = true
        phase.doneDate = fy(t)
      } else if (!all && phase.done) {
        phase.done = false
        phase.doneDate = null
      }
    })

  const stepDays = (n: number) =>
    update((d) => {
      const cur = d.phases[item.p.id].daysOverride ?? item.p.days
      const nv = Math.max(1, cur + n)
      d.phases[item.p.id].daysOverride = nv === item.p.days ? null : nv
    })

  return (
    <div className="stagger mx-auto max-w-[1400px] p-8">
      <PageHeader icon={ClipboardCheck} title="进度打卡" />

      <div className="flex flex-col items-start gap-4 lg:h-[calc(100vh-9rem)] lg:flex-row">
        {/* 左：章节列表（内部滚动） */}
        <div className="stagger-full flex w-full shrink-0 flex-col gap-2 lg:h-full lg:w-[300px] lg:overflow-y-auto lg:pr-1" data-smooth>
          {S.map((it) => {
            const p = phasePct(it)
            const active = it.p.id === selectedIdEff
            return (
              <button
                key={it.p.id}
                onClick={() => setSelectedId(it.p.id)}
                className={cn(
                  'w-full rounded-lg border bg-card p-3.5 text-left transition-colors hover:bg-accent/40',
                  active && 'border-primary ring-2 ring-primary/30',
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-[11px] font-extrabold"
                    style={{ background: BLOCK_COLOR[it.p.block], color: BLOCK_FG[it.p.block] }}
                  >
                    {it.p.id}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">{it.p.short}</span>
                  <StatusBadge it={it} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] tabular-nums text-muted-foreground">
                  <span>
                    {fy(it.start)} ~ {fy(it.end)}
                  </span>
                  <span className="font-semibold">{Math.round(p * 100)}%</span>
                </div>
                <Progress value={p * 100} className="mt-1.5 h-1.5" indicatorClassName="transition-all" />
              </button>
            )
          })}
        </div>

        {/* 右：任务详情（卡片占满一屏高度，任务列表内部滚动） */}
        <Card className="flex w-full min-w-0 flex-1 flex-col overflow-hidden lg:h-full">
          <div className="h-1.5 shrink-0" style={{ background: BLOCK_COLOR[item.p.block] }} />
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg">{item.p.name}</CardTitle>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm tabular-nums text-muted-foreground">
                <span>
                  {fy(item.start)} ~ {fy(item.end)}
                </span>
                <DeltaBadge delta={deltaOf(item.end, baseItem.end)} />
                <StatusBadge it={item} />
              </div>
            </div>
            {/* 进度区改为按钮：点击打开周期弹窗 */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0 tabular-nums" aria-label="调整阶段周期">
                  <SlidersHorizontal data-icon="inline-start" />
                  {Math.round(pct * 100)}%
                  <span className="font-normal text-muted-foreground">
                    · 任务 {item.st.checks.filter(Boolean).length}/{item.st.checks.length}
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>调整阶段周期</DialogTitle>
                  <DialogDescription>
                    {item.p.name} · 原计划 {item.p.days} 天；调整后后续阶段自动级联重排
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center gap-3 py-2">
                  <Button variant="outline" size="icon" className="size-8" onClick={() => stepDays(-1)} aria-label="减少周期天数">
                    <Minus />
                  </Button>
                  <span className="min-w-[64px] text-center text-lg font-extrabold tabular-nums">{days} 天</span>
                  <Button variant="outline" size="icon" className="size-8" onClick={() => stepDays(1)} aria-label="增加周期天数">
                    <Plus />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-6 pb-6" data-smooth>
            {item.p.tasks.map((task, i) => (
              <label
                key={i}
                className={cn(
                  'flex shrink-0 cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors hover:bg-accent/40',
                  item.st.checks[i] && 'text-muted-foreground',
                )}
              >
                <Checkbox checked={item.st.checks[i]} onCheckedChange={(v) => toggleTask(i, !!v)} className="size-5" />
                <span className={cn('min-w-0 flex-1', item.st.checks[i] && 'line-through')}>
                  {task.t}
                  {task.tag && (
                    <Badge variant={TAG_VARIANT[task.tag]} className="ml-2">
                      {TAG_LABEL[task.tag]}
                    </Badge>
                  )}
                </span>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
