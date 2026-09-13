import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Map, Target, CheckSquare, CloudOff, CheckCircle2, Compass, HardDrive, Settings, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProgress } from './progress-provider'

const ANIM_KEY = { off: 'pref-anim-off', lite: 'pref-anim-lite', full: 'pref-anim-full' } as const
type AnimMode = keyof typeof ANIM_KEY
const ANIM_LABEL: Record<AnimMode, string> = { off: '关', lite: '轻微', full: '丰富' }

const NAV: { to: string; label: string; icon: LucideIcon; end: boolean }[] = [
  { to: '/', label: '仪表盘', icon: LayoutDashboard, end: true },
  { to: '/roadmap', label: '学习路线', icon: Map, end: false },
  { to: '/goals', label: '学习目标', icon: Target, end: false },
  { to: '/checkin', label: '进度打卡', icon: CheckSquare, end: false },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { apiOk, lastSavedAt, state, update } = useProgress()
  const savedCount = Object.values(state.phases).filter((p) => p.done).length
  const [animOpen, setAnimOpen] = useState(false)
  const anim: AnimMode = state.abilities[ANIM_KEY.full]
    ? 'full'
    : state.abilities[ANIM_KEY.off]
      ? 'off'
      : 'lite'

  useEffect(() => {
    document.documentElement.dataset.anim = anim
  }, [anim])

  const setAnim = (m: AnimMode) =>
    update((d) => {
      for (const k of Object.values(ANIM_KEY)) delete d.abilities[k]
      if (m !== 'lite') d.abilities[ANIM_KEY[m]] = true
    })

  return (
    <div className="flex min-h-screen">
      {/* 侧边栏 */}
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r bg-card">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Compass className="size-5" />
          </div>
          <div>
            <div className="text-[15px] font-bold leading-tight">Agent 转行路线图</div>
            <div className="text-[11px] tabular-nums text-muted-foreground">2026.09 – 2027.03</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive ? 'bg-accent text-primary' : 'hover:bg-muted hover:text-foreground',
                )
              }
            >
              <n.icon className="size-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 px-5 py-4 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-success" />
            已完成阶段 {savedCount} / 9
          </div>
          {apiOk ? (
            <div className="flex items-center gap-1.5">
              <HardDrive className="size-3.5 shrink-0" />
              <span className="tabular-nums">{lastSavedAt ? `上次修改 ${lastSavedAt}` : '暂无修改'}</span>
            </div>
          ) : (
            <div className="flex items-start gap-1.5 rounded-lg bg-warning/10 p-2 text-warning">
              <CloudOff className="mt-0.5 size-3.5 shrink-0" />
              <span>本地服务未运行，进度暂不落盘——请用桌面快捷方式启动</span>
            </div>
          )}
          <div>
            <button
              onClick={() => setAnimOpen((o) => !o)}
              className="flex w-full items-center gap-1.5 rounded-md px-1 py-1 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Settings className="size-3.5 shrink-0" />
              动画效果：{ANIM_LABEL[anim]}
            </button>
            {animOpen && (
              <div className="mt-1 flex gap-1">
                {(['off', 'lite', 'full'] as AnimMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setAnim(m)}
                    className={cn(
                      'flex-1 rounded-md border px-1.5 py-1 font-semibold transition-colors',
                      anim === m ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted',
                    )}
                  >
                    {ANIM_LABEL[m]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 内容区：锁定 100vh，超出时在 main 内部滚动，页面框架始终不超一屏 */}
      <main data-smooth className="h-screen min-w-0 flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
    </div>
  )
}

export function PageHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3.5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="size-6" strokeWidth={2.25} />
      </span>
      <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
    </div>
  )
}
