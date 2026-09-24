<template>
  <div class="permissions-manager">
    <el-card shadow="never" class="permission-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon><Key /></el-icon>
            <span>Gestion des permissions — {{ projectTitle || 'Projet' }}</span>
          </div>
          <el-tag type="info" size="small">Administrateur uniquement</el-tag>
        </div>
      </template>

   <!-- ✅ Remplacer el-form-item par un simple div -->
        <div class="user-selector">
        <label class="selector-label">1. Sélectionner un utilisateur</label>
        <el-select
          v-model="selectedUserId"
          placeholder="Choisir un utilisateur..."
          filterable
          clearable
          :loading="loadingUsers"
          style="width: 100%"
          @change="onUserSelect"
        >
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="`${user.firstName} ${user.lastName} (${user.userRole}) - ${user.email || user.username}`"
            :value="user.id"
          >
            <div class="user-option">
              <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
              <span class="user-role">{{ user.userRole }}</span>
              <span class="user-email">{{ user.email || user.username }}</span>
            </div>
          </el-option>
        </el-select>
      </div>

      <div v-if="selectedUserId" class="permissions-section">
        <el-divider content-position="left">
          <span>2. Permissions pour {{ selectedUserName }}</span>
        </el-divider>

        <div class="permissions-grid">
          <el-row :gutter="20">
            <el-col :span="12" :md="8">
              <el-checkbox v-model="form.canView" size="large" @change="onPermissionChange">
                <div class="permission-item">
                  <el-icon><View /></el-icon>
                  <span>Voir le projet</span>
                </div>
              </el-checkbox>
            </el-col>

            <el-col :span="12" :md="8">
              <el-checkbox v-model="form.canUpload" size="large">
                <div class="permission-item">
                  <el-icon><Upload /></el-icon>
                  <span>Uploader des images</span>
                </div>
              </el-checkbox>
            </el-col>

            <el-col :span="12" :md="8">
              <el-checkbox v-model="form.canAnnotate" size="large">
                <div class="permission-item">
                  <el-icon><MagicStick /></el-icon>
                  <span>Annoter (analyse IA)</span>
                </div>
              </el-checkbox>
            </el-col>

            <el-col :span="12" :md="8">
              <el-checkbox v-model="form.canValidate" size="large">
                <div class="permission-item">
                  <el-icon><Select /></el-icon>
                  <span>Valider les annotations</span>
                </div>
              </el-checkbox>
            </el-col>

            <el-col :span="12" :md="8">
              <el-checkbox v-model="form.canEdit" size="large">
                <div class="permission-item">
                  <el-icon><Edit /></el-icon>
                  <span>Modifier le projet</span>
                </div>
              </el-checkbox>
            </el-col>

            <el-col :span="12" :md="8">
              <el-checkbox v-model="form.canDelete" size="large">
                <div class="permission-item">
                  <el-icon><Delete /></el-icon>
                  <span>Supprimer le projet</span>
                </div>
              </el-checkbox>
            </el-col>
          </el-row>
        </div>

        <el-divider />
        
        <div class="actions">
          <el-button
            type="primary"
            @click="savePermissions"
            :loading="saving"
            :disabled="!hasChanges"
          >
            <el-icon><Check /></el-icon>
            {{ saving ? 'Enregistrement...' : 'Enregistrer les permissions' }}
          </el-button>
          
          <el-button
            type="danger"
            plain
            @click="revokePermissions"
            :loading="revoking"
          >
            <el-icon><Delete /></el-icon>
            Révoquer toutes les permissions
          </el-button>
          
          <el-button
            @click="resetForm"
            :disabled="!hasChanges || saving"
          >
            <el-icon><RefreshRight /></el-icon>
            Annuler
          </el-button>
        </div>
      </div>

      <el-empty
        v-else
        description="Sélectionnez un utilisateur pour gérer ses permissions"
        :image-size="100"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Key, View, Upload, MagicStick, Select, Edit, Delete,
  Check, RefreshRight
} from '@element-plus/icons-vue'
import { permissionService } from '@/service/permission.service'

const route = useRoute()
const projectId = computed(() => route.params.id as string)
const projectTitle = ref('')

const selectedUserId = ref('')
const userList = ref<any[]>([])
const loadingUsers = ref(false)
const saving = ref(false)
const revoking = ref(false)

const form = ref({
  canView: false,
  canUpload: false,
  canAnnotate: false,
  canValidate: false,
  canEdit: false,
  canDelete: false
})

const originalPermissions = ref({
  canView: false,
  canUpload: false,
  canAnnotate: false,
  canValidate: false,
  canEdit: false,
  canDelete: false
})

const selectedUserName = computed(() => {
  const user = userList.value.find(u => u.id === selectedUserId.value)
  return user ? `${user.firstName} ${user.lastName}` : ''
})

const hasChanges = computed(() => {
  return JSON.stringify(form.value) !== JSON.stringify(originalPermissions.value)
})

const loadProjectTitle = async () => {
  try {
    const data = await permissionService.getProject(projectId.value)
    projectTitle.value = data.title || 'Projet'
  } catch (error) {
    console.error('Erreur chargement projet:', error)
    projectTitle.value = 'Projet'
  }
}

const loadUsers = async () => {
  loadingUsers.value = true
  try {
    userList.value = await permissionService.getAllUsers()
    userList.value = userList.value.filter((u: any) => u.status === 'ACTIF')
  } catch (error) {
    console.error('Erreur chargement utilisateurs:', error)
    ElMessage.error('Erreur lors du chargement des utilisateurs')
  } finally {
    loadingUsers.value = false
  }
}

const loadUserPermissions = async () => {
  if (!selectedUserId.value) return

  try {
    const data = await permissionService.getUserPermissions(projectId.value, selectedUserId.value)
    
    const perms = {
      canView: data.canView || false,
      canUpload: data.canUpload || false,
      canAnnotate: data.canAnnotate || false,
      canValidate: data.canValidate || false,
      canEdit: data.canEdit || false,
      canDelete: data.canDelete || false
    }
    
    form.value = { ...perms }
    originalPermissions.value = { ...perms }
  } catch (error: any) {
    if (error.response?.status === 404) {
      const emptyPerms = {
        canView: false, canUpload: false, canAnnotate: false,
        canValidate: false, canEdit: false, canDelete: false
      }
      form.value = { ...emptyPerms }
      originalPermissions.value = { ...emptyPerms }
    } else {
      console.error('Erreur chargement permissions:', error)
      ElMessage.error('Erreur lors du chargement des permissions')
    }
  }
}

const savePermissions = async () => {
  if (!selectedUserId.value) return

  saving.value = true
  try {
    await permissionService.grant({
      projectId: projectId.value,
      userId: selectedUserId.value,
      canView: form.value.canView,
      canUpload: form.value.canUpload,
      canAnnotate: form.value.canAnnotate,
      canValidate: form.value.canValidate,
      canEdit: form.value.canEdit,
      canDelete: form.value.canDelete
    })
    
    originalPermissions.value = { ...form.value }
    ElMessage.success('Permissions enregistrées avec succès !')
  } catch (error: any) {
    console.error('Erreur:', error)
    ElMessage.error(error.response?.data?.message || 'Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}

const revokePermissions = async () => {
  if (!selectedUserId.value) return

  try {
    await ElMessageBox.confirm(
      `Êtes-vous sûr de vouloir révoquer TOUTES les permissions de ${selectedUserName.value} ?`,
      'Confirmation',
      {
        confirmButtonText: 'Oui, révoquer',
        cancelButtonText: 'Annuler',
        type: 'warning'
      }
    )
    
    revoking.value = true
    await permissionService.revoke(projectId.value, selectedUserId.value)
    
    const emptyPerms = {
      canView: false, canUpload: false, canAnnotate: false,
      canValidate: false, canEdit: false, canDelete: false
    }
    form.value = { ...emptyPerms }
    originalPermissions.value = { ...emptyPerms }
    
    ElMessage.success('Permissions révoquées avec succès')
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Erreur:', error)
      ElMessage.error(error.response?.data?.message || 'Erreur lors de la révocation')
    }
  } finally {
    revoking.value = false
  }
}

const resetForm = () => {
  form.value = { ...originalPermissions.value }
}

const onUserSelect = () => {
  if (selectedUserId.value) {
    loadUserPermissions()
  }
}

const onPermissionChange = () => {
  if (form.value.canDelete && !form.value.canEdit) {
    form.value.canEdit = true
  }
  if (form.value.canEdit && !form.value.canView) {
    form.value.canView = true
  }
  if (form.value.canValidate && !form.value.canAnnotate) {
    form.value.canAnnotate = true
  }
}

onMounted(async () => {
  await Promise.all([
    loadProjectTitle(),
    loadUsers()
  ])
})
</script>

<style scoped lang="scss">
.permissions-manager {
  padding: 20px;
  .user-selector {
    margin-bottom: 20px;
    
    .selector-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      font-size: 14px;
      color: #374151;
    }
  }
  
  .permission-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 16px;
      }
    }
  }
  
  .permissions-section {
    margin-top: 20px;
    
    .permissions-grid {
      margin: 20px 0;
    }
    
    .actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 20px;
    }
  }
}
</style>