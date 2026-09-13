import { Link } from 'react-router-dom'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BLOCK_COLOR, BLOCK_NAME, COURSE_URL, TAG_LABEL, isKeyPhase, phaseShort, type TaskTag, type PlanPhase } from '@/lib/plan'
import { fy, deltaOf, phasePct, statusOf, type SchedItem } from '@/lib/schedule'
import { cn } from '@/lib/utils'
import { Anchor, ArrowRight, BookOpen, ExternalLink, Info, Layers, Lightbulb, Star, Target, X, type LucideIcon } from 'lucide-react'

export function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return <Badge variant="secondary">按计划</Badge>
  if (delta < 0) return <Badge variant="success">提前 {-delta} 天</Badge>
  return <Badge variant="destructive">顺延 {delta} 天</Badge>
}

export function StatusBadge({ it }: { it: SchedItem }) {
  const s = statusOf(it)
  return (
    <Badge variant={s.k === 'done' ? 'success' : s.k === 'active' ? 'info' : 'secondary'}>{s.label}</Badge>
  )
}

const TAG_VARIANT: Record<TaskTag, 'warning' | 'secondary' | 'destructive' | 'info' | 'success'> = {
  out: 'warning',
  skip: 'secondary',
  ms: 'destructive',
  fix: 'info',
  opt: 'success',
}

/** 统一子卡片：图标与标题垂直居中，正文 13px/relaxed 居左 */
function SubCard({
  icon: Icon,
  title,
  tone = 'default',
  dashed = false,
  children,
}: {
  icon: LucideIcon
  title: string
  tone?: 'default' | 'warning'
  dashed?: boolean
  children: React.ReactNode
}) {
  return (
    <section
      className={cn(
        'rounded-md border p-3',
        tone === 'warning' ? 'border-warning/30 bg-warning/5' : 'bg-card',
        dashed && 'border-dashed',
      )}
    >
      <div className="mb-1.5 flex h-5 items-center gap-1.5 text-xs font-bold leading-none">
        <Icon className={cn('size-3.5 shrink-0', tone === 'warning' ? 'text-warning' : 'text-primary')} />
        {title}
      </div>
      <div className="text-left text-[13px] leading-relaxed">{children}</div>
    </section>
  )
}

/** 学习路线卡片：章节详情 + 独立的进度/入口卡片（甘特图点击行后在右侧展示） */
export function PhasePanel({ item, baseEnd, className }: { item: SchedItem; baseEnd: Date; className?: string }) {
  const p: PlanPhase = item.p
  const pct = phasePct(item)
  const delta = deltaOf(item.end, baseEnd)
  const key = isKeyPhase(p)

  return (
    <>
      <Card className={cn('min-h-0 flex-1 animate-fade-up overflow-y-auto', className)}>
        {/* 标题吸顶：向上滚动时仅标题钉在卡片左上方 */}
        <div className="sticky top-0 z-10 bg-card px-5 pb-2.5 pt-4">
          <CardTitle className={cn('text-base font-extrabold leading-snug', key && 'text-destructive')}>
            {phaseShort(p)}
          </CardTitle>
        </div>
        <CardContent className="flex flex-col gap-3 p-5 pt-0">
          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs tabular-nums text-muted-foreground">
            <span>{p.sub}</span>
            <Badge variant="outline">{BLOCK_NAME[p.block]}</Badge>
            <span>
              {fy(item.start)} ~ {fy(item.end)}
            </span>
            <DeltaBadge delta={delta} />
            <StatusBadge it={item} />
          </div>

          <SubCard icon={Target} title="本章节目标">
            <ul className="flex flex-col gap-1">
              {p.goals.map((g) => (
                <li key={g} className="flex gap-1.5">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-primary/70" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </SubCard>

          <SubCard icon={Lightbulb} title="学习建议" tone="warning" dashed>
            <ul className="flex flex-col gap-1">
              {p.advice.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </SubCard>

          <SubCard icon={Info} title="为什么要学">
            <p className="text-muted-foreground">{p.why}</p>
          </SubCard>

          <SubCard icon={Layers} title="内容分层">
            <div className="flex flex-col gap-2.5">
              <div>
                <div className="mb-1">
                  <Badge>精学</Badge>
                </div>
                <ul className="flex flex-col gap-1">
                  {p.deep.map((x) => (
                    <li key={x} className="flex gap-2">
                      <span
                        className="mt-[7px] size-1.5 shrink-0 rounded-full"
                        style={{ background: BLOCK_COLOR[p.block] }}
                      />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {p.skim.length > 0 && (
                <div>
                  <div className="mb-1">
                    <Badge variant="outline">略读</Badge>
                  </div>
                  <ul className="flex flex-col gap-1 text-muted-foreground">
                    {p.skim.map((x) => (
                      <li key={x} className="flex gap-2">
                        <span className="mt-[7px] size-1.5 shrink-0 rounded-full border border-muted-foreground" />
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {p.skip.length > 0 && (
                <div>
                  <div className="mb-1">
                    <Badge variant="secondary">跳过</Badge>
                  </div>
                  <ul className="flex flex-col gap-1 text-muted-foreground">
                    {p.skip.map((x) => (
                      <li key={x} className="flex gap-2 line-through opacity-70">
                        <X className="mt-0.5 size-3 shrink-0" aria-hidden />
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </SubCard>

          <SubCard icon={Star} title="阶段产出">
            <ul className="flex flex-col gap-1 font-semibold">
              {p.outputs.map((x) => (
                <li key={x} className="flex gap-1.5">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-sm bg-foreground" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </SubCard>

          <SubCard icon={Anchor} title="课程锚点">
            <span className="font-semibold text-primary">{p.anchor}</span>
          </SubCard>
        </CardContent>
      </Card>

      {/* 进度与入口：独立卡片，进度条在上、按钮在下 */}
      <Card className="shrink-0">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between text-xs tabular-nums text-muted-foreground">
            <span>
              任务 {item.st.checks.filter(Boolean).length}/{item.st.checks.length}
            </span>
            <span>{Math.round(pct * 100)}%</span>
          </div>
          <Progress value={pct * 100} indicatorClassName="transition-all" />
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <a href={COURSE_URL} target="_blank" rel="noreferrer">
                <BookOpen data-icon="inline-start" />
                去学习
                <ExternalLink data-icon="inline-end" />
              </a>
            </Button>
            <Button asChild size="sm" className="flex-1">
              <Link to="/checkin">
                去打卡
                <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export { TAG_VARIANT, TAG_LABEL }
