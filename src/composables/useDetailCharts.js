import { nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  buildTalentRadarOption, buildTalentPubOption,
  buildEnterpriseOutputOption, buildEnterpriseTalentOption,
  buildPaperKeywordsOption, buildPaperRelatedOption,
  buildPatentTreemapOption, buildPatentTrendOption, buildPatentIpcOption,
} from '../charts/type-charts.js'

/**
 * Manages the ECharts instances for the intel detail panel.
 * Accepts an object of DOM element refs and exposes refresh / dispose / resize.
 */
export function useDetailCharts(chartRefs) {
  const instances = {
    talentRadar: null, talentPub: null,
    entOutput: null,   entTalent: null,
    paperKey: null,    paperRel: null,
    patentTree: null,  patentTrend: null, patentIpc: null,
  }

  function ic(refKey) {
    const el = chartRefs[refKey]?.value
    if (!el) return instances[refKey]
    return instances[refKey] || (instances[refKey] = echarts.init(el, null, { renderer: 'canvas' }))
  }

  async function refresh(particleTypeData, category) {
    await nextTick()
    if (!particleTypeData) return

    if (category === 'Talent') {
      instances.talentRadar = ic('talentRadar')
      instances.talentPub   = ic('talentPub')
      instances.talentRadar?.setOption(buildTalentRadarOption(particleTypeData, echarts), true)
      instances.talentPub?.setOption(buildTalentPubOption(particleTypeData, echarts), true)
      instances.talentRadar?.resize()
      instances.talentPub?.resize()
    } else if (category === 'Enterprise') {
      instances.entOutput = ic('entOutput')
      instances.entTalent = ic('entTalent')
      instances.entOutput?.setOption(buildEnterpriseOutputOption(particleTypeData, echarts), true)
      instances.entTalent?.setOption(buildEnterpriseTalentOption(particleTypeData, echarts), true)
      instances.entOutput?.resize()
      instances.entTalent?.resize()
    } else if (category === 'Paper') {
      instances.paperKey = ic('paperKey')
      instances.paperRel = ic('paperRel')
      instances.paperKey?.setOption(buildPaperKeywordsOption(particleTypeData, echarts), true)
      instances.paperRel?.setOption(buildPaperRelatedOption(particleTypeData, echarts), true)
      instances.paperKey?.resize()
      instances.paperRel?.resize()
    } else if (category === 'Patent') {
      instances.patentTree  = ic('patentTree')
      instances.patentTrend = ic('patentTrend')
      instances.patentIpc   = ic('patentIpc')
      instances.patentTree?.setOption(buildPatentTreemapOption(particleTypeData, echarts), true)
      instances.patentTrend?.setOption(buildPatentTrendOption(particleTypeData, echarts), true)
      instances.patentIpc?.setOption(buildPatentIpcOption(particleTypeData, echarts), true)
      instances.patentTree?.resize()
      instances.patentTrend?.resize()
      instances.patentIpc?.resize()
    }
  }

  function dispose() {
    Object.keys(instances).forEach((key) => {
      instances[key]?.dispose()
      instances[key] = null
    })
  }

  function resizeAll() {
    Object.values(instances).forEach((c) => c?.resize())
  }

  return { refresh, dispose, resizeAll }
}
