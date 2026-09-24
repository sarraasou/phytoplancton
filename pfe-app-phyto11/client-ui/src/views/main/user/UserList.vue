<template>
  <div class="user-list-container">
    <!-- Header Section -->
    <div class="list-header">
      <h2 class="list-title">Users Management</h2>
      <div class="header-actions">
        <el-button
          type="primary"
          class="export-btn"
          :disabled="userList.length === 0 || isLoading"
          @click="dataToExcel"
        >
          <el-icon class="mr-1"><Download /></el-icon>
          Export to Excel
        </el-button>
      </div>
    </div>

    <!-- Main Table Card -->
    <el-card class="table-card" shadow="hover">
      <el-table
        :data="userList"
        v-loading="isLoading"
        style="width: 100%"
        stripe
        empty-text="No users found"
        class="user-table"
      >
        <!-- ID Column -->
        <el-table-column prop="id" label="ID" width="120" fixed>
          <template #default="scope">
            <el-tooltip placement="top" effect="light">
              <template #content>
                <span class="font-mono">{{ scope.row.id }}</span>
              </template>
              <!-- ✅ CORRIGÉ : utilise rolePrefix au lieu de currentUser.role -->
              <router-link
                :to="`/${rolePrefix}/${entityPluralName}/${scope.row.id}`"
                class="id-link"
                :data-test="`userList_${scope.row.id}`"
              >
                {{ scope.row.id.substring(0, 8) }}...
              </router-link>
            </el-tooltip>
          </template>
        </el-table-column>

        <!-- Dynamic Columns -->
        <el-table-column
          v-for="fieldName in fieldsName"
          :key="fieldName"
          :prop="fieldName"
          :label="fieldName.charAt(0).toUpperCase() + fieldName.slice(1)"
          min-width="180"
        >
          <template #default="scope">
            <div class="cell-content">
              {{ formatCellContent(scope.row[fieldName]) }}
            </div>
          </template>
        </el-table-column>

        <!-- Actions Column -->
        <el-table-column label="Actions" width="150" align="right" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <!-- ✅ CORRIGÉ : utilise rolePrefix -->
              <router-link
                :to="`/${rolePrefix}/${entityPluralName}/edit/${scope.row.id}`"
                :data-test="`userListEditLink_${scope.row.id}`"
              >
                <el-button
                  size="small"
                  type="primary"
                  circle
                  :icon="Edit"
                  class="edit-btn"
                />
              </router-link>

              <el-button
                size="small"
                type="danger"
                circle
                :icon="Delete"
                @click="() => handleOpenConfirmModal(scope.row.id)"
                class="delete-btn"
                :data-test="`userListDeleteBtn_${scope.row.id}`"
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
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <Pagination
          :itemsPerPage="userPagination.take"
          :set-items-per-page="setItemsPerPage"
          :page="Math.floor(userPagination.skip / userPagination.take) + 1"
          :current-page-change="currentPageChange"
          :total="userPagination.total._count?._all"
          :pages-array="[5, 10, 20, 50, 100]"
        />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, defineAsyncComponent } from 'vue'
import { useRouter }                 from 'vue-router'
import { setCurrentPageBreadcrumbs } from '@/core/helpers/config'
import { storeToRefs }               from 'pinia'
import { useUserStore }              from '@/store/useUserModule'
import { useBodyStore }              from '@/store/useBodyModule'
import { useAuthStore }              from '@/store/useAuth'
import { useRole }                   from '@/composables/useRole'
import { Download, Edit, Delete }    from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'

const ConfirmModal = defineAsyncComponent(
  () => import('@/components/modals/ConfirmModal.vue')
)
const Pagination = defineAsyncComponent(
  () => import('@/components/shared/pagination/Pagination.vue')
)

const router = useRouter()

// ─── Rôle ─────────────────────────────────────────────────────────────────────
const { currentUser }           = storeToRefs(useAuthStore())
const { isAdmin, isExpert }     = useRole()

// ✅ Résout le bon préfixe de route selon le rôle réel
const SUPABASE_GENERIC = ['user', 'authenticated', 'anon', '']
const rolePrefix = computed(() => {
  const raw =
    currentUser.value?.userRole?.toLowerCase() ||
    (!SUPABASE_GENERIC.includes(currentUser.value?.role?.toLowerCase() ?? '')
      ? currentUser.value?.role?.toLowerCase()
      : null) ||
    'user'
  const map: Record<string, string> = {
    expert:     'expert',
    biologiste: 'expert',
    biologist:  'expert',
    technicien: 'technicien',
    admin:      'admin',
    user:       'user',
  }
  return map[raw] ?? 'user'
})

// ─── Constants ────────────────────────────────────────────────────────────────
const entityPluralName = 'users'
const fieldsName = ref([
  'firstName', 'lastName', 'username',
  'isValid', 'roles', 'userRole',
  'projects', 'annotations', 'collaborators',
])

const isOpenModal  = ref(false)
const modalId      = ref<string | null>(null)
const deleteLoading = ref(false)

// ─── Stores ───────────────────────────────────────────────────────────────────
const { isLoading }                   = storeToRefs(useBodyStore())
const { userList, userPagination, userExcelFile } = storeToRefs(useUserStore())
const { fetchUsers, fetchDataExcelUsers, softDeleteUser } = useUserStore()

// ─── Formatage cellule ────────────────────────────────────────────────────────
const formatCellContent = (content: any) => {
  if (Array.isArray(content)) {
    if (content.length === 0) return '-'
    return content.map((item: any) => {
      if (typeof item === 'string') {
        return item.length > 8 ? item.substring(0, 8) + '...' : item
      }
      if (typeof item === 'object' && item !== null) {
        return item?.name || item?.title || item?.email ||
               item?.username || item?.result || item?.url ||
               (item?.id ? item.id.substring(0, 8) + '...' : '-')
      }
      return String(item)
    }).join(', ')
  }

  if (content !== null && typeof content === 'object') {
    return content?.name || content?.title || content?.email ||
           content?.username || content?.result || content?.url ||
           (content?.id ? content.id.substring(0, 8) + '...' : '-')
  }

  if (typeof content === 'string') {
    return content.length > 50 ? content.substring(0, 50) + '...' : content
  }

  if (typeof content === 'boolean') return content ? 'Yes' : 'No'

  return content ?? '-'
}

// ─── Actions ──────────────────────────────────────────────────────────────────
const dataToExcel = async () => {
  await fetchDataExcelUsers()
  const workbook = XLSX.read(userExcelFile.value.toString())
  XLSX.writeFile(workbook, 'Users_Export.xlsx')
}

const handleRemoveEntity = async (id: string) => {
  deleteLoading.value = true
  await softDeleteUser(id)
  deleteLoading.value = false
  closeConfirmModal()
}

const handleOpenConfirmModal = (id: string) => {
  isOpenModal.value = true
  modalId.value     = id
}

const closeConfirmModal = () => {
  isOpenModal.value = false
  modalId.value     = null
}

const setItemsPerPage = async (event: any) => {
  await fetchUsers({ skip: 0, take: parseInt(event.target.value) })
}

const currentPageChange = async (val: number) => {
  await fetchUsers({
    skip: (val - 1) * userPagination.value.take,
    take: userPagination.value.take,
  })
}

// ─── onMounted — vérification de rôle ────────────────────────────────────────
onMounted(async () => {
  // ✅ Seul admin et expert peuvent gérer les users
  if (!isAdmin.value && !isExpert.value) {
    console.warn(`[UserList] Accès refusé pour le rôle "${rolePrefix.value}"`)
    router.replace({ name: `${rolePrefix.value}-list-project` })
    return
  }

  setCurrentPageBreadcrumbs(entityPluralName, [])
  await fetchUsers({
    skip: 0,
    take: Number(localStorage.getItem('take')) || 10,
  })
  isLoading.value = false
})
</script>

<style scoped lang="scss">
.user-list-container {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.list-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-color-primary);
  margin: 0;
}
.header-actions {
  display: flex;
  gap: 12px;
}
.table-card {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
:deep().el-table .cell {
  overflow: initial;
}
.user-table {
  :deep(.el-table__header) th {
    background-color: #f8fafc;
    color: #334155;
    font-weight: 600;
  }
  :deep(.el-table__row) {
    transition: background-color 0.2s;
    height: 70px;
    &:hover { background-color: #f8fafc; }
  }
  .id-link {
    color: var(--el-color-primary);
    font-family: monospace;
    text-decoration: none;
    font-weight: 500;
    &:hover { text-decoration: underline; }
  }
  .cell-content {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
  }
}
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  align-items: center;
  .edit-btn {
    background-color: var(--el-color-primary-light-5);
    border-color: var(--el-color-primary-light-5);
    &:hover { background-color: var(--el-color-primary); }
  }
  .delete-btn {
    background-color: var(--el-color-danger-light-5);
    border-color: var(--el-color-danger-light-5);
    &:hover { background-color: var(--el-color-danger); }
  }
}
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 16px;
  border-top: 1px solid var(--el-border-color-light);
  background-color: #f8fafc;
}
.export-btn {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  &:hover { background-color: #4da0cc; border-color: #4da0cc; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}
</style>