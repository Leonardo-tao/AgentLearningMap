import type { ProgressState } from './schedule'

/**
 * 进度持久化：读写项目内的 data/progress.json（通过本地服务 API）。
 * 静态部署（GitHub Pages）下 API 不存在，此时仅在内存中生效并提示。
 */
export async function fetchProgress(): Promise<ProgressState | null> {
  const res = await fetch('api/progress', { cache: 'no-store' })
  if (!res.ok) return null
  return (await res.json()) as ProgressState
}

export async function saveProgress(state: ProgressState): Promise<void> {
  const res = await fetch('api/progress', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  })
  if (!res.ok) throw new Error('保存失败: ' + res.status)
}
