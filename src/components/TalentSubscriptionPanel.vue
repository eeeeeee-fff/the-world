<template>
  <section class="talent-subscribe glass-card">
    <div class="talent-panel-top simple-head">
      <div>
        <p class="talent-mini-label">&#24403;&#21069;&#35746;&#38405;</p>
        <h3>&#20154;&#25165;&#27744;</h3>
      </div>
    </div>

    <label class="talent-search highlighted">
      <input
        :value="searchValue"
        type="text"
        placeholder="&#25628;&#32034;&#20154;&#25165;&#12289;&#26426;&#26500;&#25110;&#20851;&#38190;&#35789;"
        @input="$emit('update:searchValue', $event.target.value)"
      />
      <span>&#8989;</span>
    </label>

    <div class="talent-subscribe-list compact-list single-list">
      <button
        v-for="person in items"
        :key="person.id"
        type="button"
        class="talent-subscribe-item compact single-row"
        :class="{ active: person.id === modelValue, hottest: hottest && person.id === hottest.id }"
        :title="`${person.name} / ${person.title}`"
        @click="$emit('update:modelValue', person.id)"
      >
        <div class="talent-subscribe-main">
          <div class="talent-subscribe-head">
            <strong>{{ person.name }}</strong>
            <span class="heat-chip">{{ person.heat }} &#28909;</span>
          </div>
          <p>{{ person.title }}</p>
          <div class="talent-subscribe-foot responsive-foot">
            <span class="talent-role small" :title="person.org">{{ person.org }}</span>
            <span class="talent-subscribe-count">{{ person.outputCount }} &#26465;&#36755;&#20986;</span>
          </div>
        </div>
      </button>

      <div v-if="!items.length" class="talent-empty-state talent-list-empty">
        <div class="talent-empty-icon">&#31354;</div>
        <p>&#26410;&#25214;&#21040;&#31526;&#21512;&#26465;&#20214;&#30340;&#35746;&#38405;&#20154;&#25165;</p>
      </div>
    </div>

    <div class="talent-add-wrap">
      <button type="button" class="talent-add-button">+ &#26032;&#22686;&#35746;&#38405;</button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  items: { type: Array, required: true },
  hottest: { type: Object, default: null },
  modelValue: { type: String, required: true },
  searchValue: { type: String, required: true },
  focusFilter: { type: String, required: true }
})

defineEmits(['update:modelValue', 'update:searchValue', 'update:focusFilter'])
</script>
