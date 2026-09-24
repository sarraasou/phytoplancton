<script setup lang="ts">
const chartOptions = {
  chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit' },
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02 } },
  colors: ['#16a34a', '#2563eb', '#d97706'],
  xaxis: {
    categories: ['S1','S2','S3','S4','S5','S6','S7','S8'],
    labels: { style: { fontSize: '11px', colors: '#9ca3af' } },
  },
  yaxis: { labels: { style: { fontSize: '11px', colors: '#9ca3af' } } },
  legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px' },
  grid: { borderColor: '#f3f4f6', strokeDashArray: 4 },
  tooltip: { theme: 'light' },
  dataLabels: { enabled: false },
  markers: { size: 4 },
};

const series = [
  { name: 'Fongicides',  data: [8,12,10,15,18,14,11,16] },
  { name: 'Insecticides',data: [5, 7, 9, 6,10, 8,12, 9] },
  { name: 'Biocontrôle', data: [2, 4, 6, 8, 7,10, 9,12] },
];

const treatments = [
  { type: 'Fongicide',   product: 'Mancozeb 80%',         plant: '🍅 Tomate', date: '03/04', user: 'Tech. Karim', color: '#16a34a', bg: '#dcfce7' },
  { type: 'Insecticide', product: 'Lambda-cyhalothrine',   plant: '🍇 Vigne',  date: '02/04', user: 'Agr. Fatma',  color: '#2563eb', bg: '#dbeafe' },
  { type: 'Biocontrôle', product: 'Bacillus subtilis',     plant: '🌶 Piment', date: '01/04', user: 'Expert Slim', color: '#d97706', bg: '#fef3c7' },
  { type: 'Fongicide',   product: 'Cuivre oxychlorure',    plant: '🫒 Olive',  date: '30/03', user: 'Tech. Nadia', color: '#16a34a', bg: '#dcfce7' },
];
</script>

<template>
  <div class="dash-card">
    <div class="card-header">
      <div>
        <div class="card-title">Évolution des Traitements</div>
        <div class="card-sub">8 dernières semaines</div>
      </div>
      <button class="btn-export">⬇ Export</button>
    </div>

    <apexchart type="area" height="220" :options="chartOptions" :series="series" />

    <div class="divider" />
    <div class="section-label">Derniers traitements appliqués</div>

    <div class="treat-list">
      <div v-for="t in treatments" :key="t.product" class="treat-row">
        <div class="treat-avatar" :style="{ background: t.bg, color: t.color }">💊</div>
        <div class="treat-info">
          <div class="treat-name">
            {{ t.product }}
            <span class="treat-type" :style="{ background: t.bg, color: t.color }">{{ t.type }}</span>
          </div>
          <div class="treat-meta">{{ t.plant }} · {{ t.user }} · {{ t.date }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dash-card    { background: white; border-radius: 14px; padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,.07); }
.card-header  { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.card-title   { font-size: 1rem; font-weight: 700; color: #111827; }
.card-sub     { font-size: .8rem; color: #9ca3af; margin-top: 2px; }
.btn-export   { background: #f3f4f6; border: none; border-radius: 8px; padding: 7px 14px; font-size: .82rem; font-weight: 600; cursor: pointer; color: #374151; &:hover { background: #e5e7eb; } }
.divider      { border: none; border-top: 1px solid #f3f4f6; margin: 16px 0; }
.section-label{ font-size: .82rem; font-weight: 700; color: #374151; margin-bottom: 12px; }

.treat-list { display: flex; flex-direction: column; gap: 10px; }
.treat-row  { display: flex; align-items: center; gap: 12px; }
.treat-avatar { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
.treat-info { flex: 1; }
.treat-name { font-size: .875rem; font-weight: 600; color: #111827; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.treat-type { font-size: .7rem; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
.treat-meta { font-size: .75rem; color: #9ca3af; margin-top: 2px; }
</style>