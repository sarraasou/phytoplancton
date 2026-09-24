<!-- src/views/dashboard/components/GlobalBloomAlert.vue -->
<template>
  <div v-if="visibleAlerts.length > 0" class="bloom-alerts-wrap">

    <transition-group name="alert-fade" tag="div" class="alerts-list">
      <div
        v-for="alert in displayedAlerts"
        :key="alert.projectId || alert.projectTitle"
        class="bloom-alert"
        :class="alert.severity === 'BLOOM_CRITICAL' ? 'bloom-alert--critical' : 'bloom-alert--warning'"
        @click="goToProject(alert.projectId)"
      >
        <div class="bloom-alert__stripe"></div>
        <div class="bloom-alert__icon">{{ getAlertIcon(alert.severity) }}</div>
        <div class="bloom-alert__body">
          <div class="bloom-alert__title">
            {{ alert.severity === 'BLOOM_CRITICAL' ? 'Alerte critique' : 'Alerte bloom' }}
            <span class="bloom-alert__project">{{ alert.projectTitle }}</span>
          </div>
          <div class="bloom-alert__detail">
            <span class="pct" :style="{ color: getAlertColor(alert.severity) }">
              {{ alert.percentage.toFixed(1) }}% Karenia
            </span>
            <span class="sep">·</span>
            <span v-if="alert.totalCells > 0">
              {{ alert.kareniaCells }}/{{ alert.totalCells }} cellules
            </span>
            <span v-else>
              {{ alert.kareniaCells }} cellule(s) détectée(s)
            </span>
            <span class="sep">·</span>
            <span>{{ timeAgo(alert.detectedAt) }}</span>
          </div>
        </div>
        <button
          class="bloom-alert__close"
          @click.stop="dismissAlert(alert.projectId)"
          title="Ignorer"
        >✕</button>
      </div>
    </transition-group>

    <div class="alerts-footer">
      <button
        v-if="hiddenCount > 0"
        class="footer-btn footer-btn--more"
        @click="showAll = !showAll"
      >
        {{ showAll ? 'Réduire' : `Voir ${hiddenCount} autre${hiddenCount > 1 ? 's' : ''}` }}
      </button>
      <span class="footer-sep"></span>
      <button class="footer-btn footer-btn--dismiss" @click="dismissAllAlerts">
        Tout ignorer
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBloomAlerts } from '@/composables/useBloomAlerts'
import { useAuthStore } from '@/store/useAuth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const { currentUser } = storeToRefs(useAuthStore())
const { visibleAlerts, dismissAlert, dismissAllAlerts, getAlertColor, getAlertIcon } = useBloomAlerts()

const showAll    = ref(false)
const MAX_VISIBLE = 3

// Déduplication robuste : une alerte par projet (clé = projectId ou projectTitle)
const deduplicatedAlerts = computed(() => {
  const map = new Map<string, any>()
  for (const alert of visibleAlerts.value) {
    const key = alert.projectId || alert.projectTitle
    const existing = map.get(key)
    if (!existing) {
      map.set(key, alert)
    } else {
      const existingDate = new Date(existing.detectedAt).getTime()
      const newDate = new Date(alert.detectedAt).getTime()
      const existingSeverity = existing.severity === 'BLOOM_CRITICAL' ? 2 : 1
      const newSeverity = alert.severity === 'BLOOM_CRITICAL' ? 2 : 1
      if (newDate > existingDate || (newDate === existingDate && newSeverity > existingSeverity)) {
        map.set(key, alert)
      }
    }
  }
  return Array.from(map.values())
})

const sortedAlerts = computed(() =>
  [...deduplicatedAlerts.value].sort((a, b) => {
    if (a.severity === 'BLOOM_CRITICAL' && b.severity !== 'BLOOM_CRITICAL') return -1
    if (b.severity === 'BLOOM_CRITICAL' && a.severity !== 'BLOOM_CRITICAL') return 1
    return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
  })
)

const displayedAlerts = computed(() =>
  showAll.value ? sortedAlerts.value : sortedAlerts.value.slice(0, MAX_VISIBLE)
)

const hiddenCount = computed(() =>
  Math.max(0, sortedAlerts.value.length - MAX_VISIBLE)
)

const timeAgo = (d: string) => {
  if (!d) return ''
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (diff < 60)    return "à l'instant"
  if (diff < 3600)  return `il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

const goToProject = (id: string) => {
  const role = (currentUser.value?.userRole || 'user').toLowerCase()
  const prefix = role === 'admin' ? 'admin' : role === 'expert' ? 'expert' : role === 'technicien' ? 'technicien' : 'user'
  router.push(`/${prefix}/projects/${id}`)
}
</script>

<style scoped lang="scss">
.bloom-alerts-wrap {
  margin-bottom: 20px;
  border-radius: 14px;
  border: 0.5px solid rgba(239,68,68,.2);
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(239,68,68,.08);
  background: #fff;
}

.alerts-list { display: flex; flex-direction: column; }

.bloom-alert {
  position: relative;
  display: flex; align-items: center; gap: 12px;
  padding: 13px 16px 13px 20px;
  cursor: pointer; transition: background .15s;
  border-bottom: 0.5px solid rgba(239,68,68,.1);
  &:last-of-type { border-bottom: none; }
  &:hover { background: rgba(239,68,68,.03); }

  &__stripe {
    position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
  }
  &--critical {
    background: linear-gradient(90deg, rgba(239,68,68,.04) 0%, rgba(255,255,255,0) 100%);
    .bloom-alert__stripe { background: #ef4444; }
  }
  &--warning {
    background: linear-gradient(90deg, rgba(245,158,11,.04) 0%, rgba(255,255,255,0) 100%);
    .bloom-alert__stripe { background: #f59e0b; }
  }
  &__icon { font-size: 20px; flex-shrink: 0; }
  &__body { flex: 1; min-width: 0; }
  &__title {
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    font-size: 13px; font-weight: 700; color: #1f2937; margin-bottom: 3px;
  }
  &__project {
    font-size: 12px; font-weight: 500;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;
  }
  &__detail {
    display: flex; align-items: center; gap: 6px;
    font-size: 11px; color: #6b7280; flex-wrap: wrap;
    .pct { font-weight: 700; }
    .sep { color: #d1d5db; }
  }
  &__close {
    width: 26px; height: 26px; border-radius: 50%;
    border: none; background: transparent; cursor: pointer;
    color: #9ca3af; font-size: 12px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: all .15s;
    &:hover { background: rgba(239,68,68,.1); color: #ef4444; }
  }
}

.alerts-footer {
  display: flex; align-items: center; gap: 8px; padding: 10px 16px;
  background: rgba(11,17,32,.02); border-top: 0.5px solid rgba(239,68,68,.1);
}
.footer-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 12px; border-radius: 20px; border: none;
  font-size: 11px; font-weight: 600; cursor: pointer; transition: all .15s;
  &--more { background: rgba(239,68,68,.08); color: #dc2626; &:hover { background: rgba(239,68,68,.15); } }
  &--dismiss { background: transparent; color: #9ca3af; border: 0.5px solid rgba(11,17,32,.1); &:hover { color: #6b7280; } }
}
.footer-sep { flex: 1; }

.alert-fade-enter-active, .alert-fade-leave-active { transition: all .2s ease; }
.alert-fade-enter-from, .alert-fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>