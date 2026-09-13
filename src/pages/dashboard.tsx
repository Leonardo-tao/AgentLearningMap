import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/phase-panel'
import { useOverview, useProgress, useSchedule } from '@/components/progress-provider'
import { COURSE_URL, OFFER_DATE, TAG_LABEL, type TaskTag } from '@/lib/plan'
import { BLOCK_COLOR } from '@/lib/plan'
import { schedBase, milestoneViews, today0, diff, fcn, fy, pd } from '@/lib/schedule'
import { CalendarClock, Check, ExternalLink, Flag, Flame, PartyPopper } from 'lucide-react'

const TAG_VARIANT: Record<TaskTag, 'warning' | 'secondary' | 'destructive' | 'info' | 'success'> = {
  out: 'warning',
  skip: 'secondary',
  ms: 'destructive',
  fix: 'info',
  opt: 'success',
}

function Donut({ pct }: { pct: number }) {
  const C = 2 * Math.PI * 52
  return (
    <div className="relative size-20 shrink-0">
      <svg className="-rotate-90" width="80" height="80" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={C.toFixed(1)}
          strokeDashoffset={(C * (1 - pct)).toFixed(1)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-lg font-extrabold tabular-nums">
        {Math.round(pct * 100)}%
      </div>
    </div>
  )
}

/** 横向滚动容器：单行不换行、隐藏滚动条、被裁剪的一侧渐隐 */
function ScrollFade({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ left: false, right: false })
  const sync = useCallback(() => {
    const el = ref.current
    if (!el) return
    setEdges({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    })
  }, [])
  useEffect(() => {
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [sync])
  const fade = (on: boolean) => (on ? 'transparent' : 'black')
  const mask = `linear-gradient(to right, ${fade(edges.left)} 0, black 24px, black calc(100% - 36px), ${fade(edges.right)} 100%)`
  return (
    <div
      ref={ref}
      onScroll={sync}
      className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    >
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const { update } = useProgress()
  const { S, pct, current } = useOverview()
  const base = schedBase()
  const t = today0()

  const projEnd = S[S.length - 1].end
  const baseEnd = base[base.length - 1].end
  const delta = diff(baseEnd, projEnd)
  const doneN = S.filter((i) => i.done).length

  const ms = milestoneViews(S).find((m) => m.date >= t)
  const offerLeft = Math.max(0, diff(t, pd(OFFER_DATE)))

  const dayN = diff(current.start, t) + 1
  const total = diff(current.start, current.end) + 1

  const unchecked = current.p.tasks.map((task, i) => ({ task, i })).filter((x) => !current.st.checks[x.i])
  const allChecked = unchecked.length === 0

  const markTask = (i: number) =>
    update((d) => {
      d.phases[current.p.id].checks[i] = true
    })

  return (
    <div className="stagger mx-auto flex max-w-[1400px] flex-col gap-4 p-8 lg:min-h-screen">
      {/* Hero */}
      <div className="rounded-lg bg-primary p-5 text-primary-foreground">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <Badge className="border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground">
              前端 → Agent 开发 · 在职冲刺
            </Badge>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight">六个月，从切图仔到 Agent 工程师</h1>
            <p className="mt-1.5 text-sm tabular-nums text-primary-foreground/80">
              今天是 {t.getFullYear()} 年 {t.getMonth() + 1} 月 {t.getDate()} 日
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Donut pct={pct} />
            <div className="text-sm">
              <div className="font-bold">总进度（按天数加权）</div>
              <div className="text-primary-foreground/75">已完成阶段 {doneN} / {S.length}</div>
              <div className="mt-1 flex items-center text-primary-foreground/75">
                预计完成 {fcn(projEnd)}
                <Badge className="ml-2 border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground">
                  {delta === 0 ? '按计划' : delta < 0 ? `提前 ${-delta} 天` : `顺延 ${delta} 天`}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 指标行 */}
      <div className="stagger-full grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-muted-foreground">当前阶段</div>
            <div className="mt-1 truncate text-lg font-extrabold">{current.p.short}</div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span className="tabular-nums">{t < current.start ? `${fcn(current.start)} 开始` : `第 ${Math.min(dayN, total)} / ${total} 天`}</span>
              <StatusBadge it={current} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-muted-foreground">下一个里程碑</div>
            <div className="mt-1 line-clamp-2 text-sm font-bold leading-snug">{ms ? ms.label : '全部达成 🎉'}</div>
            <div className="mt-1 flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground">
              <CalendarClock className="size-3.5" />
              {ms ? `${fy(ms.date)} · 还有 ${diff(t, ms.date)} 天` : '—'}
              {ms?.hard && <Badge variant="destructive">硬节点</Badge>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-muted-foreground">距离 offer 目标</div>
            <div className="mt-1 text-lg font-extrabold tabular-nums">
              {offerLeft} <span className="text-sm font-semibold">天</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">2027-03-31 前落地</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-muted-foreground">阶段区间（自动重排）</div>
            <div className="mt-1 text-sm font-bold tabular-nums">{fy(current.start)} ~ {fy(current.end)}</div>
            <div className="mt-1.5">
              <Progress value={pct * 100} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="stagger-full grid flex-1 gap-4 lg:grid-cols-5">
        {/* 今日任务 */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="size-5 text-warning" />
              今日任务 · {current.p.short}
            </CardTitle>
            <Button asChild className="shrink-0">
              <a href={COURSE_URL} target="_blank" rel="noreferrer">
                去学习
                <ExternalLink data-icon="inline-end" />
              </a>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {allChecked ? (
              <div className="flex flex-col items-center gap-3 rounded-md bg-success/10 p-5 text-center">
                <PartyPopper className="size-8 text-success" />
                <div className="text-sm font-semibold">
                  {current.p.short} 的全部任务已勾完！
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to="/checkin">
                    去打卡页标记阶段完成
                    <span aria-hidden>→</span>
                  </Link>
                </Button>
              </div>
            ) : (
              unchecked.slice(0, 3).map(({ task, i }) => (
                <div
                  key={i}
                  className="group flex items-center gap-3 rounded-md border bg-card px-3 py-2.5 transition-colors hover:bg-accent/40"
                >
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => markTask(i)}
                    className="size-5"
                  />
                  <span className="min-w-0 flex-1 text-sm">
                    {task.t}
                    {task.tag && (
                      <Badge variant={TAG_VARIANT[task.tag]} className="ml-2">
                        {TAG_LABEL[task.tag]}
                      </Badge>
                    )}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-7 shrink-0 opacity-90 group-hover:opacity-100"
                    onClick={() => markTask(i)}
                    aria-label="标记已完成"
                  >
                    <Check />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 当前章节目标 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between gap-2 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Flag className="size-4 text-primary" />
              本章节目标
            </CardTitle>
            <Link to="/roadmap" className="shrink-0 text-xs font-semibold text-primary hover:underline">
              查看本阶段完整路线 →
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <ul className="flex flex-col gap-2 text-sm">
              {current.p.goals.map((g) => (
                <li key={g} className="flex gap-2">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-primary/70" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 阶段速览条：单行横向滚动，两侧渐隐 */}
      <ScrollFade>
        {S.map((it) => (
          <Link
            key={it.p.id}
            to="/roadmap"
            className="flex shrink-0 items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-accent"
          >
            <span className="size-2 rounded-full" style={{ background: BLOCK_COLOR[it.p.block] }} />
            {it.p.short}
            <span className="tabular-nums text-muted-foreground">
              {Math.round((it.st.checks.filter(Boolean).length / it.st.checks.length) * 100)}%
            </span>
          </Link>
        ))}
      </ScrollFade>
    </div>
  )
}
