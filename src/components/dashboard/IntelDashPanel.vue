<template>
  <section class="hud intel-dash-panel glass-card" :class="{ active: !!particleData }">
    <template v-if="particleData">

      <!-- Common header -->
      <div class="dash-header">
        <div class="dash-path">
          <p class="eyebrow">INTEL NODE / {{ categoryStyles[particleData.category].label }}</p>
          <div class="dash-breadcrumb">
            <span>{{ provinceName || 'CHINA' }}</span><span class="bc-sep">›</span>
            <span>{{ cityName || '--' }}</span><span class="bc-sep">›</span>
            <strong>{{ particleData.name }}</strong>
          </div>
        </div>
        <div class="dash-header-right">
          <div class="live-badge-sm"><span class="live-dot"></span><span>情报实时</span></div>
          <button class="close-btn" @click="$emit('close')">← 返回地图</button>
        </div>
      </div>

      <!-- Node identity hero -->
      <div class="node-hero-row glass-inner" :style="{ '--accent': accentColor }">
        <div class="node-hero-accent-bar" :style="{ background: accentColor }"></div>
        <span class="type-chip node-chip" :style="{ background: accentColor+'28', color: accentColor, borderColor: accentColor+'44' }">
          {{ categoryStyles[particleData.category].label }}
        </span>
        <div class="node-hero-text">
          <h2>{{ particleData.title }}</h2>
          <p>{{ particleData.subtitle }}</p>
          <div class="tag-row" style="margin-top:5px" v-if="particleData.tags?.length">
            <span v-for="tag in particleData.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>
        <div class="node-value-badge">
          <strong :style="{ color: accentColor }">{{ particleData.value }}</strong>
          <span>综合指数</span>
        </div>
      </div>

      <!-- KPI metrics strip -->
      <div class="kpi-row" v-if="typeData">
        <div v-for="(m, i) in typeData.metrics" :key="m.label" class="kpi-card glass-inner" :style="{ '--kc': kpiColors[i] }">
          <span class="kpi-label">{{ m.label }}</span>
          <strong class="kpi-value" :style="{ color: kpiColors[i] }">{{ kpiCountedValues[i] ?? m.value }}</strong>
          <div class="kpi-track"><div class="kpi-fill" :style="{ width: kpiWidth(m.value), background: kpiColors[i] }"></div></div>
        </div>
      </div>

      <!-- Type-specific panels -->
      <div class="type-panels-area" v-if="typeData && !loading">
        <TalentSection
          v-if="particleData.category === 'Talent'"
          :graph="talentGraph"
          :type-data="typeData"
          :is-activity-detail-available="isActivityDetailAvailable"
          @open-activity="$emit('open-activity', $event)"
        />
        <EnterpriseSection
          v-else-if="particleData.category === 'Enterprise'"
          :graph="enterpriseGraph"
          :type-data="typeData"
          :is-activity-detail-available="isActivityDetailAvailable"
          @open-activity="$emit('open-activity', $event)"
        />
        <PaperSection
          v-else-if="particleData.category === 'Paper'"
          :graph="paperGraph"
          :type-data="typeData"
        />
        <PatentSection
          v-else-if="particleData.category === 'Patent'"
          :graph="patentGraph"
          :type-data="typeData"
          :is-activity-detail-available="isActivityDetailAvailable"
          @open-activity="$emit('open-activity', $event)"
        />
      </div>

      <!-- Loading overlay -->
      <Transition name="sector-fade">
        <div v-if="loading" class="sector-loading-overlay">
          <div class="sector-loading-inner">
            <div class="sector-spinner"></div>
            <span>情报数据加载中</span>
            <div class="sector-skel-row">
              <div class="sector-skel" style="width:60%;height:12px"></div>
              <div class="sector-skel" style="width:40%;height:12px"></div>
              <div class="sector-skel" style="width:75%;height:12px"></div>
            </div>
          </div>
        </div>
      </Transition>

    </template>
  </section>
</template>

<script setup>
import TalentSection from './TalentSection.vue'
import EnterpriseSection from './EnterpriseSection.vue'
import PaperSection from './PaperSection.vue'
import PatentSection from './PatentSection.vue'

defineProps({
  particleData: { type: Object, default: null },
  typeData: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  accentColor: { type: String, default: '#58d5ff' },
  categoryStyles: { type: Object, required: true },
  kpiColors: { type: Array, required: true },
  kpiCountedValues: { type: Array, default: () => [] },
  kpiWidth: { type: Function, required: true },
  provinceName: { type: String, default: '' },
  cityName: { type: String, default: '' },
  talentGraph: { type: Object, default: () => ({ nodes: [], links: [] }) },
  enterpriseGraph: { type: Object, default: () => ({ nodes: [], links: [] }) },
  paperGraph: { type: Object, default: () => ({ nodes: [], links: [] }) },
  patentGraph: { type: Object, default: () => ({ nodes: [], links: [] }) },
  isActivityDetailAvailable: { type: Function, required: true },
})

defineEmits(['close', 'open-activity'])
</script>
