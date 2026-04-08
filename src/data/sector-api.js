const cache = new Map()

const SECTOR_LOADERS = {
  robot:  () => import('./sectors/robot.js'),
  bio:    () => import('./sectors/bio.js'),
  energy: () => import('./sectors/energy.js'),
  ai:     () => import('./sectors/ai.js'),
}

/**
 * 按需动态加载 sector 数据，首次加载后缓存。
 * 结构与原 categoryData[sector] 完全一致，可直接替换为真实 API 请求。
 */
export async function fetchSectorData(sector) {
  if (cache.has(sector)) return cache.get(sector)

  const loader = SECTOR_LOADERS[sector]
  if (!loader) throw new Error(`Unknown sector: ${sector}`)

  const mod = await loader()
  cache.set(sector, mod.default)
  return mod.default
}
