<template>
  <div class="phyto-dashboard">

    <!-- ══ HERO HEADER ══ -->
    <header class="dash-hero">
      <div class="hero-bg-orb hero-bg-orb--1"></div>
      <div class="hero-bg-orb hero-bg-orb--2"></div>

      <div class="dash-hero__left">
        <div class="hero-badge">
          <span class="hero-badge__dot"></span>
          Système actif
        </div>
        <h1 class="dash-hero__title">
          Bonjour,
          <span class="name-wave">{{ currentUser?.firstName || currentUser?.email?.split('@')[0] }}</span> 👋
        </h1>
        <p class="dash-hero__sub">Tableau de bord · Détection Karenia Selliformis</p>
      </div>

      <div class="dash-hero__right">
        <div class="hero-info-chip">
          <span>📅</span>
          <span>{{ todayLabel }}</span>
        </div>
        <div class="role-badge" :class="`role-badge--${roleClass}`">{{ roleLabel }}</div>
      </div>
    </header>

    <!-- ══ BLOOM ALERTS ══ -->
    <transition-group name="alert-slide" tag="div" class="alerts-zone">
      <div
        v-for="alert in visibleAlerts"
        :key="alert.projectId"
        class="bloom-alert-card"
        :class="alert.severity === 'BLOOM_CRITICAL' ? 'bloom-alert-card--critical' : 'bloom-alert-card--high'"
      >
        <div class="bloom-alert-card__pulse"></div>
        <div class="bloom-alert-card__content">
          <div class="bloom-alert-card__icon">{{ alert.severity === 'BLOOM_CRITICAL' ? '🔴' : '🟠' }}</div>
          <div class="bloom-alert-card__body">
            <div class="bloom-alert-card__title">
              {{ alert.severity === 'BLOOM_CRITICAL' ? 'BLOOM CRITIQUE' : 'BLOOM ÉLEVÉ' }}
              <span class="bloom-pct">{{ Number(alert.percentage).toFixed(1) }}%</span>
            </div>
            <div class="bloom-alert-card__project">{{ alert.projectTitle }}</div>
            <div class="bloom-alert-card__detail">
              {{ alert.alertCells ?? alert.kareniaCells }} {{ alert.speciesName || 'Karenia' }} · {{ alert.totalCells }} cellules totales
            </div>
          </div>
          <div class="bloom-alert-card__meter">
            <div class="bloom-meter">
              <div class="bloom-meter__fill"
                :style="{ width: Math.min(100, alert.percentage) + '%' }"
                :class="alert.severity === 'BLOOM_CRITICAL' ? 'fill--critical' : 'fill--high'">
              </div>
            </div>
          </div>
          <button class="bloom-alert-card__close" @click="dismissAlert(alert.projectId)">✕</button>
        </div>
      </div>
    </transition-group>

    <!-- ══ KPI CARDS ══ -->
    <WidgetStats />

    <!-- ══ GRILLE PRINCIPALE ══ -->
    <div class="dash-grid">

      <!-- Colonne principale -->
      <div class="dash-col dash-col--main">
        <KareniaStatsChart />
        <MyProjectsWidget />
      </div>

      <!-- Colonne latérale -->
      <div class="dash-col dash-col--side">

        <!-- ✅ Permissions rapides EN PREMIER (Admin uniquement) -->
        <div v-if="isAdmin" class="side-card side-card--perms">
          <div class="side-card__header">
            <div class="side-card__title">
              <div class="side-card__icon-wrap side-card__icon-wrap--ocean">🔑</div>
              <div>
                <div class="side-card__name">Permissions rapides</div>
                <div class="side-card__sub">Gestion des accès projets</div>
              </div>
            </div>
            <button class="link-chip" @click="$router.push({ name: 'admin-list-project' })">Tous →</button>
          </div>

          <div class="perm-selects">
            <div class="labeled-select">
              <label>Projet</label>
              <el-select v-model="selectedProjectId" placeholder="Choisir un projet…" filterable clearable
                @change="onProjectSelect" class="w-full">
                <el-option v-for="p in projectList" :key="p.id" :label="p.title" :value="p.id" />
              </el-select>
            </div>
            <div class="labeled-select">
              <label>Utilisateur</label>
              <el-select v-model="selectedUserId" placeholder="Choisir un utilisateur…" filterable clearable
                :disabled="!selectedProjectId" @change="onUserSelect" class="w-full">
                <el-option v-for="u in userList" :key="u.id"
                  :label="`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username"
                  :value="u.id" />
              </el-select>
            </div>
          </div>

          <transition name="slide-down">
            <div v-if="selectedProjectId && selectedUserId" class="quick-perms">
              <div class="quick-perms__label">
                <span class="quick-perms__avatar" :style="{ background: selectedUserColor }">{{ selectedUserLetter }}</span>
                {{ selectedUserName }}
              </div>
              <div class="perm-toggles">
                <label v-for="perm in quickPermissions" :key="perm.key"
                  class="perm-toggle-mini"
                  :class="{ 'perm-toggle-mini--on': tempPermissions[perm.key] }">
                  <input type="checkbox" v-model="tempPermissions[perm.key]" :disabled="saving" />
                  <span class="perm-toggle-mini__icon">{{ perm.icon }}</span>
                  <span class="perm-toggle-mini__label">{{ perm.label }}</span>
                  <span class="perm-toggle-mini__check" v-if="tempPermissions[perm.key]">✓</span>
                </label>
              </div>
              <div class="perm-actions">
                <button class="btn btn--primary btn--xs" :disabled="!hasChanges || saving" @click="saveQuickPermissions">
                  <span v-if="saving">…</span><span v-else>✓ Sauvegarder</span>
                </button>
                <button class="btn btn--ghost btn--xs" :disabled="!hasChanges" @click="resetQuickPermissions">Annuler</button>
              </div>
            </div>
            <div v-else class="perm-hint">
              <span>☝️</span>
              <span>{{ selectedProjectId ? 'Sélectionnez un utilisateur' : 'Sélectionnez un projet' }}</span>
            </div>
          </transition>
        </div>

        <!-- ✅ Notifications EN SECOND -->
        <div class="side-card side-card--notifs">
          <div class="side-card__header">
            <div class="side-card__title">
              <div class="side-card__icon-wrap side-card__icon-wrap--amber">🔔</div>
              <div>
                <div class="side-card__name">
                  Notifications
                  <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
                </div>
                <div class="side-card__sub">{{ recentNotifs.length }} récentes</div>
              </div>
            </div>
            <button class="link-chip" @click="viewAllNotifications">Voir tout →</button>
          </div>

          <div v-if="loadingNotifs" class="loader-row">
            <div class="dots-loader"><span></span><span></span><span></span></div>
          </div>
          <div v-else-if="recentNotifs.length === 0" class="empty-mini">
            <span>✅</span><span>Aucune notification récente</span>
          </div>
          <div v-else class="notif-feed">
            <div v-for="n in recentNotifs" :key="n.id" class="notif-item"
              :class="{ 'notif-item--unread': !n.isRead }">
              <div class="notif-item__bullet" :class="`bullet--${(n.type || '').toLowerCase()}`">
                {{ notifIcon(n.type) }}
              </div>
              <div class="notif-item__body">
                <div class="notif-item__msg">{{ n.message }}</div>
                <div class="notif-item__time">{{ formatDateRelative(n.createdAt) }}</div>
              </div>
              <span v-if="!n.isRead" class="unread-dot"></span>
            </div>
          </div>
        </div>

        <!-- ✅ Comptes en attente EN DERNIER (Admin uniquement) -->
        <div v-if="isAdmin" class="side-card side-card--pending">
          <div class="side-card__header">
            <div class="side-card__title">
              <div class="side-card__icon-wrap side-card__icon-wrap--ruby">⏳</div>
              <div>
                <div class="side-card__name">
                  Comptes en attente
                  <span v-if="pendingUsers.length > 0" class="pending-badge">{{ pendingUsers.length }}</span>
                </div>
                <div class="side-card__sub">Validation requise</div>
              </div>
            </div>
            <button class="link-chip link-chip--urgent"
              @click="$router.push({ name: 'admin-pending-users' })">Gérer →</button>
          </div>

          <div v-if="loadingPending" class="loader-row">
            <div class="dots-loader"><span></span><span></span><span></span></div>
          </div>
          <div v-else-if="pendingUsers.length === 0" class="empty-mini">
            <span>✅</span><span>Aucun compte en attente</span>
          </div>
          <div v-else class="pending-feed">
            <div v-for="u in pendingUsers" :key="u.id" class="pending-item">
              <div class="pending-avatar" :style="{ background: userAvatarColor(u) }">
                {{ (u.firstName?.[0] || '?').toUpperCase() }}
              </div>
              <div class="pending-info">
                <div class="pending-name">{{ u.firstName }} {{ u.lastName }}</div>
                <div class="pending-email">{{ u.username }}</div>
              </div>
              <span class="pending-role">{{ u.userRole || 'user' }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/useAuth'
import { useRole } from '@/composables/useRole'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import WidgetStats from './components/WidgetStats.vue'
import MyProjectsWidget from './components/MyProjectsWidget.vue'
import KareniaStatsChart from './components/KareniaStatsChart.vue'
import { useBloomAlerts } from '@/composables/useBloomAlerts'

const API_URL = import.meta.env.VITE_API_URL
const router  = useRouter()

const { currentUser } = storeToRefs(useAuthStore())
const { isAdmin }     = useRole()
const { visibleAlerts, dismissAlert, startPolling } = useBloomAlerts()

// ── Rôle ──────────────────────────────────────────────────────────────────
const roleClass = computed(() => {
  const r = currentUser.value?.userRole?.toLowerCase() || 'user'
  return r === 'admin' ? 'admin' : r === 'expert' ? 'expert' : 'user'
})
const roleLabel = computed(() => {
  const r = currentUser.value?.userRole?.toUpperCase() || 'USER'
  const labels: Record<string, string> = { ADMIN: '👑 Admin', EXPERT: '🔬 Expert', BIOLOGISTE: '🔬 Biologiste' }
  return labels[r] || '👤 Utilisateur'
})
const todayLabel = computed(() =>
  new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'long' })
)

// ── Notifications ──────────────────────────────────────────────────────────
const loadingNotifs = ref(false)
const recentNotifs  = ref<any[]>([])
const unreadCount   = computed(() => recentNotifs.value.filter(n => !n.isRead).length)

// ── Comptes en attente ─────────────────────────────────────────────────────
const loadingPending = ref(false)
const pendingUsers   = ref<any[]>([])

// ── Permissions rapides ────────────────────────────────────────────────────
const selectedProjectId = ref('')
const selectedUserId    = ref('')
const projectList       = ref<any[]>([])
const userList          = ref<any[]>([])
const saving            = ref(false)

type PermKey = 'canView' | 'canUpload' | 'canAnnotate' | 'canValidate' | 'canEdit' | 'canDelete'
const emptyPerms = (): Record<PermKey, boolean> =>
  ({ canView: false, canUpload: false, canAnnotate: false, canValidate: false, canEdit: false, canDelete: false })

const tempPermissions     = ref<Record<PermKey, boolean>>(emptyPerms())
const originalPermissions = ref<Record<PermKey, boolean>>(emptyPerms())

const quickPermissions: { key: PermKey; label: string; icon: string }[] = [
  { key: 'canView',     label: 'Voir',      icon: '👁' },
  { key: 'canUpload',   label: 'Upload',    icon: '⬆' },
  { key: 'canAnnotate', label: 'Annoter',   icon: '🔬' },
  { key: 'canValidate', label: 'Valider',   icon: '✅' },
  { key: 'canEdit',     label: 'Modifier',  icon: '✏️' },
  { key: 'canDelete',   label: 'Supprimer', icon: '🗑' },
]

const AVATAR_COLORS = ['#1a5cff','#00b87a','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899']
const selectedUserObj    = computed(() => userList.value.find(u => u.id === selectedUserId.value))
const selectedUserName   = computed(() => {
  const u = selectedUserObj.value
  return u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username : ''
})
const selectedUserColor  = computed(() =>
  AVATAR_COLORS[(selectedUserObj.value?.firstName?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]
)
const selectedUserLetter = computed(() =>
  (selectedUserObj.value?.firstName?.[0] || '?').toUpperCase()
)
const hasChanges = computed(() =>
  JSON.stringify(tempPermissions.value) !== JSON.stringify(originalPermissions.value)
)

const userAvatarColor = (u: any) =>
  AVATAR_COLORS[(u?.firstName?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]

// ── Auth headers ───────────────────────────────────────────────────────────
const getHeaders = (): Record<string, string> => {
  for (const key of Object.keys(localStorage)) {
    try {
      const p = JSON.parse(localStorage.getItem(key) || '{}')
      const t = p?.access_token || p?.currentSession?.access_token || p?.session?.access_token
      if (t && typeof t === 'string' && t.length > 20) return { Authorization: `Bearer ${t}` }
    } catch { continue }
  }
  return {}
}

// ── Helpers ────────────────────────────────────────────────────────────────
const formatDateRelative = (d: string) => {
  if (!d) return ''
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (diff < 60)    return "À l'instant"
  if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

const notifIcon = (type?: string) => {
  const icons: Record<string, string> = {
    ACTIVATION: '👤', REJECTION: '🚫', CLASSIFICATION: '🔬', VALIDATION: '✅', BLOOM: '🔴',
  }
  return icons[type || ''] || '🔔'
}

const viewAllNotifications = () => router.push({ name: 'notifications' })

// ── API calls ──────────────────────────────────────────────────────────────
const loadProjects = async () => {
  try {
    const res = await axios.get(`${API_URL}/nest/api/projects`, {
      headers: getHeaders(), params: { take: 50 },
    })
    projectList.value = res.data?.paginatedResult ?? res.data ?? []
  } catch { /* silent */ }
}

const loadUsers = async () => {
  try {
    const res = await axios.get(`${API_URL}/nest/api/users`, { headers: getHeaders() })
    const all = res.data?.paginatedResult ?? res.data ?? []
    userList.value = all.filter((u: any) =>
      (u.status || '').toUpperCase() === 'ACTIF' || !u.status
    )
  } catch { /* silent */ }
}

const loadUserPermissions = async () => {
  if (!selectedProjectId.value || !selectedUserId.value) return
  try {
    const res = await axios.get(
      `${API_URL}/nest/api/project-permission/${selectedProjectId.value}/${selectedUserId.value}`,
      { headers: getHeaders() }
    )
    const perms: Record<PermKey, boolean> = {
      canView:     !!res.data.canView,
      canUpload:   !!res.data.canUpload,
      canAnnotate: !!res.data.canAnnotate,
      canValidate: !!res.data.canValidate,
      canEdit:     !!res.data.canEdit,
      canDelete:   !!res.data.canDelete,
    }
    tempPermissions.value     = { ...perms }
    originalPermissions.value = { ...perms }
  } catch {
    tempPermissions.value     = emptyPerms()
    originalPermissions.value = emptyPerms()
  }
}

const saveQuickPermissions = async () => {
  saving.value = true
  try {
    await axios.post(
      `${API_URL}/nest/api/project-permission/grant`,
      { projectId: selectedProjectId.value, userId: selectedUserId.value, ...tempPermissions.value },
      { headers: getHeaders() }
    )
    originalPermissions.value = { ...tempPermissions.value }
    ElMessage.success('Permissions enregistrées !')
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || 'Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}

const resetQuickPermissions = () => { tempPermissions.value = { ...originalPermissions.value } }
const onProjectSelect = () => {
  selectedUserId.value = ''
  tempPermissions.value     = emptyPerms()
  originalPermissions.value = emptyPerms()
}
const onUserSelect = () => {
  if (selectedProjectId.value && selectedUserId.value) loadUserPermissions()
}

watch([selectedProjectId, selectedUserId], ([p, u]) => {
  if (p && u) loadUserPermissions()
})

const loadDashboardData = async () => {
  const h = getHeaders()

  // Notifications
  loadingNotifs.value = true
  try {
    const res = await axios.get(`${API_URL}/nest/api/notification/me`, { headers: h })
    recentNotifs.value = (res.data ?? []).slice(0, 8)
  } catch { /* silent */ }
  finally { loadingNotifs.value = false }

  // Données admin
  if (isAdmin.value) {
    loadingPending.value = true
    try {
      const res = await axios.get(`${API_URL}/nest/api/users`, {
        headers: h, params: { 'where[status]': 'EN_ATTENTE', take: 10 },
      })
      pendingUsers.value = res.data?.paginatedResult ?? []
    } catch { /* silent */ }
    finally { loadingPending.value = false }

    await Promise.all([loadProjects(), loadUsers()])
  }
}

onMounted(async () => {
  await loadDashboardData()
  startPolling(30000)
})
</script>

<style scoped lang="scss">
.phyto-dashboard {
  --ink:      #0b1120;
  --ink-60:   rgba(11,17,32,.6);
  --ink-30:   rgba(11,17,32,.3);
  --surface:  #f0f2f8;
  --card:     #ffffff;
  --ocean:    #1a5cff;
  --ocean-lt: #e8efff;
  --teal:     #00c9b1;
  --emerald:  #00b87a;
  --ruby:     #ff3952;
  --amber:    #ffaa00;
  --border:   rgba(11,17,32,.07);
  --radius:   18px;
  --radius-sm: 12px;
  --sh:       0 1px 3px rgba(11,17,32,.04), 0 4px 16px rgba(11,17,32,.04);
  --sh-hover: 0 4px 16px rgba(11,17,32,.08), 0 16px 40px rgba(11,17,32,.07);

  padding: 20px 24px;
  background: var(--surface);
  min-height: 100vh;
  font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
}

/* ── Hero ── */
.dash-hero {
  position: relative; overflow: hidden;
  background: linear-gradient(130deg, #060e23 0%, #0f2043 40%, #1a3b80 75%, #1a5cff 100%);
  border-radius: 22px; padding: 32px 36px; margin-bottom: 16px;
  display: flex; justify-content: space-between; align-items: center;
  gap: 20px; flex-wrap: wrap;

  &__left { position: relative; z-index: 2; }
  &__right { display: flex; align-items: center; gap: 10px; position: relative; z-index: 2; flex-wrap: wrap; justify-content: flex-end; }
  &__title { font-size: 26px; font-weight: 800; color: white; margin: 8px 0 6px; letter-spacing: -.03em; line-height: 1.2; }
  &__sub   { font-size: 13px; color: rgba(255,255,255,.5); margin: 0; }
}

.hero-bg-orb {
  position: absolute; border-radius: 50%; pointer-events: none; z-index: 1;
  &--1 { width: 300px; height: 300px; top: -100px; right: -60px; background: radial-gradient(circle, rgba(0,201,177,.18) 0%, transparent 70%); }
  &--2 { width: 200px; height: 200px; bottom: -80px; left: 20%; background: radial-gradient(circle, rgba(26,92,255,.25) 0%, transparent 70%); }
}

.hero-badge {
  display: inline-flex; align-items: center; gap: 7px;
  background: rgba(0,201,177,.18); border: 1px solid rgba(0,201,177,.3);
  border-radius: 20px; padding: 4px 12px;
  font-size: 11px; font-weight: 700; color: var(--teal);
  letter-spacing: .05em; text-transform: uppercase;
  &__dot {
    width: 6px; height: 6px; border-radius: 50%; background: var(--teal);
    box-shadow: 0 0 8px var(--teal); animation: live-pulse 2s ease-in-out infinite;
  }
}
@keyframes live-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .5; transform: scale(.8); } }

.name-wave { color: var(--teal); }

.hero-info-chip {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.12);
  border-radius: 20px; padding: 7px 14px; font-size: 12px; color: rgba(255,255,255,.75);
}

.role-badge {
  padding: 7px 16px; border-radius: 20px; font-size: 12px; font-weight: 700;
  border: 1px solid rgba(255,255,255,.15);
  &--admin  { background: rgba(255,170,0,.2);  color: var(--amber); }
  &--expert { background: rgba(0,201,177,.15); color: var(--teal); }
  &--user   { background: rgba(255,255,255,.1); color: rgba(255,255,255,.75); }
}

/* ── Bloom Alerts ── */
.alerts-zone { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }

.bloom-alert-card {
  position: relative; overflow: hidden; border-radius: 14px; border-left: 4px solid;
  box-shadow: 0 4px 20px rgba(0,0,0,.1);

  &--critical { border-color: #ef4444; background: linear-gradient(135deg, #fff5f5, #fef2f2); }
  &--high     { border-color: #f59e0b; background: linear-gradient(135deg, #fffbeb, #fef3c7); }

  &__pulse   { position: absolute; inset: 0; animation: alert-pulse 3s ease-in-out infinite; pointer-events: none; }
  &__content { display: flex; align-items: center; gap: 14px; padding: 14px 18px; position: relative; z-index: 1; flex-wrap: wrap; }
  &__icon    { font-size: 28px; flex-shrink: 0; }
  &__body    { flex: 1; min-width: 160px; }
  &__title   { font-size: 13px; font-weight: 800; color: #1f2937; display: flex; align-items: center; gap: 8px; margin-bottom: 2px; }
  &__project { font-size: 12px; font-weight: 600; color: #4b5563; margin-bottom: 2px; }
  &__detail  { font-size: 11px; color: #6b7280; }
  &__meter   { flex: 1; min-width: 120px; }
  &__close   {
    background: none; border: none; cursor: pointer; font-size: 14px;
    color: #9ca3af; padding: 4px 8px; border-radius: 6px; flex-shrink: 0;
    transition: all .15s; &:hover { background: rgba(0,0,0,.06); color: #4b5563; }
  }
}

.bloom-pct {
  font-size: 16px; font-weight: 900; letter-spacing: -.02em;
  .bloom-alert-card--critical & { color: #ef4444; }
  .bloom-alert-card--high &     { color: #f59e0b; }
}

.bloom-meter {
  height: 6px; background: rgba(0,0,0,.08); border-radius: 3px; overflow: hidden;
  &__fill { height: 100%; border-radius: 3px; transition: width .6s ease;
    &.fill--critical { background: linear-gradient(90deg, #ef4444, #f87171); }
    &.fill--high     { background: linear-gradient(90deg, #f59e0b, #fcd34d); }
  }
}

@keyframes alert-pulse { 0%, 100% { opacity: .8; } 50% { opacity: .3; } }

.alert-slide-enter-active { transition: all .35s cubic-bezier(.34,1.56,.64,1); }
.alert-slide-leave-active  { transition: all .2s ease-in; }
.alert-slide-enter-from    { opacity: 0; transform: translateY(-12px) scale(.97); }
.alert-slide-leave-to      { opacity: 0; transform: translateX(20px); }

/* ── Grid ── */
.dash-grid {
  display: grid; grid-template-columns: 1fr 340px; gap: 16px; align-items: start;
  @media (max-width: 1100px) { grid-template-columns: 1fr; }
}
.dash-col { display: flex; flex-direction: column; gap: 16px; }

/* ── Side Cards ── */
.side-card {
  background: var(--card); border-radius: var(--radius);
  border: 0.5px solid var(--border); box-shadow: var(--sh);
  padding: 18px 20px; transition: box-shadow .2s;
  &:hover { box-shadow: var(--sh-hover); }
  &--perms   { border-top: 3px solid var(--ocean); }
  &--notifs  { border-top: 3px solid var(--amber); }
  &--pending { border-top: 3px solid var(--ruby); }

  &__header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; gap: 10px; }
  &__title  { display: flex; align-items: center; gap: 10px; }
  &__icon-wrap {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;
    &--ocean { background: var(--ocean-lt); }
    &--amber { background: rgba(255,170,0,.12); }
    &--ruby  { background: rgba(255,57,82,.08); }
  }
  &__name { font-size: 13px; font-weight: 700; color: var(--ink); display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }
  &__sub  { font-size: 11px; color: var(--ink-30); }
}

.link-chip {
  background: var(--surface); border: 0.5px solid var(--border); border-radius: 20px;
  padding: 4px 10px; font-size: 11px; font-weight: 600; color: var(--ocean);
  cursor: pointer; transition: all .15s; white-space: nowrap;
  &:hover { background: var(--ocean-lt); border-color: var(--ocean); }
  &--urgent { color: var(--ruby); border-color: rgba(255,57,82,.2); background: rgba(255,57,82,.05); &:hover { background: rgba(255,57,82,.1); } }
}

/* ── Permissions ── */
.perm-selects { display: flex; flex-direction: column; gap: 10px; margin-bottom: 4px; }
.labeled-select { display: flex; flex-direction: column; gap: 4px;
  label { font-size: 11px; font-weight: 600; color: var(--ink-60); text-transform: uppercase; letter-spacing: .05em; }
}
.w-full { width: 100% !important; }

.quick-perms {
  margin-top: 14px; padding-top: 14px; border-top: 0.5px solid var(--border);
  &__label { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600; color: var(--ink); margin-bottom: 10px; }
  &__avatar { width: 24px; height: 24px; border-radius: 50%; color: white; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
}

.perm-toggles { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 12px; }

.perm-toggle-mini {
  display: flex; align-items: center; gap: 6px; padding: 7px 8px; border-radius: 8px;
  cursor: pointer; transition: all .15s; border: 1px solid rgba(11,17,32,.12); background: #ffffff;
  input { display: none; }
  &__icon  { font-size: 14px; flex-shrink: 0; }
  &__label { font-size: 10px; font-weight: 700; color: #1f2937; flex: 1; }
  &__check { font-size: 10px; color: #ffffff; font-weight: 700; background: var(--ocean); border-radius: 50%; width: 15px; height: 15px; display: inline-flex; align-items: center; justify-content: center; }
  &:hover { border-color: rgba(26,92,255,.3); background: var(--ocean-lt); }
  &--on { border-color: var(--ocean); background: #e8efff; box-shadow: inset 0 0 0 1px rgba(26,92,255,.2); .perm-toggle-mini__label { color: #1246d6; } }
}

.perm-actions { display: flex; gap: 6px; }

.perm-hint {
  margin-top: 14px; padding: 14px; display: flex; align-items: center; justify-content: center; gap: 6px;
  background: var(--surface); border-radius: 10px; border: 0.5px dashed var(--border);
  font-size: 12px; color: var(--ink-30);
}

/* ── Boutons ── */
.btn {
  display: inline-flex; align-items: center; gap: 5px; border-radius: 7px; border: none;
  font-size: 11px; font-weight: 700; cursor: pointer; transition: all .15s;
  white-space: nowrap; font-family: inherit;
  &:disabled { opacity: .35; cursor: not-allowed; }
  &--xs      { padding: 5px 11px; }
  &--primary { background: var(--ocean); color: white; &:hover:not(:disabled) { background: #1246d6; } }
  &--ghost   { background: #ffffff; color: #1f2937; border: 1px solid rgba(11,17,32,.14); &:hover:not(:disabled) { border-color: var(--ocean); color: var(--ocean); background: #eef4ff; } }
}

.unread-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; border-radius: 9px;
  background: var(--ruby); color: white; font-size: 10px; font-weight: 700; padding: 0 4px;
}
.pending-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; border-radius: 9px;
  background: var(--amber); color: white; font-size: 10px; font-weight: 700; padding: 0 4px;
}

/* ── Notifications ── */
.notif-feed { display: flex; flex-direction: column; gap: 2px; }
.notif-item {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 9px 10px; border-radius: 10px; transition: background .15s; position: relative;
  &:hover { background: var(--surface); }
  &--unread { background: linear-gradient(135deg, #f0f5ff, #eef3ff); border-left: 2px solid var(--ocean); padding-left: 8px; }
  &__bullet {
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;
    background: rgba(11,17,32,.04);
    &.bullet--bloom          { background: rgba(239,68,68,.1); }
    &.bullet--activation     { background: rgba(0,184,122,.1); }
    &.bullet--validation     { background: rgba(26,92,255,.08); }
    &.bullet--classification { background: rgba(139,92,246,.1); }
  }
  &__body { flex: 1; min-width: 0; }
  &__msg  { font-size: 12px; font-weight: 500; color: var(--ink); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &__time { font-size: 10px; color: var(--ink-30); margin-top: 2px; }
}
.unread-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ocean); flex-shrink: 0; margin-top: 5px; }

/* ── Pending ── */
.pending-feed { display: flex; flex-direction: column; gap: 6px; }
.pending-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 10px;
  border-radius: 10px; background: rgba(255,57,82,.03); border: 0.5px solid rgba(255,57,82,.08);
  transition: all .15s; &:hover { background: rgba(255,57,82,.06); }
}
.pending-avatar { width: 32px; height: 32px; border-radius: 50%; color: white; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pending-info  { flex: 1; min-width: 0; }
.pending-name  { font-size: 12px; font-weight: 600; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pending-email { font-size: 10px; color: var(--ink-30); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pending-role  { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px; background: rgba(255,57,82,.08); color: var(--ruby); flex-shrink: 0; }

/* ── Empty / Loader ── */
.empty-mini { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 20px; font-size: 12px; color: var(--ink-30); background: var(--surface); border-radius: 10px; }
.loader-row { display: flex; justify-content: center; padding: 20px; }
.dots-loader {
  display: flex; gap: 5px;
  span { width: 7px; height: 7px; border-radius: 50%; background: var(--ocean); animation: dot-bounce .8s ease-in-out infinite; &:nth-child(2) { animation-delay: .15s; } &:nth-child(3) { animation-delay: .3s; } }
}
@keyframes dot-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

.slide-down-enter-active { transition: all .25s ease-out; }
.slide-down-leave-active  { transition: all .15s ease-in; }
.slide-down-enter-from    { opacity: 0; transform: translateY(-8px); }
.slide-down-leave-to      { opacity: 0; transform: translateY(-4px); }

@media (max-width: 768px) {
  .phyto-dashboard { padding: 12px 14px; }
  .dash-hero { flex-direction: column; padding: 24px 20px; }
  .dash-hero__right { width: 100%; }
  .perm-toggles { grid-template-columns: 1fr; }
}
</style>