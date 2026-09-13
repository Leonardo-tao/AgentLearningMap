import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/layout'
import { Gantt } from '@/components/gantt'
import { PhasePanel } from '@/components/phase-panel'
import { useOverview, useSchedule } from '@/components/progress-provider'
import { schedBase } from '@/lib/schedule'
import { Map } from 'lucide-react'

export default function RoadmapPage() {
  const S = useSchedule()
  const { current } = useOverview()
  const base = schedBase()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedIdEff = selectedId ?? current.p.id
  const item = useMemo(() => S.find((i) => i.p.id === selectedIdEff)!, [S, selectedIdEff])
  const baseItem = base.find((b) => b.id === selectedIdEff)!

  return (
    <div className="stagger mx-auto max-w-[1400px] p-8">
      <PageHeader icon={Map} title="学习路线" />

      <div className="flex flex-col items-start gap-4 xl:h-[calc(100vh-9rem)] xl:flex-row">
        {/* 左：甘特图（占满整列高度） */}
        <div className="w-full min-w-0 flex-1 xl:h-full">
          <Gantt items={S} selectedId={selectedIdEff} onSelect={setSelectedId} />
        </div>

        {/* 右：章节详情卡 + 进度入口卡 */}
        <div className="flex w-full shrink-0 flex-col gap-4 xl:h-full xl:w-[380px]">
          <PhasePanel item={item} baseEnd={baseItem.end} />
        </div>
      </div>
    </div>
  )
}
