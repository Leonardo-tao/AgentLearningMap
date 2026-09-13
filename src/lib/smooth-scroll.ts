/** 滚动容器平滑化：接管滚轮，rAF 插值逼近目标位置（微微惯性） */
export function attachSmoothScroll(el: HTMLElement) {
  if (el.dataset.smoothOn) return
  el.dataset.smoothOn = '1'

  let target = el.scrollTop
  let raf = 0

  const max = () => Math.max(0, el.scrollHeight - el.clientHeight)

  const tick = () => {
    const cur = el.scrollTop
    const d = target - cur
    if (Math.abs(d) < 0.4) {
      el.scrollTop = target
      raf = 0
      return
    }
    el.scrollTop = cur + d * 0.16
    raf = requestAnimationFrame(tick)
  }

  el.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      if (e.ctrlKey || !e.deltaY) return
      const atEdge = (e.deltaY > 0 && el.scrollTop >= max() - 0.5) || (e.deltaY < 0 && el.scrollTop <= 0.5)
      if (atEdge) return
      e.preventDefault()
      e.stopPropagation()
      target = Math.max(0, Math.min(max(), target + e.deltaY))
      if (!raf) raf = requestAnimationFrame(tick)
    },
    { passive: false },
  )
}
