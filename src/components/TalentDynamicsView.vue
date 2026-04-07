<template>
  <section class="talent-dynamics-layout">
    <TalentSubscriptionPanel
      v-model="selectedId"
      v-model:search-value="searchValue"
      v-model:focus-filter="focusFilter"
      :items="displaySubscriptions"
      :hottest="hottestTalent"
    />

    <div class="talent-main-stack">
      <section class="talent-hero glass-card">
        <div class="talent-hero-copy">
          <p class="talent-mini-label">&#20154;&#25165;&#21160;&#24577; / TALENT DYNAMICS</p>
          <div class="talent-hero-topline">
            <h2>{{ selectedTalent.name }}</h2>
            <span class="talent-hero-role" :title="selectedTalent.title">{{ selectedTalent.title }}</span>
          </div>
          <p>{{ selectedTalent.summary }}</p>
          <div class="talent-keyword-row hero-tags">
            <span v-for="tag in selectedTalent.tags" :key="tag" class="talent-keyword">{{ tag }}</span>
          </div>
        </div>

        <div class="talent-hero-side">
          <div class="talent-hero-metrics">
            <article class="talent-hero-metric primary">
              <span>&#35746;&#38405;&#28909;&#24230;&#65288;&#25351;&#25968;&#65289;</span>
              <strong>{{ selectedTalent.heat }}</strong>
            </article>
            <article class="talent-hero-metric secondary">
              <span>&#26368;&#26032;&#36755;&#20986;&#65288;&#26465;&#65289;</span>
              <strong>{{ selectedTalent.outputCount }}</strong>
            </article>
            <article class="talent-hero-metric secondary">
              <span>&#21512;&#20316;&#33410;&#28857;&#65288;&#20010;&#65289;</span>
              <strong>{{ selectedTalent.collaboratorCount }}</strong>
            </article>
          </div>

          <div class="talent-hero-spotlight">
            <div class="talent-hero-meta">
              <span :title="selectedTalent.org">{{ selectedTalent.org }}</span>
              <span>{{ selectedTalent.location }}</span>
            </div>
            <div v-if="featuredFeed" class="talent-hero-highlight">
              <p class="talent-mini-label">&#26368;&#26032;&#28909;&#28857;</p>
              <h3 :title="featuredFeed.title">{{ featuredFeed.title }}</h3>
              <div class="talent-hero-highlight-meta">
                <span>{{ featuredFeed.type }}</span>
                <span>{{ featuredFeed.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="talent-content-grid">
        <TalentFeedPanel :talent="selectedTalent" />
        <TalentInsightBoard :talent="selectedTalent" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import TalentFeedPanel from './TalentFeedPanel.vue'
import TalentInsightBoard from './TalentInsightBoard.vue'
import TalentSubscriptionPanel from './TalentSubscriptionPanel.vue'

const props = defineProps({
  subscriptions: { type: Array, required: true }
})

const searchValue = ref('')
const focusFilter = ref('all')

const normalizedSubscriptions = computed(() => {
  return props.subscriptions
    .map((item) => ({
      ...item,
      outputCount: item.feed.length,
      collaboratorCount: item.collaborators.length
    }))
    .sort((a, b) => b.heat - a.heat)
})

const hottestTalent = computed(() => normalizedSubscriptions.value[0] || props.subscriptions[0])
const selectedId = ref(hottestTalent.value?.id || '')

const filteredSubscriptions = computed(() => {
  const keyword = searchValue.value.trim().toLowerCase()

  return normalizedSubscriptions.value.filter((item) => {
    if (focusFilter.value === 'hot' && item.heat < 80) {
      return false
    }
    if (focusFilter.value === 'active' && item.outputCount === 0) {
      return false
    }
    if (focusFilter.value === 'linked' && item.collaboratorCount === 0) {
      return false
    }

    if (!keyword) {
      return true
    }

    return [item.name, item.org, item.title, ...(item.tags || [])]
      .join(' ')
      .toLowerCase()
      .includes(keyword)
  })
})

const displaySubscriptions = computed(() => {
  if (filteredSubscriptions.value.length) {
    return filteredSubscriptions.value
  }

  return searchValue.value.trim() ? [] : normalizedSubscriptions.value
})

const selectedTalent = computed(() => {
  return displaySubscriptions.value.find((item) => item.id === selectedId.value)
    || normalizedSubscriptions.value.find((item) => item.id === selectedId.value)
    || hottestTalent.value
})

const featuredFeed = computed(() => selectedTalent.value?.feed?.[0] || null)

watch(displaySubscriptions, (list) => {
  if (list.length && !list.some((item) => item.id === selectedId.value)) {
    selectedId.value = list[0].id
  }
}, { immediate: true })
</script>
