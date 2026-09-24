<script setup lang="ts">
const diseases = [
  { name: 'Mildiou',       count: 32, pct: 85, color: '#dc2626', bg: '#fee2e2', icon: '🦠' },
  { name: 'Oïdium',        count: 27, pct: 71, color: '#d97706', bg: '#fef3c7', icon: '🍄' },
  { name: 'Alternariose',  count: 19, pct: 50, color: '#ea580c', bg: '#ffedd5', icon: '🔴' },
  { name: 'Rouille jaune', count: 14, pct: 37, color: '#ca8a04', bg: '#fefce8', icon: '⚠️' },
  { name: 'Anthracnose',   count: 11, pct: 29, color: '#9333ea', bg: '#f3e8ff', icon: '🐛' },
  { name: 'Botrytis',      count: 8,  pct: 21, color: '#2563eb', bg: '#dbeafe', icon: '🌸' },
];
</script>

<template>
  <div class="dash-card">
    <div class="card-title">Top Maladies</div>
    <div class="card-sub mb-4">Ce mois-ci</div>

    <div class="disease-list">
      <div v-for="(d, i) in diseases" :key="d.name" class="disease-row">
        <span class="rank">{{ i + 1 }}</span>
        <span class="d-icon" :style="{ background: d.bg }">{{ d.icon }}</span>
        <div class="d-info">
          <div class="d-top">
            <span class="d-name">{{ d.name }}</span>
            <span class="d-count">{{ d.count }} cas</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: d.pct + '%', background: d.color }" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dash-card  { background: white; border-radius: 14px; padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,.07); height: 100%; }
.card-title { font-size: 1rem; font-weight: 700; color: #111827; }
.card-sub   { font-size: .8rem; color: #9ca3af; margin-top: 2px; }
.mb-4 { margin-bottom: 16px; }

.disease-list { display: flex; flex-direction: column; gap: 14px; }

.disease-row { display: flex; align-items: center; gap: 10px; }

.rank  { font-size: .8rem; font-weight: 700; color: #9ca3af; min-width: 16px; }
.d-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
.d-info { flex: 1; }
.d-top  { display: flex; justify-content: space-between; margin-bottom: 5px; }
.d-name { font-size: .85rem; font-weight: 600; color: #374151; }
.d-count { font-size: .75rem; color: #9ca3af; }

.progress-bar  { background: #f3f4f6; border-radius: 99px; height: 6px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 99px; transition: width .6s ease; }
</style>