<script setup lang="ts">
import { ref } from 'vue';

const chartOptions = ref({
  chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
  plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
  dataLabels: { enabled: false },
  colors: ['#16a34a', '#2563eb'],
  xaxis: {
    categories: ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'],
    labels: { style: { fontSize: '11px', colors: '#6b7280' } },
  },
  yaxis: { labels: { style: { fontSize: '11px', colors: '#6b7280' } } },
  legend: { position: 'top', horizontalAlign: 'right', fontSize: '12px' },
  grid: { borderColor: '#f3f4f6', strokeDashArray: 4 },
  tooltip: { theme: 'light' },
});

const series = ref([
  { name: 'Maladies détectées',    data: [12,19,15,27,32,24,18,22,30,25,17,14] },
  { name: 'Traitements appliqués', data: [10,16,13,22,28,20,15,19,26,21,14,12] },
]);
</script>

<template>
  <div class="dash-card">
    <div class="card-header">
      <div>
        <div class="card-title">Maladies &amp; Traitements</div>
        <div class="card-sub">Vue annuelle par mois</div>
      </div>
    </div>
    <apexchart type="bar" height="280" :options="chartOptions" :series="series" />
  </div>
</template>

<style scoped lang="scss">
.dash-card { background: white; border-radius: 14px; padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,.07); height: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
.card-title { font-size: 1rem; font-weight: 700; color: #111827; }
.card-sub   { font-size: .8rem; color: #9ca3af; margin-top: 2px; }
</style>