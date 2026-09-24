<template>
  <div class="perms-page">

    <!-- ══ HEADER ══ -->
    <button class="back-btn" @click="$router.back()">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Retour
    </button>

    <div class="page-header">
      <div class="page-header__left">
        <div class="project-badge">
          <span>🔑</span>
          <span class="project-badge__label">Permissions</span>
        </div>
        <h1 class="page-title">{{ projectTitle || 'Chargement…' }}</h1>
        <p class="page-sub" v-if="isAdmin">Gérez les droits d'accès par utilisateur</p>
        <p class="page-sub" v-else>Vos permissions sur ce projet</p>
      </div>

      <div class="page-header__right" v-if="isAdmin">
        <div class="stats-row">
          <div class="stat-pill">
            <span class="stat-pill__num">{{ totalUsers }}</span>
            <span class="stat-pill__lbl">utilisateurs</span>
          </div>
          <div class="stat-pill stat-pill--access">
            <span class="stat-pill__num">{{ usersWithAccess }}</span>
            <span class="stat-pill__lbl">avec accès</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ VUE NON-ADMIN : mes permissions ══ -->
    <div v-if="!isAdmin && !isLoading" class="my-perms-view">
      <div class="my-perms-card">
        <div class="my-perms-header">
          <div class="my-avatar" :style="{ background: avatarColor(currentUser) }">
            {{ avatarLetter(currentUser) }}
          </div>
          <div>
            <div class="my-perms-name">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</div>
            <div class="my-perms-role">{{ currentUser?.userRole || 'Utilisateur' }}</div>
          </div>
        </div>

        <div class="my-perms-grid">
          <div v-for="p in PERMS" :key="p.key" class="my-perm-item">
            <span class="my-perm-icon">{{ p.icon }}</span>
            <div class="my-perm-text">
              <span class="my-perm-name">{{ p.label }}</span>
              <span class="my-perm-desc">{{ p.desc }}</span>
            </div>
            <div class="my-perm-badge" :class="myPerms[p.key] ? 'badge--on' : 'badge--off'">
              {{ myPerms[p.key] ? '✓ Accordé' : '✗ Refusé' }}
            </div>
          </div>
        </div>

        <div class="my-perms-footer">
          <div class="access-level-chip" :class="`level--${myAccessLevel}`">
            <span>{{ myAccessLevelIcon }}</span>
            {{ myAccessLevelLabel }}
          </div>
          <span class="my-perms-note">Permissions définies par l'administrateur</span>
        </div>
      </div>
    </div>

    <!-- ══ TOOLBAR (Admin) ══ -->
    <div v-if="isAdmin" class="toolbar">
      <div class="search-box">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="search-box__icon">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5"/>
          <path d="m9.5 9.5 2.5 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input v-model="searchQuery" class="search-box__input" placeholder="Rechercher un utilisateur…" />
      </div>

      <div class="filter-tabs">
        <button v-for="f in filters" :key="f.key" class="filter-tab"
          :class="{ 'filter-tab--active': activeFilter === f.key }"
          @click="activeFilter = f.key as any">
          {{ f.label }}
          <span class="filter-tab__count">{{ f.count }}</span>
        </button>
      </div>

      <button class="btn btn--primary btn--sm" @click="openGrantAll">
        + Accès groupé
      </button>
    </div>

    <!-- ══ LOADER ══ -->
    <div v-if="isLoading" class="page-loader">
      <div class="loader-dots"><span></span><span></span><span></span></div>
      <p>Chargement des permissions…</p>
    </div>

    <!-- ══ LISTE UTILISATEURS (Admin) ══ -->
    <div v-else-if="isAdmin" class="users-grid">
      <div v-for="user in filteredUsers" :key="user.id" class="user-card"
        :class="{
          'user-card--has-access': hasAnyAccess(user.id),
          'user-card--expanded':   expandedUser === user.id,
        }">

        <div class="user-card__head" @click="toggleExpand(user.id)">
          <div class="user-avatar" :style="{ background: avatarColor(user) }">
            {{ avatarLetter(user) }}
          </div>

          <div class="user-card__info">
            <div class="user-card__name">{{ user.firstName }} {{ user.lastName }}</div>
            <div class="user-card__meta">
              <span class="user-email">{{ user.email || user.username }}</span>
              <span class="role-pill" :class="`role-pill--${(user.userRole || 'user').toLowerCase()}`">
                {{ user.userRole || 'user' }}
              </span>
            </div>
          </div>

          <div class="user-card__access">
            <div class="perm-chips">
              <span v-for="p in PERMS" :key="p.key" class="perm-chip"
                :class="{ 'perm-chip--on': getUserPerm(user.id, p.key), 'perm-chip--off': !getUserPerm(user.id, p.key) }"
                :title="p.label">{{ p.short }}</span>
            </div>
            <svg class="chevron" :class="{ 'chevron--open': expandedUser === user.id }"
              width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <!-- Panel étendu -->
        <transition name="expand">
          <div v-if="expandedUser === user.id" class="user-card__panel">
            <div class="panel-title">Permissions individuelles</div>
            <div class="perm-grid">
              <label v-for="p in PERMS" :key="p.key" class="perm-toggle"
                :class="{ 'perm-toggle--on': getEditPerm(user.id, p.key) }">
                <input type="checkbox"
                  :checked="getEditPerm(user.id, p.key)"
                  :disabled="isSaving(user.id)"
                  @change="onPermChange(user.id, p.key, ($event.target as HTMLInputElement).checked)" />
                <span class="perm-toggle__ico">{{ p.icon }}</span>
                <div class="perm-toggle__text">
                  <span class="perm-toggle__name">{{ p.label }}</span>
                  <span class="perm-toggle__desc">{{ p.desc }}</span>
                </div>
                <span class="perm-toggle__check">
                  <svg v-if="getEditPerm(user.id, p.key)" width="10" height="10" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </label>
            </div>

            <div class="presets">
              <span class="presets__label">Accès rapide :</span>
              <button v-for="p in PRESETS" :key="p.key" class="preset-btn"
                @click="applyPreset(user.id, p.key)">
                {{ p.icon }} {{ p.label }}
              </button>
            </div>

            <div class="panel-actions">
              <button class="btn btn--primary btn--sm"
                :disabled="!hasPendingChanges(user.id) || isSaving(user.id)"
                @click="saveUserPermissions(user.id)">
                <span v-if="isSaving(user.id)" class="spinner spinner--sm"></span>
                <span v-else>✓ Enregistrer</span>
              </button>
              <button class="btn btn--ghost btn--sm"
                :disabled="!hasPendingChanges(user.id)"
                @click="cancelChanges(user.id)">Annuler</button>
              <button class="btn btn--danger btn--sm" @click="revokeAll(user.id)">
                Révoquer tout
              </button>
            </div>
          </div>
        </transition>
      </div>

      <div v-if="filteredUsers.length === 0 && !isLoading" class="empty-state">
        <div class="empty-state__icon">👥</div>
        <h3>Aucun utilisateur trouvé</h3>
        <p>{{ searchQuery ? 'Essayez un autre terme.' : 'Aucun utilisateur actif.' }}</p>
      </div>
    </div>

    <!-- ══ MODAL ACCÈS GROUPÉ ══ -->
    <!-- FIX : pas de position:fixed, utilise une overlay en flow normal avec min-height -->
    <div v-if="showGrantAll" class="modal-overlay">
      <div class="modal" @click.stop>
        <div class="modal__header">
          <h3>Accès groupé</h3>
          <button class="modal__close" @click="showGrantAll = false">✕</button>
        </div>
        <p class="modal__sub">Appliquer les mêmes permissions à plusieurs utilisateurs.</p>

        <div class="modal__section">
          <div class="modal__label">Sélectionner les utilisateurs</div>
          <div class="modal__user-list">
            <label v-for="u in allUsers" :key="u.id" class="modal-user-row"
              :class="{ 'modal-user-row--selected': batchSelectedUsers.includes(u.id) }">
              <input type="checkbox" v-model="batchSelectedUsers" :value="u.id" />
              <div class="modal-avatar" :style="{ background: avatarColor(u) }">{{ avatarLetter(u) }}</div>
              <div>
                <div class="modal-user-name">{{ u.firstName }} {{ u.lastName }}</div>
                <div class="modal-user-email">{{ u.email || u.username }}</div>
              </div>
            </label>
          </div>
        </div>

        <div class="modal__section">
          <div class="modal__label">Choisir un profil</div>
          <div class="preset-grid">
            <button v-for="preset in PRESETS" :key="preset.key" class="preset-card"
              :class="{ 'preset-card--selected': batchPreset === preset.key }"
              @click="batchPreset = preset.key">
              <span class="preset-card__icon">{{ preset.icon }}</span>
              <span class="preset-card__name">{{ preset.label }}</span>
              <span class="preset-card__desc">{{ preset.desc }}</span>
            </button>
          </div>
        </div>

        <div class="modal__footer">
          <button class="btn btn--ghost" @click="showGrantAll = false">Annuler</button>
          <button class="btn btn--primary"
            :disabled="batchSelectedUsers.length === 0 || !batchPreset || batchSaving"
            @click="applyBatchPermissions">
            <span v-if="batchSaving" class="spinner spinner--sm"></span>
            Appliquer à {{ batchSelectedUsers.length }} utilisateur(s)
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/store/useAuth'
import { useRole } from '@/composables/useRole'
import { storeToRefs } from 'pinia'
import axios from 'axios'

const API_URL    = import.meta.env.VITE_API_URL
const route      = useRoute()
const router     = useRouter()
const projectId  = computed(() => route.params.id as string)

const authStore = useAuthStore()
const { currentUser } = storeToRefs(authStore)
const { isAdmin }     = useRole()

// ── Définition des permissions ─────────────────────────────────────────────
const PERMS = [
  { key: 'canView',     label: 'Voir',      short: 'V',  icon: '👁',  desc: 'Consulter le projet et ses images' },
  { key: 'canUpload',   label: 'Uploader',  short: 'U',  icon: '⬆',  desc: 'Ajouter des images au projet' },
  { key: 'canAnnotate', label: 'Annoter',   short: 'A',  icon: '🔬', desc: 'Lancer l\'analyse IA' },
  { key: 'canValidate', label: 'Valider',   short: 'Va', icon: '✅', desc: 'Valider et corriger les annotations' },
  { key: 'canEdit',     label: 'Modifier',  short: 'M',  icon: '✏️', desc: 'Modifier les infos du projet' },
  { key: 'canDelete',   label: 'Supprimer', short: 'S',  icon: '🗑', desc: 'Supprimer le projet' },
] as const

type PermKey = typeof PERMS[number]['key']

const PRESETS = [
  { key: 'none',    icon: '❌', label: 'Aucun',    desc: 'Toutes permissions désactivées' },
  { key: 'reader',  icon: '👁', label: 'Lecteur',  desc: 'Voir uniquement' },
  { key: 'analyst', icon: '🔬', label: 'Analyste', desc: 'Voir, uploader et annoter' },
  { key: 'expert',  icon: '✅', label: 'Expert',   desc: 'Voir, annoter et valider' },
  { key: 'full',    icon: '👑', label: 'Complet',  desc: 'Tous les droits' },
]

const PRESET_PERMS: Record<string, Record<PermKey, boolean>> = {
  none:    { canView: false, canUpload: false, canAnnotate: false, canValidate: false, canEdit: false, canDelete: false },
  reader:  { canView: true,  canUpload: false, canAnnotate: false, canValidate: false, canEdit: false, canDelete: false },
  analyst: { canView: true,  canUpload: true,  canAnnotate: true,  canValidate: false, canEdit: false, canDelete: false },
  expert:  { canView: true,  canUpload: true,  canAnnotate: true,  canValidate: true,  canEdit: false, canDelete: false },
  full:    { canView: true,  canUpload: true,  canAnnotate: true,  canValidate: true,  canEdit: true,  canDelete: true  },
}

// ── État ───────────────────────────────────────────────────────────────────
const projectTitle   = ref('')
const allUsers       = ref<any[]>([])
const isLoading      = ref(true)
const searchQuery    = ref('')
const activeFilter   = ref<'all' | 'access' | 'noaccess'>('all')
const expandedUser   = ref<string | null>(null)

const savedPerms     = reactive<Record<string, Record<PermKey, boolean>>>({})
const editPerms      = reactive<Record<string, Record<PermKey, boolean>>>({})
const savingUsers    = ref<Set<string>>(new Set())

const myPerms = ref<Record<PermKey, boolean>>({
  canView: false, canUpload: false, canAnnotate: false,
  canValidate: false, canEdit: false, canDelete: false,
})

const showGrantAll       = ref(false)
const batchSelectedUsers = ref<string[]>([])
const batchPreset        = ref('')
const batchSaving        = ref(false)

// ── Niveau d'accès ─────────────────────────────────────────────────────────
const myAccessLevel = computed(() => {
  const p = myPerms.value
  if (p.canDelete && p.canEdit) return 'full'
  if (p.canValidate) return 'expert'
  if (p.canAnnotate) return 'analyst'
  if (p.canView)     return 'reader'
  return 'none'
})
const myAccessLevelLabel = computed(() =>
  ({ full: 'Accès complet', expert: 'Expert', analyst: 'Analyste', reader: 'Lecteur', none: 'Aucun accès' }[myAccessLevel.value] || 'Inconnu')
)
const myAccessLevelIcon = computed(() =>
  ({ full: '👑', expert: '✅', analyst: '🔬', reader: '👁', none: '❌' }[myAccessLevel.value] || '❓')
)

// ── Computed ───────────────────────────────────────────────────────────────
const totalUsers      = computed(() => allUsers.value.length)
const usersWithAccess = computed(() => allUsers.value.filter(u => hasAnyAccess(u.id)).length)

const filters = computed(() => [
  { key: 'all',      label: 'Tous',       count: allUsers.value.length },
  { key: 'access',   label: 'Avec accès', count: usersWithAccess.value },
  { key: 'noaccess', label: 'Sans accès', count: totalUsers.value - usersWithAccess.value },
])

const filteredUsers = computed(() => {
  let list = allUsers.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(u => `${u.firstName} ${u.lastName} ${u.email || u.username}`.toLowerCase().includes(q))
  }
  if (activeFilter.value === 'access')   list = list.filter(u => hasAnyAccess(u.id))
  if (activeFilter.value === 'noaccess') list = list.filter(u => !hasAnyAccess(u.id))
  return list
})

// ── Helpers permissions ────────────────────────────────────────────────────
const emptyPerms   = (): Record<PermKey, boolean> =>
  ({ canView: false, canUpload: false, canAnnotate: false, canValidate: false, canEdit: false, canDelete: false })

const getUserPerm        = (uid: string, key: PermKey) => savedPerms[uid]?.[key] ?? false
const getEditPerm        = (uid: string, key: PermKey) => editPerms[uid]?.[key] ?? false
const hasAnyAccess       = (uid: string) => Object.values(savedPerms[uid] ?? {}).some(Boolean)
const isSaving           = (uid: string) => savingUsers.value.has(uid)
const hasPendingChanges  = (uid: string) => JSON.stringify(editPerms[uid]) !== JSON.stringify(savedPerms[uid])

const onPermChange   = (uid: string, key: PermKey, val: boolean) => {
  if (!editPerms[uid]) editPerms[uid] = { ...emptyPerms() }
  editPerms[uid][key] = val
}
const applyPreset    = (uid: string, presetKey: string) => { editPerms[uid] = { ...PRESET_PERMS[presetKey] } }
const cancelChanges  = (uid: string) => { editPerms[uid] = { ...(savedPerms[uid] ?? emptyPerms()) } }
const toggleExpand   = (uid: string) => {
  if (expandedUser.value === uid) { expandedUser.value = null; return }
  expandedUser.value = uid
  if (!editPerms[uid]) editPerms[uid] = { ...(savedPerms[uid] ?? emptyPerms()) }
}

// ── Avatars ────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#1a5cff','#00b87a','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899']
const avatarColor  = (u: any) => AVATAR_COLORS[(u?.firstName?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]
const avatarLetter = (u: any) => (u?.firstName?.[0] || u?.username?.[0] || '?').toUpperCase()

// ── Auth headers ───────────────────────────────────────────────────────────
const getHeaders = (): Record<string, string> => {
  for (const key of Object.keys(localStorage)) {
    try {
      const p = JSON.parse(localStorage.getItem(key) || '{}')
      const t = p?.access_token || p?.currentSession?.access_token
      if (t && typeof t === 'string' && t.length > 20) return { Authorization: `Bearer ${t}` }
    } catch { continue }
  }
  return {}
}

// ── API ────────────────────────────────────────────────────────────────────
const loadData = async () => {
  isLoading.value = true
  try {
    const projRes = await axios.get(
      `${API_URL}/nest/api/projects/${projectId.value}`,
      { headers: getHeaders() }
    )
    projectTitle.value = projRes.data?.title || 'Projet'

    if (isAdmin.value) {
      const usersRes = await axios.get(`${API_URL}/nest/api/users`, {
        headers: getHeaders(), params: { take: 200 },
      })
      // FIX : filtre utilisateurs actifs
      const users = (usersRes.data?.paginatedResult ?? usersRes.data ?? [])
        .filter((u: any) => (u.status || '').toUpperCase() !== 'EN_ATTENTE')
      allUsers.value = users
      await Promise.all(users.map((u: any) => loadUserPerms(u.id)))
    } else {
      await loadMyPerms()
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('Erreur lors du chargement des permissions')
  } finally {
    isLoading.value = false
  }
}

const loadMyPerms = async () => {
  const uid = currentUser.value?.id
  if (!uid) return
  try {
    const res = await axios.get(
      `${API_URL}/nest/api/project-permission/${projectId.value}/${uid}`,
      { headers: getHeaders() }
    )
    myPerms.value = {
      canView: !!res.data.canView, canUpload: !!res.data.canUpload,
      canAnnotate: !!res.data.canAnnotate, canValidate: !!res.data.canValidate,
      canEdit: !!res.data.canEdit, canDelete: !!res.data.canDelete,
    }
  } catch { myPerms.value = emptyPerms() }
}

const loadUserPerms = async (uid: string) => {
  try {
    const res = await axios.get(
      `${API_URL}/nest/api/project-permission/${projectId.value}/${uid}`,
      { headers: getHeaders() }
    )
    const perms: Record<PermKey, boolean> = {
      canView: !!res.data.canView, canUpload: !!res.data.canUpload,
      canAnnotate: !!res.data.canAnnotate, canValidate: !!res.data.canValidate,
      canEdit: !!res.data.canEdit, canDelete: !!res.data.canDelete,
    }
    savedPerms[uid] = perms
    editPerms[uid]  = { ...perms }
  } catch {
    savedPerms[uid] = emptyPerms()
    editPerms[uid]  = emptyPerms()
  }
}

const saveUserPermissions = async (uid: string) => {
  savingUsers.value = new Set([...savingUsers.value, uid])
  try {
    await axios.post(`${API_URL}/nest/api/project-permission/grant`, {
      projectId: projectId.value, userId: uid, ...editPerms[uid],
    }, { headers: getHeaders() })
    savedPerms[uid] = { ...editPerms[uid] }
    ElMessage.success('Permissions enregistrées !')
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || 'Erreur lors de la sauvegarde')
  } finally {
    savingUsers.value = new Set([...savingUsers.value].filter(id => id !== uid))
  }
}

const revokeAll = async (uid: string) => {
  try {
    await ElMessageBox.confirm(
      'Révoquer TOUTES les permissions de cet utilisateur ?',
      'Confirmation',
      { confirmButtonText: 'Révoquer', cancelButtonText: 'Annuler', type: 'warning' }
    )
    applyPreset(uid, 'none')
    await saveUserPermissions(uid)
  } catch { /* cancelled */ }
}

const openGrantAll = () => {
  batchSelectedUsers.value = []
  batchPreset.value = ''
  showGrantAll.value = true
}

const applyBatchPermissions = async () => {
  if (!batchPreset.value || batchSelectedUsers.value.length === 0) return
  batchSaving.value = true
  try {
    await Promise.all(
      batchSelectedUsers.value.map(uid =>
        axios.post(`${API_URL}/nest/api/project-permission/grant`, {
          projectId: projectId.value, userId: uid, ...PRESET_PERMS[batchPreset.value],
        }, { headers: getHeaders() })
      )
    )
    batchSelectedUsers.value.forEach(uid => {
      savedPerms[uid] = { ...PRESET_PERMS[batchPreset.value] }
      editPerms[uid]  = { ...PRESET_PERMS[batchPreset.value] }
    })
    ElMessage.success(`Permissions appliquées à ${batchSelectedUsers.value.length} utilisateur(s)`)
    showGrantAll.value = false
  } catch {
    ElMessage.error('Erreur lors de l\'application groupée')
  } finally {
    batchSaving.value = false
  }
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.perms-page {
  --ink:      #0b1120;
  --ink-60:   rgba(11,17,32,.6);
  --ink-30:   rgba(11,17,32,.3);
  --surface:  #f4f6fb;
  --card:     #ffffff;
  --ocean:    #1a5cff;
  --ocean-lt: #e8efff;
  --teal:     #00b87a;
  --ruby:     #ff3952;
  --amber:    #f59e0b;
  --border:   rgba(11,17,32,.08);
  --radius:   14px;

  padding: 24px 28px;
  background: var(--surface);
  min-height: 100vh;
  font-family: 'DM Sans', 'Segoe UI', system-ui, sans-serif;
}

.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--card); border: 0.5px solid var(--border);
  border-radius: 8px; padding: 6px 12px;
  font-size: 12px; font-weight: 600; color: var(--ink-60);
  cursor: pointer; transition: all .15s; margin-bottom: 16px;
  &:hover { color: var(--ocean); border-color: var(--ocean); }
}

.page-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
  &__left  { flex: 1; }
  &__right { flex-shrink: 0; }
}

.project-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--ocean-lt); border-radius: 6px; padding: 3px 10px; margin-bottom: 8px;
  &__label { font-size: 11px; font-weight: 700; color: var(--ocean); text-transform: uppercase; letter-spacing: .06em; }
}

.page-title { font-size: 22px; font-weight: 800; color: var(--ink); margin: 0 0 4px; letter-spacing: -.02em; }
.page-sub   { font-size: 13px; color: var(--ink-60); margin: 0; }

.stats-row { display: flex; gap: 8px; }
.stat-pill {
  background: var(--card); border: 0.5px solid var(--border); border-radius: 10px; padding: 8px 14px; text-align: center;
  &__num { display: block; font-size: 18px; font-weight: 800; color: var(--ink); }
  &__lbl { display: block; font-size: 10px; color: var(--ink-60); font-weight: 600; text-transform: uppercase; letter-spacing: .05em; margin-top: 1px; }
  &--access { border-color: rgba(0,184,122,.3); .stat-pill__num { color: var(--teal); } }
}

/* ── Mes permissions (non-admin) ── */
.my-perms-view { margin-bottom: 24px; }
.my-perms-card {
  background: var(--card); border-radius: 20px; border: 0.5px solid var(--border);
  box-shadow: 0 2px 8px rgba(11,17,32,.06); overflow: hidden;
}
.my-perms-header { display: flex; align-items: center; gap: 14px; padding: 24px 24px 0; margin-bottom: 20px; }
.my-avatar { width: 48px; height: 48px; border-radius: 50%; color: white; font-size: 18px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.my-perms-name { font-size: 18px; font-weight: 700; color: var(--ink); margin-bottom: 3px; }
.my-perms-role { font-size: 12px; color: var(--ink-60); }

.my-perms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); @media (max-width: 600px) { grid-template-columns: 1fr; } }
.my-perm-item { display: flex; align-items: center; gap: 12px; padding: 16px 24px; background: var(--card); transition: background .15s; &:hover { background: #fafbff; } }
.my-perm-icon { font-size: 20px; flex-shrink: 0; }
.my-perm-text { flex: 1; }
.my-perm-name { display: block; font-size: 13px; font-weight: 700; color: var(--ink); }
.my-perm-desc { display: block; font-size: 11px; color: var(--ink-60); margin-top: 1px; }
.my-perm-badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; flex-shrink: 0;
  &--on  { background: rgba(0,184,122,.12); color: var(--teal); }
  &--off { background: rgba(11,17,32,.06);  color: var(--ink-30); }
}
.my-perms-footer { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-top: 0.5px solid var(--border); flex-wrap: wrap; gap: 10px; background: #fafbff; }
.my-perms-note { font-size: 11px; color: var(--ink-30); }

.access-level-chip {
  display: inline-flex; align-items: center; gap: 7px; padding: 7px 16px; border-radius: 20px; font-size: 13px; font-weight: 700;
  &.level--full    { background: rgba(26,92,255,.1);  color: var(--ocean); border: 1px solid rgba(26,92,255,.2); }
  &.level--expert  { background: rgba(0,184,122,.1);  color: var(--teal);  border: 1px solid rgba(0,184,122,.2); }
  &.level--analyst { background: rgba(245,158,11,.1); color: var(--amber); border: 1px solid rgba(245,158,11,.2); }
  &.level--reader  { background: rgba(11,17,32,.05);  color: var(--ink-60); border: 1px solid var(--border); }
  &.level--none    { background: rgba(255,57,82,.07); color: var(--ruby);  border: 1px solid rgba(255,57,82,.15); }
}

/* ── Toolbar ── */
.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.search-box {
  display: flex; align-items: center; gap: 8px; background: var(--card); border: 0.5px solid var(--border); border-radius: 10px; padding: 0 12px; flex: 1; min-width: 200px;
  &__icon  { color: var(--ink-30); flex-shrink: 0; }
  &__input { border: none; outline: none; background: transparent; font-size: 13px; color: var(--ink); padding: 9px 0; width: 100%; font-family: inherit; &::placeholder { color: var(--ink-30); } }
}
.filter-tabs { display: flex; gap: 4px; }
.filter-tab {
  display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 8px; border: 0.5px solid var(--border); font-size: 12px; font-weight: 600; color: var(--ink-60); background: var(--card); cursor: pointer; transition: all .15s;
  &:hover { border-color: var(--ocean); color: var(--ocean); }
  &--active { background: var(--ocean-lt); border-color: var(--ocean); color: var(--ocean); }
  &__count { background: rgba(11,17,32,.07); border-radius: 4px; padding: 1px 5px; font-size: 10px; font-weight: 700; }
}

/* ── Boutons ── */
.btn {
  display: inline-flex; align-items: center; gap: 6px; border-radius: 8px; border: none; font-size: 12px; font-weight: 700; cursor: pointer; transition: all .15s; white-space: nowrap; font-family: inherit;
  &:disabled { opacity: .35; cursor: not-allowed; }
  &--sm      { padding: 7px 14px; }
  &--primary { background: var(--ocean); color: white; &:hover:not(:disabled) { background: #1246d6; } }
  &--ghost   { background: var(--card); color: var(--ink); border: 0.5px solid var(--border); &:hover:not(:disabled) { border-color: var(--ocean); color: var(--ocean); } }
  &--danger  { background: rgba(255,57,82,.1); color: var(--ruby); border: 0.5px solid rgba(255,57,82,.2); &:hover:not(:disabled) { background: rgba(255,57,82,.2); } }
}

/* ── Grille utilisateurs ── */
.users-grid { display: flex; flex-direction: column; gap: 8px; }
.user-card {
  background: var(--card); border-radius: var(--radius); border: 0.5px solid var(--border); overflow: hidden; transition: box-shadow .2s, border-color .2s;
  &--has-access { border-left: 3px solid var(--teal); }
  &:hover { box-shadow: 0 2px 12px rgba(11,17,32,.07); }
  &__head { display: flex; align-items: center; gap: 14px; padding: 14px 18px; cursor: pointer; transition: background .15s; &:hover { background: rgba(11,17,32,.02); } }
  &__info { flex: 1; min-width: 0; }
  &__name { font-size: 14px; font-weight: 700; color: var(--ink); margin-bottom: 3px; }
  &__meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  &__access { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  &__panel { padding: 0 18px 18px; border-top: 0.5px solid var(--border); }
}

.user-avatar { width: 38px; height: 38px; border-radius: 50%; color: white; font-size: 14px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.user-email { font-size: 12px; color: var(--ink-60); }

.role-pill { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 20px;
  &--admin, &--biologiste, &--expert { background: rgba(0,184,122,.12); color: #059669; }
  &--technicien { background: var(--ocean-lt); color: var(--ocean); }
  &--user       { background: rgba(11,17,32,.06); color: var(--ink-60); }
}

.perm-chips { display: flex; gap: 3px; }
.perm-chip { width: 22px; height: 22px; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; transition: all .15s;
  &--on  { background: var(--ocean); color: white; }
  &--off { background: rgba(11,17,32,.05); color: var(--ink-30); }
}

.chevron { color: var(--ink-30); transition: transform .2s; &--open { transform: rotate(180deg); } }

.panel-title { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-30); margin: 14px 0 10px; }
.perm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 14px; @media (max-width: 600px) { grid-template-columns: 1fr; } }

.perm-toggle {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; cursor: pointer; border: 1px solid rgba(11,17,32,.12); background: #ffffff; transition: all .15s;
  input { display: none; }
  &__ico   { font-size: 16px; flex-shrink: 0; }
  &__text  { flex: 1; min-width: 0; }
  &__name  { display: block; font-size: 12px; font-weight: 700; color: var(--ink); }
  &__desc  { display: block; font-size: 11px; color: var(--ink-60); margin-top: 1px; }
  &__check { width: 18px; height: 18px; border-radius: 5px; flex-shrink: 0; background: #f1f5f9; display: flex; align-items: center; justify-content: center; border: 1.5px solid rgba(11,17,32,.18); transition: all .15s; color: #ffffff; font-weight: 800; }
  &:hover { border-color: rgba(26,92,255,.3); background: var(--ocean-lt); }
  &--on { border-color: var(--ocean); background: var(--ocean-lt);
    .perm-toggle__check { background: var(--ocean); border-color: var(--ocean); color: #ffffff; }
    .perm-toggle__name  { color: var(--ocean); }
  }
}

.presets { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; &__label { font-size: 11px; font-weight: 600; color: var(--ink-60); } }
.preset-btn { padding: 5px 10px; border-radius: 6px; border: 1px solid rgba(11,17,32,.12); font-size: 11px; font-weight: 700; color: #1f2937; background: #ffffff; cursor: pointer; transition: all .15s; font-family: inherit; &:hover { border-color: var(--ocean); color: var(--ocean); background: var(--ocean-lt); } }

.panel-actions { display: flex; gap: 8px; flex-wrap: wrap; }

/* ── Empty / Loader ── */
.page-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; gap: 16px; p { font-size: 13px; color: var(--ink-60); } }
.loader-dots { display: flex; gap: 6px; span { width: 8px; height: 8px; border-radius: 50%; background: var(--ocean); animation: dot-bounce .8s ease-in-out infinite; &:nth-child(2) { animation-delay: .15s; } &:nth-child(3) { animation-delay: .3s; } } }
@keyframes dot-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

.empty-state { text-align: center; padding: 60px 24px; background: var(--card); border-radius: var(--radius); border: 0.5px dashed var(--border); &__icon { font-size: 40px; opacity: .4; margin-bottom: 12px; } h3 { font-size: 16px; font-weight: 700; color: var(--ink); margin: 0 0 6px; } p { font-size: 13px; color: var(--ink-60); margin: 0; } }

/* ── Modal ──
   FIX : pas de position:fixed (crash iframe) — on utilise un wrapper en flow normal
   avec min-height pour simuler un overlay sans casser le viewport
*/
.modal-overlay {
  position: relative;
  min-height: 500px;
  background: rgba(11,17,32,.55);
  border-radius: var(--radius);
  display: flex; align-items: center; justify-content: center;
  margin-top: 16px; padding: 20px;
}

.modal {
  background: var(--card); border-radius: 20px;
  width: 100%; max-width: 560px;
  box-shadow: 0 24px 64px rgba(11,17,32,.2);
  max-height: 80vh; overflow-y: auto;

  &__header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; h3 { font-size: 17px; font-weight: 800; color: var(--ink); margin: 0; } }
  &__close { width: 28px; height: 28px; border-radius: 50%; border: none; background: rgba(11,17,32,.06); color: var(--ink-60); cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; &:hover { background: rgba(11,17,32,.12); } }
  &__sub     { font-size: 13px; color: var(--ink-60); padding: 6px 24px 0; margin: 0; }
  &__section { padding: 16px 24px 0; }
  &__label   { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-30); margin-bottom: 10px; }
  &__user-list { display: flex; flex-direction: column; gap: 4px; max-height: 180px; overflow-y: auto; border: 0.5px solid var(--border); border-radius: 10px; padding: 4px; }
  &__footer { display: flex; justify-content: flex-end; gap: 8px; padding: 16px 24px 20px; }
}

.modal-user-row {
  display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; cursor: pointer; transition: background .15s;
  input { display: none; }
  &:hover { background: rgba(11,17,32,.04); }
  &--selected { background: var(--ocean-lt); }
}
.modal-avatar { width: 28px; height: 28px; border-radius: 50%; color: white; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.modal-user-name  { font-size: 12px; font-weight: 600; color: var(--ink); }
.modal-user-email { font-size: 11px; color: var(--ink-60); }

.preset-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; @media (max-width: 480px) { grid-template-columns: repeat(3, 1fr); } }
.preset-card {
  display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 8px; border-radius: 10px; border: 0.5px solid var(--border); background: var(--surface); cursor: pointer; transition: all .15s; font-family: inherit;
  &__icon { font-size: 20px; }
  &__name { font-size: 11px; font-weight: 700; color: var(--ink); text-align: center; }
  &__desc { font-size: 10px; color: var(--ink-60); text-align: center; line-height: 1.3; }
  &:hover { border-color: var(--ocean); background: var(--ocean-lt); }
  &--selected { border-color: var(--ocean); background: var(--ocean-lt); .preset-card__name { color: var(--ocean); } }
}

.spinner { border-radius: 50%; border: 2px solid rgba(255,255,255,.3); border-top-color: white; animation: spin .7s linear infinite; &--sm { width: 12px; height: 12px; } }
@keyframes spin { to { transform: rotate(360deg); } }

.expand-enter-active { transition: all .22s ease-out; }
.expand-leave-active  { transition: all .15s ease-in; }
.expand-enter-from, .expand-leave-to { opacity: 0; transform: translateY(-6px); }

@media (max-width: 768px) {
  .perms-page { padding: 14px 16px; }
  .toolbar { flex-direction: column; align-items: stretch; }
  .page-header { flex-direction: column; align-items: flex-start; }
  .modal-overlay { padding: 10px; }
}
</style>
