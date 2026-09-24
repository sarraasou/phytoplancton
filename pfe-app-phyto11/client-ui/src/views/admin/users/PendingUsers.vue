<template>
  <div class="pending-users-container">

    <!-- Header -->
    <div class="page-header mb-6">
      <h2>Utilisateurs en attente</h2>
      <p class="text-muted">
        Validez ou refusez les demandes d'accès à la plateforme.
      </p>
    </div>

    <!-- Badge compteur -->
    <el-alert
      v-if="pendingUsers.length > 0"
      :title="`${pendingUsers.length} utilisateur(s) en attente de validation`"
      type="warning" show-icon :closable="false"
      class="mb-4"
    />

    <!-- Loading -->
    <div v-if="isLoading" class="d-flex justify-content-center py-5">
      <el-icon class="rotating" size="32"><Loading /></el-icon>
    </div>

    <!-- Vide -->
    <el-empty
      v-else-if="pendingUsers.length === 0"
      description="Aucun utilisateur en attente"
    />

    <!-- Table -->
    <el-table
      v-else
      :data="pendingUsers"
      style="width: 100%"
      stripe border
    >
      <el-table-column label="Nom" min-width="160">
        <template #default="{ row }">
          <div class="d-flex flex-column">
            <span class="fw-bold">
              {{ row.firstName }} {{ row.lastName }}
            </span>
            <span class="text-muted fs-8">{{ row.username }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Rôle" width="140">
        <template #default="{ row }">
          <el-tag :type="getRoleType(row.userRole)" size="small">
            {{ row.userRole || 'Non défini' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Statut" width="130">
        <template #default="{ row }">
          <el-tag type="warning" size="small">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Date inscription" width="160">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column label="Actions" width="200" fixed="right">
        <template #default="{ row }">
          <div class="d-flex gap-2">
            <el-button
              type="success" size="small"
              :loading="loadingId === row.id"
              @click="activateUser(row)"
            >
              Activer
            </el-button>
            <el-button
              type="danger" size="small"
              :loading="loadingId === row.id"
              @click="rejectUser(row)"
            >
              Refuser
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted }            from 'vue'
import { useRouter }                 from 'vue-router'
import { ElMessageBox }              from 'element-plus'
import { Loading }                   from '@element-plus/icons-vue'
import { Components }                from '@tekab-dev-team/storybook-devfactory'
import { setCurrentPageBreadcrumbs } from '@/core/helpers/config'
import { storeToRefs }               from 'pinia'
import { useAuthStore }              from '@/store/useAuth'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL
const router  = useRouter()

// ✅ Vérification de rôle — seul l'admin peut accéder
const { currentUser } = storeToRefs(useAuthStore())

const pendingUsers = ref<any[]>([])
const isLoading    = ref(false)
const loadingId    = ref<string | null>(null)

// ─── Auth headers ─────────────────────────────────────────────────────────────
const getHeaders = () => {
  try {
    for (const key of Object.keys(localStorage)) {
      try {
        const parsed = JSON.parse(localStorage.getItem(key) || '{}')
        const token  =
          parsed?.access_token ||
          parsed?.currentSession?.access_token ||
          parsed?.data?.session?.access_token
        if (token?.startsWith('ey')) {
          return { Authorization: `Bearer ${token}` }
        }
      } catch { continue }
    }
  } catch { /* silent */ }
  return {}
}

// ─── Chargement ───────────────────────────────────────────────────────────────
const loadPendingUsers = async () => {
  isLoading.value = true
  try {
    const res = await axios.get(`${API_URL}/nest/api/users`, {
      headers: getHeaders(),
      params:  { 'where[status]': 'EN_ATTENTE' },
    })
    pendingUsers.value = res.data?.paginatedResult ?? res.data ?? []
  } catch (err) {
    console.error('Erreur chargement:', err)
    Components.ElMessage.error('Erreur lors du chargement')
  } finally {
    isLoading.value = false
  }
}

// ─── Activer ──────────────────────────────────────────────────────────────────
const activateUser = async (user: any) => {
  loadingId.value = user.id
  try {
    await axios.patch(
      `${API_URL}/nest/api/activate_user/${user.id}`,
      {},
      { headers: getHeaders() }
    )
    Components.ElMessage.success(`${user.firstName} ${user.lastName} activé !`)
    pendingUsers.value = pendingUsers.value.filter(u => u.id !== user.id)
  } catch (err) {
    console.error('Erreur activation:', err)
    Components.ElMessage.error("Erreur lors de l'activation")
  } finally {
    loadingId.value = null
  }
}

// ─── Refuser ──────────────────────────────────────────────────────────────────
const rejectUser = async (user: any) => {
  try {
    await ElMessageBox.confirm(
      `Voulez-vous vraiment refuser l'accès à ${user.firstName} ${user.lastName} ?`,
      'Confirmation',
      {
        confirmButtonText: 'Oui, refuser',
        cancelButtonText:  'Annuler',
        type:              'warning',
      }
    )

    loadingId.value = user.id
    await axios.patch(
      `${API_URL}/nest/api/reject_user/${user.id}`,
      {},
      { headers: getHeaders() }
    )
    Components.ElMessage.warning(`${user.firstName} ${user.lastName} refusé`)
    pendingUsers.value = pendingUsers.value.filter(u => u.id !== user.id)

  } catch (err: any) {
    if (err !== 'cancel' && err?.message !== 'cancel') {
      Components.ElMessage.error('Erreur lors du refus')
    }
  } finally {
    loadingId.value = null
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getRoleType = (role: string) => {
  const map: Record<string, string> = {
    admin:      'danger',
    expert:     'success',
    technicien: 'primary',
  }
  return map[role?.toLowerCase()] ?? 'info'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ─── onMounted — vérification de rôle ────────────────────────────────────────
onMounted(() => {
  const role = currentUser.value?.userRole?.toLowerCase() ||
               currentUser.value?.role?.toLowerCase()

  // ✅ Si pas admin → rediriger immédiatement
  if (role !== 'admin') {
    console.warn(`[PendingUsers] Accès refusé pour le rôle "${role}"`)
    router.replace({ name: 'home' })
    return
  }

  setCurrentPageBreadcrumbs('Utilisateurs en attente', ['users'])
  loadPendingUsers()
})
</script>

<style lang="scss" scoped>
.pending-users-container {
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.page-header h2 {
  color: #0077b6;
  font-size: 1.8rem;
  font-weight: 600;
}
.rotating {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>