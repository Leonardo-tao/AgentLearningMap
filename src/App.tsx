import { useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { ProgressProvider } from '@/components/progress-provider'
import { AppLayout } from '@/components/layout'
import { attachSmoothScroll } from '@/lib/smooth-scroll'
import DashboardPage from '@/pages/dashboard'
import RoadmapPage from '@/pages/roadmap'
import GoalsPage from '@/pages/goals'
import CheckinPage from '@/pages/checkin'

export default function App() {
  // 所有标记 data-smooth 的滚动容器自动获得平滑惯性滚动
  useEffect(() => {
    const seen = new WeakSet<Element>()
    const attachAll = () => {
      document.querySelectorAll<HTMLElement>('[data-smooth]').forEach((el) => {
        if (!seen.has(el)) {
          seen.add(el)
          attachSmoothScroll(el)
        }
      })
    }
    attachAll()
    const mo = new MutationObserver(attachAll)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [])

  return (
    <ProgressProvider>
      <HashRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/checkin" element={<CheckinPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </AppLayout>
      </HashRouter>
    </ProgressProvider>
  )
}
