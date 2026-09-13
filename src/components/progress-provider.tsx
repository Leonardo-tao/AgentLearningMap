import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { defaultState, normalize, sched, overallPct, currentPhaseItem, type ProgressState } from '@/lib/schedule'
import { fetchProgress, saveProgress } from '@/lib/api'

interface ProgressCtx {
  state: ProgressState
  apiOk: boolean
  lastSavedAt: string | null
  /** 修改进度并自动保存到项目内 data/progress.json */
  update: (mutate: (draft: ProgressState) => void) => void
  replaceAll: (s: ProgressState) => void
}

const Ctx = createContext<ProgressCtx | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(() => defaultState())
  const [apiOk, setApiOk] = useState(true)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef(state)
  latest.current = state

  useEffect(() => {
    fetchProgress()
      .then((remote) => {
        if (remote) setState(normalize(remote))
      })
      .catch(() => setApiOk(false))
  }, [])

  const persist = useCallback(
    (s: ProgressState) => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        saveProgress(s)
          .then(() => {
            setApiOk(true)
            setLastSavedAt(new Date().toLocaleTimeString())
          })
          .catch(() => setApiOk(false))
      }, 250)
    },
    [],
  )

  const update = useCallback(
    (mutate: (draft: ProgressState) => void) => {
      setState((prev) => {
        const next: ProgressState = {
          version: 1,
          phases: Object.fromEntries(Object.entries(prev.phases).map(([k, v]) => [k, { ...v, checks: [...v.checks] }])),
          abilities: { ...prev.abilities },
        }
        mutate(next)
        persist(next)
        return next
      })
    },
    [persist],
  )

  const replaceAll = useCallback(
    (s: ProgressState) => {
      const n = normalize(s)
      setState(n)
      persist(n)
    },
    [persist],
  )

  const value = useMemo(() => ({ state, apiOk, lastSavedAt, update, replaceAll }), [state, apiOk, lastSavedAt, update, replaceAll])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useProgress(): ProgressCtx {
  const v = useContext(Ctx)
  if (!v) throw new Error('useProgress must be used within ProgressProvider')
  return v
}

export function useSchedule() {
  const { state } = useProgress()
  return useMemo(() => sched(state), [state])
}

export function useOverview() {
  const S = useSchedule()
  return useMemo(
    () => ({
      S,
      pct: overallPct(S),
      current: currentPhaseItem(S),
    }),
    [S],
  )
}
