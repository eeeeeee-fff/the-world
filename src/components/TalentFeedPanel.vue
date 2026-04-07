<template>
  <section class="talent-feed glass-card">
    <div class="talent-panel-title-row">
      <div>
        <p class="talent-mini-label">&#26368;&#26032;&#36755;&#20986;</p>
        <h3>{{ talent.name }} &#30340;&#21160;&#24577;&#27969;</h3>
      </div>
      <div class="talent-title-side">
        <span class="up-chip prominent">{{ totalOutputCount }} &#26465;&#36755;&#20986;</span>
      </div>
    </div>

    <div class="talent-feed-list full-list">
      <article
        v-for="(item, index) in talent.feed"
        :key="`${item.date}-${item.title}`"
        class="talent-feed-card"
        :class="{ latest: index === 0 }"
        :title="item.title"
      >
        <div class="talent-feed-meta">
          <span class="feed-type" :class="{ strong: index === 0 }">{{ item.type }}</span>
          <span class="feed-score">{{ item.score }} &#28909;</span>
          <time>{{ item.date }}</time>
        </div>
        <h4 :title="item.title">{{ item.title }}</h4>
        <p class="talent-feed-authors" :title="item.authors.join(' / ')">{{ item.authors.join(' ? ') }}</p>
        <p class="talent-feed-summary" :class="{ large: index === 0 }">{{ item.abstract }}</p>
        <div class="talent-keyword-row">
          <span
            v-for="keyword in item.keywords"
            :key="keyword"
            class="talent-keyword"
            :class="{ emphasis: index === 0 }"
          >
            {{ keyword }}
          </span>
        </div>
      </article>

      <div v-if="!talent.feed.length" class="talent-empty-state talent-feed-empty">
        <div class="talent-empty-icon">&#31354;</div>
        <p>&#24403;&#21069;&#35746;&#38405;&#26242;&#26080;&#26368;&#26032;&#21160;&#24577;</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  talent: { type: Object, required: true }
})

const totalOutputCount = computed(() => props.talent.outputCount ?? props.talent.feed.length)
</script>
