<!-- src/views/dashboard/components/MyProjectsWidget.vue -->
<template>
  <div class="mpw">
    <div class="mpw__header">
      <div class="mpw__title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        Mes projets récents
        <span v-if="alertProjects.length > 0" class="alert-badge">{{ alertProjects.length }}</span>
      </div>
      <button class="mpw__see-all" @click="goToAllProjects">Voir tout →</button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="mpw__loader">
      <div v-for="i in 3" :key="i" class="skeleton-row">
        <div class="skel skel--avatar"></div>
        <div class="skel-lines">
          <div class="skel skel--title"></div>
          <div class="skel skel--sub"></div>
        </div>
        <div class="skel skel--badge"></div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="recentProjects.length === 0" class="mpw__empty">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".3"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
      <p>Aucun projet accessible</p>
    </div>

    <!-- Liste -->
    <div v-else class="mpw__list">
      <div
        v-for="p in recentProjects"
        :key="p.id"
        class="project-row"
        :class="{
          'project-row--critical': p.bloomStatus === 'critical',
          'project-row--warning':  p.bloomStatus === 'warning',
        }"
        @click="navigateToProject(p)"
      >
        <!-- Icône statut bloom -->
        <div class="project-row__icon">
          <span v-if="p.bloomStatus === 'critical'" class="bloom-dot bloom-dot--critical"></span>
          <span v-else-if="p.bloomStatus === 'warning'"  class="bloom-dot bloom-dot--warning"></span>
          <span v-else-if="p.bloomStatus === 'normal'"   class="bloom-dot bloom-dot--normal"></span>
          <span v-else class="bloom-dot bloom-dot--pending"></span>
        </div>

        <!-- Info -->
        <div class="project-row__info">
          <div class="project-row__name">{{ p.title }}</div>
          <div class="project-row__stats">
            <span class="mini-stat">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              {{ p.imagesCount }}
            </span>
            <span class="mini-stat">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              {{ p.analyzedImagesCount }} analysées
            </span>
            <span v-if="p.kareniaPercentage !== null" class="mini-stat mini-stat--karenia">
              K {{ p.kareniaPercentage.toFixed(1) }}%
            </span>
            <span v-if="p.alexandriumPercentage !== null" class="mini-stat mini-stat--alexandrium">
              A {{ p.alexandriumPercentage.toFixed(1) }}%
            </span>
            <span
              v-if="p.kareniaPercentage === null && p.alexandriumPercentage === null"
              class="mini-stat mini-stat--pending"
            >⏳ En attente</span>
          </div>
          <div class="project-row__time">{{ timeAgo(p.lastActivity || p.updatedAt) }}</div>
        </div>

        <!-- Badge bloom -->
        <div class="project-row__badge">
          <span class="bloom-text" :style="{ color: getBloomColor(p.bloomStatus) }">
            {{ getBloomText(p.bloomStatus) }}
          </span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity=".3"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    </div>

    <!-- Footer résumé -->
    <div v-if="!isLoading && totalImagesToAnalyze > 0" class="mpw__footer">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{{ totalImagesToAnalyze }} image(s) en attente d'analyse</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/useAuth'
import { useMyProjects } from '@/composables/useMyProjecys'
import type { MyProject } from '@/composables/useMyProjecys'

const router = useRouter()
const { currentUser } = storeToRefs(useAuthStore())
const {
  recentProjects, alertProjects, totalImagesToAnalyze, isLoading,
  fetchMyProjects, getBloomColor, getBloomText, getProjectRoute,
} = useMyProjects()

const timeAgo = (d: string) => {
  if (!d) return ''
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (diff < 60)    return "À l'instant"
  if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

// ✅ navigation correcte — utilise getProjectRoute depuis le composable
const navigateToProject = (p: MyProject) => {
  router.push(getProjectRoute(p.id))
}

const goToAllProjects = () => {
  const role = (currentUser.value?.userRole || 'user').toLowerCase()
  const prefix = role === 'admin' ? 'admin' : role === 'expert' ? 'expert' : role === 'technicien' ? 'technicien' : 'user'
  router.push(`/${prefix}/projects`)
}

watch(() => currentUser.value?.id, (id) => { if (id) fetchMyProjects() }, { immediate: true })
onMounted(() => { fetchMyProjects() })
</script>

<style scoped lang="scss">
.mpw {
  background: #fff;
  border-radius: 16px;
  border: 0.5px solid rgba(11,17,32,.08);
  box-shadow: 0 1px 4px rgba(11,17,32,.06), 0 4px 16px rgba(11,17,32,.04);
  overflow: hidden;
  transition: box-shadow .2s;
  &:hover { box-shadow: 0 4px 12px rgba(11,17,32,.08), 0 12px 32px rgba(11,17,32,.07); }

  &__header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 20px 14px;
    border-bottom: 0.5px solid rgba(11,17,32,.06);
  }
  &__title {
    display: flex; align-items: center; gap: 8px;
    font-size: 14px; font-weight: 700; color: #0b1120;
    svg { color: #1a5cff; }
  }
  &__see-all {
    font-size: 12px; font-weight: 600; color: #1a5cff;
    background: none; border: none; cursor: pointer; transition: opacity .15s;
    &:hover { opacity: .7; }
  }
  &__loader { padding: 12px 20px 8px; display: flex; flex-direction: column; gap: 10px; }
  &__empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 40px; gap: 10px;
    p { font-size: 13px; color: rgba(11,17,32,.35); font-weight: 500; margin: 0; }
  }
  &__list { display: flex; flex-direction: column; }
  &__footer {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 20px; border-top: 0.5px solid rgba(11,17,32,.06);
    font-size: 11px; color: #d97706; font-weight: 600;
    background: #fffbeb;
    svg { color: #d97706; flex-shrink: 0; }
  }
}

.alert-badge {
  background: #ef4444; color: white;
  font-size: 10px; font-weight: 700;
  min-width: 18px; height: 18px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  padding: 0 4px;
}

.project-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 20px; cursor: pointer; transition: background .15s;
  border-bottom: 0.5px solid rgba(11,17,32,.05);
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(11,17,32,.02); }
  &--critical { border-left: 3px solid #ef4444; background: linear-gradient(90deg, rgba(239,68,68,.03) 0%, transparent 100%); }
  &--warning  { border-left: 3px solid #f59e0b; }

  &__icon { flex-shrink: 0; }
  &__info { flex: 1; min-width: 0; }
  &__name {
    font-size: 13px; font-weight: 600; color: #0b1120;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 4px;
  }
  &__stats { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 2px; }
  &__time  { font-size: 10px; color: rgba(11,17,32,.3); }
  &__badge { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
}

.bloom-dot {
  display: block; width: 10px; height: 10px; border-radius: 50%;
  &--critical { background: #ef4444; box-shadow: 0 0 6px rgba(239,68,68,.5); animation: pulse-dot 2s ease-in-out infinite; }
  &--warning  { background: #f59e0b; }
  &--normal   { background: #10b981; }
  &--pending  { background: #9ca3af; }
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: .6; transform: scale(1.3); }
}

.mini-stat {
  display: flex; align-items: center; gap: 3px;
  font-size: 11px; color: rgba(11,17,32,.45); font-weight: 500;
  svg { flex-shrink: 0; }
  &--bloom   { font-weight: 700; }
  &--karenia { color: #dc2626; font-weight: 700; }
  &--alexandrium { color: #ea580c; font-weight: 700; }
  &--pending { color: #f59e0b; }
}

.bloom-text { font-size: 11px; font-weight: 600; white-space: nowrap; }

/* Skeletons */
.skeleton-row { display: flex; align-items: center; gap: 12px; }
.skel-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.skel {
  background: linear-gradient(90deg, #f3f4f6 25%, #e9eaec 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite; border-radius: 5px;
  &--avatar { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; }
  &--title  { height: 13px; width: 60%; }
  &--sub    { height: 10px; width: 80%; }
  &--badge  { width: 56px; height: 22px; flex-shrink: 0; }
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
