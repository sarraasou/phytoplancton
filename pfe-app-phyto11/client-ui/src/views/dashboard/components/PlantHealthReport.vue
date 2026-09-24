<script setup lang="ts">
const chartOptions = {
  chart: { type: 'donut', fontFamily: 'inherit' },
  labels: ['Saines', 'Malades', 'En traitement', 'Critiques'],
  colors: ['#16a34a', '#dc2626', '#d97706', '#9333ea'],
  legend: { position: 'bottom', fontSize: '12px' },
  dataLabels: { enabled: true, formatter: (val: number) => val.toFixed(0) + '%' },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            show: true, label: 'Total', fontSize: '13px',
            formatter: () => '1 284',
          },
        },
      },
    },
  },
  tooltip: { theme: 'light' },
};
const series = [62, 18, 14, 6];

const summaries = [
  { label: 'Saines',       value: '62%', color: '#16a34a' },
  { label: 'Malades',      value: '18%', color: '#dc2626' },
  { label: 'Traitement',   value: '14%', color: '#d97706' },
  { label: 'Critiques',    value: '6%',  color: '#9333ea' },
];
</script>

<template>
  <div class="dash-card">
    <div class="card-title">Santé des Plantes</div>
    <div class="card-sub mb-3">Répartition globale</div>

    <apexchart type="donut" height="260" :options="chartOptions" :series="series" />

    <div class="divider" />
    <div class="summary-row">
      <div v-for="s in summaries" :key="s.label" class="summary-item">
        <div class="summary-val" :style="{ color: s.color }">{{ s.value }}</div>
        <div class="summary-lbl">{{ s.label }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dash-card { background: white; border-radius: 14px; padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,.07); height: 100%; }
.card-title { font-size: 1rem; font-weight: 700; color: #111827; }
.card-sub   { font-size: .8rem; color: #9ca3af; margin-top: 2px; }
.mb-3 { margin-bottom: 12px; }
.divider { border: none; border-top: 1px solid #f3f4f6; margin: 16px 0; }
.summary-row { display: flex; justify-content: space-between; }
.summary-item { text-align: center; }
.summary-val { font-size: 1.2rem; font-weight: 700; }
.summary-lbl { font-size: .72rem; color: #9ca3af; margin-top: 2px; }
</style>