<template>
  <ThreeDashboard v-if="!activeDetail" @open-detail="openDetail" />
  <NodeDetailPage v-else :detail="activeDetail" @back="closeDetail" />
</template>

<script setup>
import { ref } from 'vue'
import ThreeDashboard from './components/ThreeDashboard.vue'
import NodeDetailPage from './components/NodeDetailPage.vue'

const activeDetail = ref(null)

function openDetail(payload) {
  activeDetail.value = payload
}

function closeDetail() {
  activeDetail.value = null
}
</script>
