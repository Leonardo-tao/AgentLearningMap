import { PLAN, ANCHOR_DATE, type PlanPhase } from './plan'

export interface PhaseState {
  checks: boolean[]
  done: boolean
  doneDate: string | null
  daysOverride: number | null
}

export interface ProgressState {
  version: 1
  phases: Record<string, PhaseState>
  abilities: Record<string, boolean>
}

const DAY = 86400000

export function pd(s: string): Date {
  const a = s.split('-').map(Number)
  return new Date(a[0], a[1] - 1, a[2])
}

export function fd(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function fy(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function fcn(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, '0')} 月 ${String(d.getDate()).padStart(2, '0')} 日`
}

export function addD(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

export function diff(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY)
}

export function today0(): Date {
  const t = new Date()
  return new Date(t.getFullYear(), t.getMonth(), t.getDate())
}

export function phaseDays(p: PlanPhase, st: PhaseState): number {
  return st.daysOverride ?? p.days
}

export function defaultState(): ProgressState {
  const phases: Record<string, PhaseState> = {}
  PLAN.phases.forEach((p) => {
    phases[p.id] = { checks: p.tasks.map(() => false), done: false, doneDate: null, daysOverride: null }
  })
  return { version: 1, phases, abilities: {} }
}

/** 导入的旧数据 / 手改文件后补齐结构，防止数组越界 */
export function normalize(raw: unknown): ProgressState {
  const base = defaultState()
  if (!raw || typeof raw !== 'object') return base
  const obj = raw as Partial<ProgressState>
  if (obj.phases) {
    Object.entries(obj.phases).forEach(([pid, st]) => {
      const def = base.phases[pid]
      if (!def || !st) return
      const checks = Array.isArray(st.checks)
        ? def.checks.map((_, i) => !!(st.checks as boolean[])[i])
        : def.checks
      base.phases[pid] = {
        checks,
        done: !!st.done,
        doneDate: typeof st.doneDate === 'string' ? st.doneDate : null,
        daysOverride: typeof st.daysOverride === 'number' && st.daysOverride >= 1 ? st.daysOverride : null,
      }
    })
  }
  if (obj.abilities && typeof obj.abilities === 'object') {
    base.abilities = obj.abilities
  }
  return base
}

export interface SchedItem {
  p: PlanPhase
  st: PhaseState
  start: Date
  end: Date
  done: boolean
}

/** 基线排期（永远按计划天数） */
export function schedBase(): { id: string; start: Date; end: Date }[] {
  let cur = pd(ANCHOR_DATE)
  const out: { id: string; start: Date; end: Date }[] = []
  PLAN.phases.forEach((p) => {
    const s = new Date(cur)
    const e = addD(s, p.days - 1)
    out.push({ id: p.id, start: s, end: e })
    cur = addD(e, 1)
  })
  return out
}

/**
 * 实际排期：级联重排核心。
 * 上一阶段结束日的次日 = 下一阶段开始日；
 * 已完成阶段用真实完成日期，否则用 开始 + 周期。
 * 提前完成 → 后续整体前移；延迟完成 → 自动顺延；调整周期 → 联动重排。
 */
export function sched(state: ProgressState): SchedItem[] {
  let cur = pd(ANCHOR_DATE)
  const out: SchedItem[] = []
  PLAN.phases.forEach((p) => {
    const st = state.phases[p.id]
    const start = new Date(cur)
    let end: Date
    let done = false
    if (st.done && st.doneDate) {
      end = pd(st.doneDate)
      if (end < start) end = new Date(start)
      done = true
    } else {
      end = addD(start, phaseDays(p, st) - 1)
    }
    out.push({ p, st, start, end, done })
    cur = addD(end, 1)
  })
  return out
}

export type StatusKey = 'done' | 'active' | 'todo'

export function statusOf(it: SchedItem): { k: StatusKey; label: string } {
  const t = today0()
  if (it.done) return { k: 'done', label: '已完成' }
  if (it.st.checks.some(Boolean) || t >= it.start) {
    return { k: 'active', label: t > it.end ? '进行中 · 超期' : '进行中' }
  }
  return { k: 'todo', label: '未开始' }
}

export function phasePct(it: SchedItem): number {
  if (it.done) return 1
  return it.st.checks.filter(Boolean).length / it.st.checks.length
}

export function overallPct(S: SchedItem[]): number {
  let w = 0
  let acc = 0
  S.forEach((it) => {
    w += phaseDays(it.p, it.st)
    acc += phaseDays(it.p, it.st) * phasePct(it)
  })
  return w ? acc / w : 0
}

export function currentPhaseItem(S: SchedItem[]): SchedItem {
  return S.find((i) => !i.done) ?? S[S.length - 1]
}

export function deltaOf(actualEnd: Date, baseEnd: Date): number {
  return diff(baseEnd, actualEnd)
}

export interface MilestoneView {
  pid: string
  label: string
  hard: boolean
  date: Date
}

export function milestoneViews(S: SchedItem[]): MilestoneView[] {
  return PLAN.milestones.map((m) => {
    const it = S.find((i) => i.p.id === m.pid)!
    return { ...m, date: it.end }
  })
}
