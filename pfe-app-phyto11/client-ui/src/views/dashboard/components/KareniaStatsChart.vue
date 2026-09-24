
<template>
  
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useMyProjects } from '@/composables/useMyProjecys'

const {
  projects,
  isLoading,
  fetchMyProjects,
  refreshProject,
} = useMyProjects()

const selectedProjectId = ref('')
const mode = ref<'karenia' | 'alexandrium'>('karenia')

const selectedProjects = computed(() =>
  selectedProjectId.value
    ? projects.value.filter(project => project.id === selectedProjectId.value)
    : projects.value
)

const chartRows = computed(() =>
  selectedProjects.value
    .filter(project => project.analyzedImagesCount > 0)
    .map(project => {
      const percent = mode.value === 'karenia'
        ? project.kareniaPercentage ?? 0
        : project.alexandriumPercentage ?? 0
      const high = percent >= 60
      const warning = percent >= 30

      return {
        id: project.id,
        title: project.title,
        percent: Math.round(percent * 10) / 10,
        color: mode.value === 'karenia' ? '#dc2626' : '#ea580c',
        status: high ? 'Critique' : warning ? 'Surveillance' : 'Normal',
        statusColor: high ? '#ef4444' : warning ? '#f59e0b' : '#10b981',
      }
    })
    .sort((a, b) => b.percent - a.percent)
)

const displayedRows = computed(() =>
  selectedProjectId.value ? chartRows.value : chartRows.value.slice(0, 8)
)

const hiddenRowsCount = computed(() =>
  selectedProjectId.value ? 0 : Math.max(0, chartRows.value.length - displayedRows.value.length)
)

const combinedRows = computed(() =>
  selectedProjects.value
    .filter(project => project.analyzedImagesCount > 0)
    .map(project => ({
      id: project.id,
      title: project.title,
      karenia: Math.round((project.kareniaPercentage ?? 0) * 10) / 10,
      alexandrium: Math.round((project.alexandriumPercentage ?? 0) * 10) / 10,
      total: (project.kareniaPercentage ?? 0) + (project.alexandriumPercentage ?? 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, selectedProjectId.value ? 1 : 5)
)

const maxKarenia = computed(() =>
  Math.max(0, ...projects.value.map(project => project.kareniaPercentage ?? 0)).toFixed(1)
)

const maxAlexandrium = computed(() =>
  Math.max(0, ...projects.value.map(project => project.alexandriumPercentage ?? 0)).toFixed(1)
)

onMounted(async () => {
  await fetchMyProjects(true)
  await Promise.all(projects.value.map(project => refreshProject(project.id)))
})
</script>


<style scoped lang="scss">
.chart-card {
  background: #fff;
  border-radius: 16px;
  border: 0.5px solid rgba(11,17,32,.08);
  box-shadow: 0 1px 4px rgba(11,17,32,.06), 0 4px 16px rgba(11,17,32,.04);
  padding: 20px 22px;
  transition: box-shadow .2s;
  &:hover { box-shadow: 0 4px 12px rgba(11,17,32,.08), 0 12px 32px rgba(11,17,32,.07); }

  &__header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 18px; gap: 12px; flex-wrap: wrap;
  }
  &__title {
    display: flex; align-items: center; gap: 8px;
    font-size: 14px; font-weight: 700; color: #0b1120;
  }
  &__controls { display: flex; gap: 4px; }
}

.mode-btn {
  padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
  border: 0.5px solid rgba(11,17,32,.12); background: transparent;
  color: rgba(11,17,32,.5); cursor: pointer; transition: all .15s;
  &:hover { border-color: #1a5cff; color: #1a5cff; }
  &--active { background: #e8efff; border-color: #1a5cff; color: #1a5cff; }
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
}

.summary-item {
  background: #f8fafc;
  border: 1px solid rgba(11,17,32,.08);
  border-radius: 8px;
  padding: 10px 12px;
  &__label { display: block; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 3px; }
  strong { color: #0f172a; font-size: 20px; line-height: 1; }
  &--karenia strong { color: #dc2626; }
  &--alexandrium strong { color: #ea580c; }
}

.combined-chart {
  border: 1px solid rgba(15,23,42,.08);
  border-radius: 10px;
  background: #ffffff;
  padding: 12px;
  margin-bottom: 12px;
}

.combined-chart__title {
  font-size: 12px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 10px;
}

.combined-row {
  display: grid;
  grid-template-columns: 130px 1fr 100px;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  &:last-child { margin-bottom: 0; }
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}

.combined-row__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.combined-row__track {
  display: flex;
  height: 12px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
}

.combined-row__bar {
  display: block;
  min-width: 0;
  height: 100%;
  &--k { background: #dc2626; }
  &--a { background: #ea580c; }
}

.combined-row__value {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  text-align: right;
  @media (max-width: 640px) { text-align: left; }
}

.bars-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 390px;
  overflow-y: auto;
  padding: 4px 4px 12px 0;
}

.bar-row {
  display: grid;
  grid-template-columns: 160px 1fr 48px 80px;
  align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 10px;
  transition: background .15s;
  &:hover { background: #f4f6fb; }
}

.bar-label {
  font-size: 12px; font-weight: 600; color: #1f2937;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.bar-track {
  position: relative; height: 10px;
  background: #f1f5f9; border-radius: 5px; overflow: hidden;
}

.bar-fill {
  height: 100%; border-radius: 5px;
  transition: width .6s cubic-bezier(.4,0,.2,1);
  max-width: 100%;
}

.bar-threshold {
  position: absolute; top: 0; bottom: 0; width: 1.5px;
  background: rgba(245,158,11,.6); pointer-events: none;
  &--critical { background: rgba(239,68,68,.6); }
}

.bar-value { font-size: 13px; font-weight: 700; text-align: right; }

.bar-status {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 500; color: #6b7280;
}

.chart-more {
  padding: 9px 10px;
  border-radius: 8px;
  background: #f8fafc;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

.project-select {
  padding: 7px 12px; border-radius: 8px;
  border: 0.5px solid rgba(11,17,32,.15); font-size: 13px;
  background: #f8fafc; color: #1f2937; width: 240px;
  margin-bottom: 14px;
  &:focus { outline: none; border-color: #1a5cff; }
}

.chart-wrap { height: 260px; width: 100%; position: relative; transition: opacity .2s; }

.chart-legend {
  display: flex; gap: 16px; flex-wrap: wrap;
  margin-top: 14px; padding-top: 12px;
  border-top: 0.5px solid rgba(11,17,32,.06);
}

.legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #6b7280; font-weight: 500; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

.chart-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 180px; gap: 8px; background: #f4f6fb; border-radius: 12px;
  &__icon { font-size: 32px; opacity: .4; }
  p { font-size: 13px; font-weight: 600; color: rgba(11,17,32,.35); margin: 0; }
  span { font-size: 11px; color: rgba(11,17,32,.25); text-align: center; }
}

.chart-loader {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 180px; gap: 12px;
  span { font-size: 12px; color: rgba(11,17,32,.3); }
}

.spinner {
  width: 22px; height: 22px; border-radius: 50%;
  border: 2px solid rgba(26,92,255,.15); border-top-color: #1a5cff;
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
