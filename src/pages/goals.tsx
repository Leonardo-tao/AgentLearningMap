import { useEffect, useRef, useState } from 'react'
import { PageHeader } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useProgress, useSchedule } from '@/components/progress-provider'
import { milestoneViews, today0, diff, fy } from '@/lib/schedule'
import { cn } from '@/lib/utils'
import { Target, CalendarDays, Sparkles } from 'lucide-react'

type GoalLevel = 'big' | 'mid' | 'small'

interface GoalNode {
  id: string
  level: GoalLevel
  title: string
  value: number
  /** 对应 milestoneViews 的下标，用于取动态日期 */
  msIndex?: number
}

const LEVEL_VALUE: Record<GoalLevel, number> = { big: 10, mid: 5, small: 2 }
/** 淡彩粒子色板（无黑无白） */
const PASTELS = ['#fda4af', '#fcd34d', '#a5f3fc', '#a7f3d0', '#c4b5fd', '#f9a8d4', '#fdba74', '#93c5fd', '#d9f99d', '#f5d0fe']

/** 目标树按收集顺序展开：小目标在前，中目标随后，大目标（offer）最后 */
const GOALS: GoalNode[] = [
  { id: '1-1-1', level: 'small', title: '核心章（5/6/7）18 个课程项目全做', value: LEVEL_VALUE.small },
  { id: '1-1-2', level: 'small', title: '1 份 RAG 量化评估报告（命中率 / MRR / NDCG）', value: LEVEL_VALUE.small },
  { id: '1-1', level: 'mid', title: 'Mini-GPT 跑通，能白板讲 Transformer', value: LEVEL_VALUE.mid, msIndex: 0 },
  { id: '1-2-1', level: 'small', title: '每章 1 篇输出笔记，累计 6+ 篇技术博客', value: LEVEL_VALUE.small },
  { id: '1-2', level: 'mid', title: 'RAG 系统可演示 + 量化评估指标', value: LEVEL_VALUE.mid, msIndex: 1 },
  { id: '1-3-1', level: 'small', title: '能力清单 14 项全点亮', value: 3 },
  { id: '1-3', level: 'mid', title: 'LangGraph / MCP / FastAPI / Docker 工具链齐', value: LEVEL_VALUE.mid, msIndex: 2 },
  { id: '1-4-1', level: 'small', title: '2 个上线级作品（GitHub + demo + 部署手册）', value: 3 },
  { id: '1-4-2', level: 'small', title: '简历三版定稿并投出', value: LEVEL_VALUE.small },
  { id: '1-4', level: 'mid', title: '两个上线作品 + 简历定稿', value: LEVEL_VALUE.mid, msIndex: 3 },
  { id: '1', level: 'big', title: '拿到 Agent / RAG / LLM 应用开发 offer', value: LEVEL_VALUE.big, msIndex: 4 },
]

const TOTAL_LIGHT = GOALS.reduce((s, g) => s + g.value, 0)

/** 匀速流光边框：SVG 圆角矩形描边，stroke-dashoffset 沿路径匀速移动 */
function BeamFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-lg">
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <rect
          x="0.75"
          y="0.75"
          style={{ width: 'calc(100% - 1.5px)', height: 'calc(100% - 1.5px)' }}
          rx="7.5"
          pathLength={100}
          className="beam-rect"
        />
      </svg>
      <div className="relative rounded-lg bg-card px-4 py-2.5">{children}</div>
    </div>
  )
}

/** 立体五角星瓶：背面星挤出体积感，液面随光点值上升，待机时上下浮动 */
function StarBottle({ level, pulse }: { level: number; pulse: boolean }) {
  const front = '50,9 61.2,38.6 92.8,40.1 68.1,59.9 76.5,90.4 50,73 23.5,90.4 31.9,59.9 7.2,40.1 38.8,38.6'
  return (
    <div className="star-float">
      <svg
        viewBox="0 0 100 100"
        className={cn('size-44 text-foreground', pulse && 'bottle-pulse')}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        aria-hidden
      >
        <defs>
          <linearGradient id="star-face" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.08" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="bottle-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
          </linearGradient>
          <clipPath id="star-clip">
            <polygon points={front} />
          </clipPath>
        </defs>
        <polygon points={front} transform="translate(3,4)" fill="hsl(var(--primary) / 0.22)" stroke="none" />
        <g clipPath="url(#star-clip)">
          <rect
            x="0"
            y={95 - level * 80}
            width="100"
            height={level * 80}
            fill="url(#bottle-fill)"
            className="transition-all duration-700"
          />
        </g>
        <polygon points={front} fill="url(#star-face)" />
        <polygon points={front} />
        <ellipse cx="34" cy="32" rx="6" ry="13" transform="rotate(28 34 32)" fill="hsl(0 0% 100% / 0.5)" stroke="none" />
        <rect x="45.5" y="1" width="9" height="6" rx="1.5" fill="hsl(var(--primary) / 0.85)" stroke="none" />
      </svg>
    </div>
  )
}

export default function GoalsPage() {
  const { state, update } = useProgress()
  const S = useSchedule()
  const t = today0()
  const ms = milestoneViews(S)

  const isCollected = (g: GoalNode) => !!state.abilities['g' + g.id]
  const collectedLight = GOALS.filter(isCollected).reduce((s, g) => s + g.value, 0)
  const currentIdx = GOALS.findIndex((g) => !isCollected(g))

  // 展示用的光点值：延迟到光子落入星瓶后再同步上升（先快后慢补间）
  const [shownLight, setShownLight] = useState(0)
  const shownRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    setShownLight(collectedLight)
    shownRef.current = collectedLight
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tweenLight = (to: number, delayMs: number) => {
    cancelAnimationFrame(rafRef.current)
    const from = shownRef.current
    const t0 = performance.now() + delayMs
    const dur = 650
    const step = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - t0) / dur))
      const e = 1 - Math.pow(1 - t, 3)
      shownRef.current = from + (to - from) * e
      setShownLight(shownRef.current)
      if (t < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }

  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const layerRef = useRef<HTMLDivElement>(null)
  const bottleRef = useRef<HTMLDivElement>(null)
  const [pulse, setPulse] = useState(false)

  /** 收集：光子先快后慢飞入星瓶，瓶中的光与进度条随后同步上升 */
  const collect = (idx: number) => {
    const g = GOALS[idx]
    const el = itemRefs.current[idx]
    if (!el) return
    const from = el.getBoundingClientRect()
    const x1 = from.left + from.width / 2
    const y1 = from.top + from.height / 2
    let x2 = window.innerWidth - 200
    let y2 = window.innerHeight / 2
    const bottle = bottleRef.current
    if (bottle) {
      const to = bottle.getBoundingClientRect()
      x2 = to.left + to.width / 2
      y2 = to.top + to.height * 0.6
    }

    update((d) => {
      d.abilities['g' + g.id] = true
    })
    setPulse(true)
    window.setTimeout(() => setPulse(false), 900)

    const N = 8 + g.value * 2
    tweenLight(collectedLight + g.value, N * 34 + 300)

    if (document.documentElement.dataset.anim === 'off') return
    const layer = layerRef.current
    if (!layer) return
    const base = g.level === 'big' ? 10 : g.level === 'mid' ? 8 : 6
    for (let i = 0; i < N; i++) {
      window.setTimeout(() => {
        const dot = document.createElement('div')
        dot.className = 'light-dot'
        const color = PASTELS[Math.floor(Math.random() * PASTELS.length)]
        const size = base * (0.8 + Math.random() * 0.6)
        dot.style.width = `${size}px`
        dot.style.height = `${size}px`
        dot.style.margin = `${-size / 2}px 0 0 ${-size / 2}px`
        dot.style.background = color
        dot.style.boxShadow = `0 0 6px 2px ${color}99, 0 0 14px 4px ${color}44`
        layer.appendChild(dot)
        const r = Math.random
        const mx = x1 + (x2 - x1) * 0.45 + (r() - 0.5) * 280
        const my = y1 + (y2 - y1) * 0.4 + (r() - 0.5) * 240
        const anim = dot.animate(
          [
            { transform: `translate(${x1}px, ${y1}px) scale(1)`, opacity: 1 },
            {
              transform: `translate(${mx}px, ${my}px) scale(${0.5 + r() * 0.7})`,
              opacity: 1,
              offset: 0.35 + r() * 0.2,
            },
            { transform: `translate(${x2}px, ${y2}px) scale(0.15)`, opacity: 0.75 },
          ],
          { duration: 620 + r() * 560, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' },
        )
        anim.onfinish = () => dot.remove()
      }, i * 34)
    }
  }

  const shown = Math.round(shownLight)
  const shownPct = TOTAL_LIGHT ? shownLight / TOTAL_LIGHT : 0

  return (
    <div className="stagger mx-auto flex max-w-[1400px] flex-col gap-3 px-8 py-5 lg:h-screen">
      <PageHeader icon={Target} title="学习目标" />

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_300px]">
        {/* 左：竖向目标时间线 */}
        <div className="relative lg:min-h-0 lg:overflow-y-auto lg:pr-2" data-smooth>
          <span className="absolute bottom-3 left-[7px] top-3 w-px bg-border" aria-hidden />
          <div className="relative flex flex-col gap-2.5">
            {GOALS.map((g, i) => {
              const done = isCollected(g)
              const isCurrent = i === currentIdx
              const m = g.msIndex !== undefined ? ms[g.msIndex] : undefined
              const days = m ? diff(t, m.date) : null
              const body = (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'min-w-0 truncate',
                        g.level === 'big' ? 'text-base font-extrabold' : 'text-sm font-bold',
                        done && 'text-muted-foreground line-through',
                      )}
                    >
                      {g.title}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      {m?.hard && <Badge variant="destructive">硬节点</Badge>}
                      <span className="ml-1 flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground">
                        <Sparkles className="size-2.5" aria-hidden />
                        {g.value}
                      </span>
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs tabular-nums text-muted-foreground">
                    {m ? (
                      <>
                        <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                        <span>{fy(m.date)}</span>
                        <span>·</span>
                        <span>{days === null ? '—' : days >= 0 ? `还有 ${days} 天` : `已过 ${-days} 天`}</span>
                      </>
                    ) : (
                      <span>支撑目标 · 无固定日期</span>
                    )}
                    {isCurrent && (
                      <span className="font-semibold text-primary transition-opacity group-hover:opacity-100 lg:opacity-70">
                        点击收集到星瓶 →
                      </span>
                    )}
                  </div>
                </>
              )
              return (
                <div key={g.id} className="relative pl-8">
                  {/* 时间轴节点：圆点钉在竖线上，短横线连到卡片 */}
                  <span
                    className={cn(
                      'absolute left-0 top-4 size-3.5 rounded-full border-2 bg-card',
                      done
                        ? 'border-primary bg-primary'
                        : isCurrent
                          ? 'border-primary ring-4 ring-primary/15'
                          : 'border-border',
                    )}
                    aria-hidden
                  />
                  <span className="absolute left-[13px] top-[21px] h-px w-[19px] bg-border" aria-hidden />
                  {isCurrent ? (
                    <button
                      ref={(el) => {
                        itemRefs.current[i] = el
                      }}
                      onClick={() => collect(i)}
                      className="group block w-full cursor-pointer rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <BeamFrame>{body}</BeamFrame>
                    </button>
                  ) : (
                    <button
                      ref={(el) => {
                        itemRefs.current[i] = el
                      }}
                      onClick={
                        done
                          ? () =>
                              update((d) => {
                                d.abilities['g' + g.id] = false
                              })
                          : undefined
                      }
                      disabled={!done}
                      className={cn(
                        'block w-full rounded-lg border bg-card px-4 py-2.5 text-left',
                        done
                          ? 'cursor-pointer border-border transition-colors hover:bg-accent/40'
                          : 'cursor-default border-border/60 opacity-60',
                      )}
                    >
                      {body}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 右：立体五角星瓶 + 光点进度 */}
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border bg-card p-6">
          <div ref={bottleRef} className="flex items-center justify-center">
            <StarBottle level={shownPct} pulse={pulse} />
          </div>
          <p className="flex items-center gap-1.5 text-center text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" aria-hidden />
            {collectedLight === TOTAL_LIGHT ? '全部目标已点亮' : '达成目标，收进星瓶'}
          </p>
          <div className="w-full max-w-[240px]">
            <div className="mb-1.5 flex items-center justify-between text-xs tabular-nums text-muted-foreground">
              <span>
                光点 {shown} / {TOTAL_LIGHT}
              </span>
              <span>{Math.round(shownPct * 100)}%</span>
            </div>
            <Progress value={shownPct * 100} indicatorClassName="transition-none" />
          </div>
          <p className="text-center text-[11px] text-muted-foreground">大目标 ✦ 10 · 中目标 ✦ 5 · 小目标 ✦ 2~3</p>
        </div>
      </div>

      {/* 光点粒子层 */}
      <div ref={layerRef} className="pointer-events-none fixed inset-0 z-[60]" aria-hidden />
    </div>
  )
}
