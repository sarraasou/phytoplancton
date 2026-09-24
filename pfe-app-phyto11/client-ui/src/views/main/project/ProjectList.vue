<template>
  <div class="project-list-container">
    <div class="list-header">
      <h2 class="list-title">
        {{ isAdmin ? 'Gestion des projets' : 'Mes projets' }}
      </h2>
      <div class="header-actions">
        <el-button
          v-if="isAdmin"
          type="primary"
          class="export-btn"
          :disabled="displayedProjects.length === 0"
          @click="dataToExcel"
        >
          <el-icon class="mr-1"><Download /></el-icon>
          Export to Excel
        </el-button>
      </div>
    </div>

    <!-- Aucun projet (non-admin) -->
    <div v-if="!isAdmin && !isLoadingProjects && displayedProjects.length === 0" class="no-access-state">
      <div class="no-access-card">
        <div class="no-access-icon">🔒</div>
        <h3>Aucun projet accessible</h3>
        <p>Vous n'avez pas encore accès à des projets. Contactez un administrateur.</p>
      </div>
    </div>

    <el-card v-else class="table-card" shadow="hover">
      <el-table
        :data="displayedProjects"
        v-loading="isLoadingProjects"
        style="width: 100%"
        stripe
        empty-text="Aucun projet trouvé"
        class="project-table"
      >
        <!-- ID -->
        <el-table-column prop="id" label="ID" width="120" fixed>
          <template #default="scope">
            <el-tooltip placement="top" effect="light">
              <template #content>
                <span class="font-mono">{{ scope.row.id }}</span>
              </template>
              <router-link
                :to="`/${rolePrefix}/${entityPluralName}/${scope.row.id}`"
                class="id-link"
              >
                {{ scope.row.id.substring(0, 8) }}...
              </router-link>
            </el-tooltip>
          </template>
        </el-table-column>

        <!-- Champs dynamiques -->
        <el-table-column
          v-for="fieldName in fieldsName"
          :key="fieldName"
          :prop="fieldName"
          :label="fieldName.charAt(0).toUpperCase() + fieldName.slice(1)"
          min-width="180"
        >
          <template #default="scope">
            <div class="cell-content">{{ formatCellContent(scope.row[fieldName]) }}</div>
          </template>
        </el-table-column>

        <!-- Accès (admin) -->
        <el-table-column v-if="isAdmin" label="Accès" width="100" align="center">
          <template #default="scope">
            <el-tooltip
              :content="(permissionCounts[scope.row.id] ?? 0) > 0
                ? `${permissionCounts[scope.row.id]} utilisateur(s) avec accès`
                : 'Aucun accès accordé'"
              placement="top"
            >
              <el-tag
                :type="(permissionCounts[scope.row.id] ?? 0) > 0 ? 'success' : 'info'"
                size="small"
                style="cursor: pointer"
                @click="managePermissions(scope.row.id)"
              >
                <span v-if="permissionCounts[scope.row.id] === undefined">…</span>
                <span v-else-if="permissionCounts[scope.row.id] > 0">{{ permissionCounts[scope.row.id] }}</span>
                <span v-else>—</span>
              </el-tag>
            </el-tooltip>
          </template>
        </el-table-column>

        <!-- Mon accès (non-admin) -->
        <el-table-column v-if="!isAdmin" label="Mon accès" width="120" align="center">
          <template #default="scope">
            <el-tag type="success" size="small">
              {{ getMyAccessLabel(scope.row.id) }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- Actions -->
        <el-table-column label="Actions" width="160" align="right" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <!-- Voir détail -->
              <router-link :to="`/${rolePrefix}/${entityPluralName}/${scope.row.id}`">
                <el-button size="small" type="info" circle :icon="View" title="Détails" />
              </router-link>

              <!-- Modifier -->
              <router-link
                v-if="isAdmin || userAccessMap[scope.row.id]?.canEdit"
                :to="`/${rolePrefix}/${entityPluralName}/edit/${scope.row.id}`"
              >
                <el-button size="small" type="primary" circle :icon="Edit" title="Modifier" />
              </router-link>

              <!-- Gérer permissions (admin) -->
              <el-tooltip v-if="isAdmin" content="Gérer les permissions" placement="top">
                <el-button
                  size="small"
                  type="warning"
                  circle
                  :icon="Key"
                  @click="managePermissions(scope.row.id)"
                />
              </el-tooltip>

              <!-- Supprimer -->
              <template v-if="isAdmin || userAccessMap[scope.row.id]?.canDelete">
                <el-button
                  size="small"
                  type="danger"
                  circle
                  :icon="Delete"
                  title="Supprimer"
                  @click="handleOpenConfirmModal(scope.row.id)"
                />
                <ConfirmModal
                  :title="$t('confirmModal.deleteTitle')"
                  :isLoading="deleteLoading"
                  :isOpenModal="isOpenModal && modalId === scope.row.id"
                  @close-confirm-modal="closeConfirmModal"
                  @approve-confirm-modal="() => handleRemoveEntity(scope.row.id)"
                >
                  <span>{{ $t("confirmModal.deleteContent") }}</span>
                </ConfirmModal>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination (admin uniquement) -->
      <div v-if="isAdmin" class="pagination-wrapper">
        <Pagination
          :itemsPerPage="paginationTake"
          :set-items-per-page="setItemsPerPage"
          :page="currentPage"
          :current-page-change="currentPageChange"
          :total="totalCount"
          :pages-array="[5, 10, 20, 50, 100]"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineAsyncComponent, watch, computed } from 'vue'
import { setCurrentPageBreadcrumbs } from '@/core/helpers/config'
import { storeToRefs } from 'pinia'
import { useProjectStore } from '@/store/useProjectModule'
import { useBodyStore } from '@/store/useBodyModule'
import { useAuthStore } from '@/store/useAuth'
import { useRole } from '@/composables/useRole'
import { useRouter } from 'vue-router'
import { Download, Edit, Delete, View, Key } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import * as XLSX from 'xlsx'

const ConfirmModal = defineAsyncComponent(() => import('@/components/modals/ConfirmModal.vue'))
const Pagination   = defineAsyncComponent(() => import('@/components/shared/pagination/Pagination.vue'))

const API_URL = import.meta.env.VITE_API_URL
const router  = useRouter()

// ── Constantes ────────────────────────────────────────────────────────────────
const entityPluralName = 'projects'
const fieldsName = ref(['title', 'tool', 'user', 'collaborators'])

// ── Stores ────────────────────────────────────────────────────────────────────
const { currentUser }     = storeToRefs(useAuthStore())
const { isLoading }       = storeToRefs(useBodyStore())
const { projectExcelFile } = storeToRefs(useProjectStore())
const { fetchDataExcelProjects, softDeleteProject } = useProjectStore()
const { isAdmin } = useRole()

// ✅ rolePrefix — même logique que useMyProjects.getProjectRoute
const rolePrefix = computed(() => {
  const raw = (currentUser.value?.userRole || 'user').toLowerCase()
  const map: Record<string, string> = {
    admin: 'admin', expert: 'expert', biologiste: 'expert',
    biologist: 'expert', technicien: 'technicien',
  }
  return map[raw] ?? 'user'
})

// ── États ─────────────────────────────────────────────────────────────────────
const isOpenModal       = ref(false)
const modalId           = ref<string | null>(null)
const deleteLoading     = ref(false)
const isLoadingProjects = ref(false)
const paginationTake    = ref(Number(localStorage.getItem('take')) || 10)
const currentPage       = ref(1)
const totalCount        = ref(0)

const adminProjects = ref<any[]>([])
const userProjects  = ref<any[]>([])

// ✅ Map des permissions non-admin : { projectId → { canEdit, canDelete, ... } }
const userAccessMap = ref<Record<string, Record<string, boolean>>>({})

// Compteurs d'accès (admin seulement)
const permissionCounts = ref<Record<string, number>>({})

const displayedProjects = computed(() =>
  isAdmin.value ? adminProjects.value : userProjects.value
)

// ── Auth headers ──────────────────────────────────────────────────────────────
const getHeaders = (): Record<string, string> => {
  for (const key of Object.keys(localStorage)) {
    try {
      const p = JSON.parse(localStorage.getItem(key) || '{}')
      const t = p?.access_token || p?.currentSession?.access_token
      if (t?.startsWith('ey')) return { Authorization: `Bearer ${t}` }
    } catch { continue }
  }
  return {}
}

// ── Chargement admin ──────────────────────────────────────────────────────────
const loadAdminProjects = async () => {
  isLoadingProjects.value = true
  try {
    const skip = (currentPage.value - 1) * paginationTake.value
    const res = await axios.get(`${API_URL}/nest/api/projects`, {
      headers: getHeaders(),
      params: { skip, take: paginationTake.value },
    })
    const data = res.data?.paginatedResult ?? res.data ?? []
    adminProjects.value = Array.isArray(data) ? data : []
    totalCount.value =
      res.data?.total?._count?._all ??
      res.data?.totalCount ??
      adminProjects.value.length
  } catch (err) {
    console.error('[ListProject] admin fetch error:', err)
    ElMessage.error('Impossible de charger les projets.')
    adminProjects.value = []
  } finally {
    isLoadingProjects.value = false
  }
}

// ── Chargement non-admin ──────────────────────────────────────────────────────
// ✅ Appelle /my-projects/:userId qui retourne [{ project, canView, canEdit, ... }]
//    → une seule requête pour les projets ET les permissions
const loadUserProjects = async () => {
  const uid = currentUser.value?.id
  if (!uid) return

  isLoadingProjects.value = true
  try {
    // ✅ Appel à la route sans paramètre (authentification via token)
    const res = await axios.get(
      `${API_URL}/nest/api/project-permission/my-projects`,
      { headers: getHeaders() }
    )

    const raw: any[] = Array.isArray(res.data) ? res.data : []

    if (raw.length > 0 && raw[0]?.project) {
      userProjects.value = raw.map((item: any) => item.project)
      raw.forEach((item: any) => {
        userAccessMap.value[item.project.id] = {
          canView:     !!item.canView,
          canUpload:   !!item.canUpload,
          canAnnotate: !!item.canAnnotate,
          canValidate: !!item.canValidate,
          canEdit:     !!item.canEdit,
          canDelete:   !!item.canDelete,
        }
      })
    } else {
      userProjects.value = raw
    }
  } catch (err) {
    console.error('[ListProject] user fetch error:', err)
    ElMessage.error('Impossible de charger vos projets.')
    userProjects.value = []
  } finally {
    isLoadingProjects.value = false
  }
}

// ── Compteurs (admin, non bloquant) ──────────────────────────────────────────
const loadAllCounts = async () => {
  if (!isAdmin.value || !adminProjects.value.length) return
  const BATCH = 5
  for (let i = 0; i < adminProjects.value.length; i += BATCH) {
    await Promise.all(
      adminProjects.value.slice(i, i + BATCH).map(async (p) => {
        try {
          const res = await axios.get(
            `${API_URL}/nest/api/project-permission/${p.id}/count`,
            { headers: getHeaders() }
          )
          permissionCounts.value = { ...permissionCounts.value, [p.id]: res.data?.count ?? 0 }
        } catch {
          permissionCounts.value = { ...permissionCounts.value, [p.id]: 0 }
        }
      })
    )
  }
}

// ── Label d'accès ─────────────────────────────────────────────────────────────
const getMyAccessLabel = (projectId: string): string => {
  const perms = userAccessMap.value[projectId]
  if (!perms)                             return 'Lecteur'
  if (perms.canDelete && perms.canEdit)   return 'Complet'
  if (perms.canValidate)                  return 'Expert'
  if (perms.canAnnotate)                  return 'Analyste'
  if (perms.canView)                      return 'Lecteur'
  return 'Aucun'
}

// ── Point d'entrée ────────────────────────────────────────────────────────────
const loadProjects = async () => {
  if (isAdmin.value) {
    await loadAdminProjects()
    loadAllCounts() // non bloquant — en arrière-plan
  } else {
    await loadUserProjects()
  }
}

// ✅ Pagination : uniquement pour admin
watch(
  [currentPage, paginationTake],
  async () => {
    if (isAdmin.value) {
      await loadAdminProjects()
      loadAllCounts()
    }
  }
)

const setItemsPerPage = (event: any) => {
  paginationTake.value = parseInt(event.target.value)
  currentPage.value    = 1
  localStorage.setItem('take', paginationTake.value.toString())
}

const currentPageChange = (val: number) => { currentPage.value = val }

// ── Actions ───────────────────────────────────────────────────────────────────
const managePermissions = (projectId: string) => {
  router.push({ name: 'admin-project-permissions', params: { id: projectId } })
}

const formatCellContent = (content: any): string => {
  if (Array.isArray(content)) {
    if (!content.length) return '—'
    return content
      .map((item: any) => {
        if (typeof item === 'string') return item.substring(0, 8) + '…'
        return item?.name || item?.email || (item?.id ? item.id.substring(0, 8) + '…' : '—')
      })
      .join(', ')
  }
  if (content !== null && typeof content === 'object') {
    return content?.name || content?.email || (content?.id ? content.id.substring(0, 8) + '…' : '—')
  }
  if (typeof content === 'string') {
    return content.length > 50 ? content.substring(0, 50) + '…' : content
  }
  return content ?? '—'
}

const dataToExcel = async () => {
  await fetchDataExcelProjects()
  const workbook = XLSX.read(projectExcelFile.value.toString())
  XLSX.writeFile(workbook, 'Projects_Export.xlsx')
}

const handleRemoveEntity = async (id: string) => {
  deleteLoading.value = true
  try {
    await softDeleteProject(id)
    ElMessage.success('Projet supprimé.')
    if (isAdmin.value) {
      delete permissionCounts.value[id]
      await loadAdminProjects()
    } else {
      userProjects.value = userProjects.value.filter(p => p.id !== id)
      delete userAccessMap.value[id]
    }
  } catch {
    ElMessage.error('Erreur lors de la suppression.')
  } finally {
    deleteLoading.value = false
    closeConfirmModal()
  }
}

const handleOpenConfirmModal = (id: string) => { isOpenModal.value = true; modalId.value = id }
const closeConfirmModal      = ()            => { isOpenModal.value = false; modalId.value = null }

// ── Montage ───────────────────────────────────────────────────────────────────
onMounted(async () => {
  setCurrentPageBreadcrumbs(entityPluralName, [])
  await loadProjects()
  isLoading.value = false
})
</script>

<style scoped lang="scss">
.project-list-container { padding: 24px; max-width: 1600px; margin: 0 auto; }

.list-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
}
.list-title { font-size: 24px; font-weight: 600; color: var(--el-color-primary); margin: 0; }
.header-actions { display: flex; gap: 12px; }

.no-access-state { display: flex; justify-content: center; padding: 60px 24px; }
.no-access-card {
  text-align: center; background: white; border-radius: 16px;
  padding: 48px 40px; max-width: 400px;
  box-shadow: 0 4px 16px rgba(0,0,0,.08);
  border: 1.5px dashed #e2e8f0;
  .no-access-icon { font-size: 48px; margin-bottom: 16px; }
  h3 { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
  p  { font-size: 14px; color: #64748b; margin: 0; }
}

.table-card { border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.1); }

.project-table {
  :deep(.el-table__header) th {
    background-color: #f8fafc; color: #334155; font-weight: 600;
  }
  :deep(.el-table__row) {
    height: 70px; transition: background-color .2s;
    &:hover { background-color: #f8fafc; }
  }
  .id-link {
    color: var(--el-color-primary); font-family: monospace;
    text-decoration: none; font-weight: 500;
    &:hover { text-decoration: underline; }
  }
  .cell-content {
    white-space: nowrap; overflow: hidden;
    text-overflow: ellipsis; max-width: 300px;
  }
}

.action-buttons {
  display: flex; justify-content: flex-end; gap: 8px; align-items: center;
}

.pagination-wrapper {
  display: flex; justify-content: center; padding: 16px;
  border-top: 1px solid var(--el-border-color-light); background-color: #f8fafc;
}

.export-btn {
  background-color: var(--el-color-primary); border-color: var(--el-color-primary);
  &:hover { background-color: #4da0cc; }
  &:disabled { opacity: .6; }
}
</style>