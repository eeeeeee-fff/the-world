<template>
  <div class="app-root">
    <ThreeDashboard v-if="currentView === 'dashboard'" />
    <BlueprintScene v-if="currentView === 'blueprint'" @exit="currentView = 'dashboard'" />

    <button
      v-show="currentView === 'dashboard'"
      class="industry-chain-cta"
      type="button"
      @click="currentView = 'blueprint'"
    >
      <span class="industry-chain-cta__pulse"></span>
      <span class="industry-chain-cta__label">Industry Chain</span>
      <span class="industry-chain-cta__arrow">→</span>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ThreeDashboard from './components/ThreeDashboard.vue'
import BlueprintScene from './components/BlueprintScene.vue'

const currentView = ref('dashboard')
</script>

<style scoped>
.app-root {
  position: relative;
  width: 100%;
  height: 100%;
}

.industry-chain-cta {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 150;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 22px;
  border: 1px solid rgba(134, 228, 255, 0.55);
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(98, 198, 255, 0.32), rgba(120, 163, 255, 0.28));
  color: rgba(235, 246, 255, 0.98);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  backdrop-filter: blur(14px);
  box-shadow: 0 0 24px rgba(98, 198, 255, 0.32), 0 8px 28px rgba(0, 0, 0, 0.32);
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
  font-family: "Segoe UI", "PingFang SC", sans-serif;
}

.industry-chain-cta:hover {
  transform: translateX(-50%) translateY(-2px);
  background: linear-gradient(135deg, rgba(98, 198, 255, 0.45), rgba(120, 163, 255, 0.4));
  box-shadow: 0 0 32px rgba(134, 228, 255, 0.55), 0 10px 32px rgba(0, 0, 0, 0.38);
}

.industry-chain-cta__pulse {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #86e4ff;
  box-shadow: 0 0 12px #86e4ff;
  animation: industry-chain-pulse 1.6s ease-in-out infinite;
}

.industry-chain-cta__arrow {
  font-size: 16px;
  transition: transform 0.25s ease;
}

.industry-chain-cta:hover .industry-chain-cta__arrow {
  transform: translateX(4px);
}

@keyframes industry-chain-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.4);
  }
}
</style>
