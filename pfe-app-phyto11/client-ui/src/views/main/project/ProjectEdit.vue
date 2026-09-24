<template>
  <div class="project-edit-page">
    <!-- Écran de chargement -->
    <div v-if="isLoadingPermissions" class="loading-container">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>Chargement des permissions...</span>
    </div>

    <!-- Accès refusé pour modification -->
    <div v-else-if="!canEdit" class="access-denied">
      <el-result
        icon="warning"
        title="Accès refusé"
        sub-title="Vous n'avez pas la permission de modifier ce projet"
      >
        <template #extra>
          <el-button type="primary" @click="$router.push('/dashboard')">
            Retour au tableau de bord
          </el-button>
        </template>
      </el-result>
    </div>

    <!-- Formulaire (avec permission upload) -->
    <div v-else>
      <ProjectForm :isEdit="true" :canUpload="canUpload" />
    </div>
  </div>
</template>
<script setup lang="ts">
import ProjectForm from "@/components/forms/ProjectForm.vue";
import { setCurrentPageBreadcrumbs } from "@/core/helpers/config";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/store/useAuth";
import { storeToRefs } from "pinia";
import { useRole } from "@/composables/useRole";
import axios from "axios";
import { ElMessage } from "element-plus";
import { Loading } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const { currentUser } = storeToRefs(useAuthStore());
const { isAdmin } = useRole();
const isLoadingPermissions = ref(true);
const canEdit = ref(false); 
const canUpload = ref(false);
const API_URL = import.meta.env.VITE_API_URL;
const getAuthHeaders = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem('supabase.auth.token');
    if (raw) {
      const token = JSON.parse(raw)?.currentSession?.access_token;
      if (token?.startsWith('ey')) return { Authorization: `Bearer ${token}` };
    }
  } catch { /* silent */ }
  return {};
};


const checkPermissions = async () => {
  const projectId = route.params.id as string;
  
  if (!projectId) {
    ElMessage.error("ID du projet manquant");
    router.push('/dashboard');
    return;
  }
  try {
    const response = await axios.get(
      `${API_URL}/nest/api/project-permission/${projectId}/${currentUser.value?.id}`,
      { headers: getAuthHeaders() }
    );
    
    canEdit.value = response.data.canEdit || false;
    canUpload.value = response.data.canUpload || false;
    
    if (!canEdit.value) {
      ElMessage.warning("Vous n'avez pas la permission de modifier ce projet");
    }
  } catch (error) {
    console.error("Erreur vérification permissions:", error);
    canEdit.value = false;
    canUpload.value = false;
  } finally {
    isLoadingPermissions.value = false;
  }
}; 


onMounted(async () => {
  setCurrentPageBreadcrumbs("Edit Project", ["Projects"]);
  await checkPermissions();
});
</script>
<style lang="scss" scoped>
.project-edit-page {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 64px);
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 400px;
  color: var(--el-color-primary);
}

.loading-container .el-icon {
  font-size: 24px;
  animation: spin 1s linear infinite;
}

.access-denied {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 40px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>