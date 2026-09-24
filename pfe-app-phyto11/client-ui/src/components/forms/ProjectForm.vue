<template>
  <div class="project-form-container">
    <div class="form-header">
      <h2>{{ isEdit ? 'Edit Project' : 'Create New Project' }}</h2>
      <p class="subtitle">Fill in the details below to {{ isEdit ? 'update' : 'create' }} your project</p>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <el-icon class="loading-spinner"><Loading /></el-icon>
        <h3>{{ isEdit ? 'Updating Project' : 'Creating Project' }}</h3>
        <p>{{ loadingMessage }}</p>
        <div class="loading-progress">
          <el-progress 
            :percentage="loadingProgress" 
            :indeterminate="true"
            :duration="3"
            status="success"
          />
        </div>
      </div>
    </div>

    <el-form
      :model="project"
      label-width="150px"
      :rules="rules"
      ref="ruleFormRef"
      label-position="top"
      class="project-form"
      :class="{ 'form-loading': isLoading }"
    >
      <div class="form-grid">
        <!-- Left Column -->
        <div class="form-column">
          <el-form-item label="Project Title" prop="title" class="form-item">
            <el-input
              v-model="project.title"
              placeholder="Enter project title"
              data-test="projectFormtitle"
              size="large"
              :disabled="isLoading"
            />
          </el-form-item>

          <el-form-item label="Description" prop="description" class="form-item">
            <el-input
              v-model="project.description"
              type="textarea"
              :rows="5"
              placeholder="Describe your project in detail"
              data-test="projectFormdescription"
              resize="none"
              :disabled="isLoading"
            />
          </el-form-item>
        </div>

        <!-- Right Column -->
        <div class="form-column">
          <el-form-item label="Primary Tool/Technology" prop="tool" class="form-item">
            <el-input
              v-model="project.tool"
              placeholder="Enter main tool or technology used"
              data-test="projectFormtool"
              size="large"
              :disabled="isLoading"
            />
          </el-form-item>

          <el-form-item label="Assigned User" prop="user" class="form-item">
            <el-select
              v-model="project.user.id"
              data-test="projectFormuserId"
              placeholder="Select a user"
              size="large"
              class="user-select"
              filterable
              :disabled="isLoading"
            >
              <el-option
                v-for="user in users"
                :key="user.id"
                :label="user.name || `User ${user.id}`"
                :value="user.id"
              >
                <div class="user-option">
                  <span class="user-id">ID: {{ user.id }}</span>
                  <span v-if="user.name" class="user-name">{{ user.name }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </div>
      </div>

      <!-- ✅ Section Upload (conditionnée par canUpload) -->
      <div class="full-width-section" v-if="canUpload">
        <el-form-item label="Project Images" class="form-item">
          <div class="upload-container" :class="{ 'upload-loading': isLoading }">
            <el-upload
              v-model:file-list="fileList"
              list-type="picture-card"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleRemove"
              :auto-upload="false"
              :on-exceed="handleExceed"
              multiple
              :disabled="isLoading"
              :limit="20"
            >
              <el-icon><Plus /></el-icon>
              <template #tip>
                <div class="upload-tip">
                  {{ isLoading ? 'Processing images...' : 'Upload images here (max 20)' }}
                </div>
              </template>
            </el-upload>

            <el-dialog v-model="dialogVisible" title="Image Preview" width="75%">
              <img :src="dialogImageUrl" alt="Preview Image" class="preview-image" />
            </el-dialog>
          </div>
        </el-form-item>
      </div>

      <!-- Message si pas de permission upload -->
      <div v-else-if="isEdit" class="upload-disabled-warning">
        <el-alert
          type="info"
          :closable="false"
          show-icon
        >
          <template #title>
            ℹ️ Vous n'avez pas la permission d'uploader des images sur ce projet.
          </template>
          <template #default>
            <p>Les images existantes restent visibles mais vous ne pouvez pas en ajouter de nouvelles.</p>
          </template>
        </el-alert>
      </div>

      <div class="form-actions">
        <el-button
          data-test="projectFormCancelButton"
          @click="resetForm(ruleFormRef)"
          size="large"
          class="action-button"
          :disabled="isLoading"
        >
          Cancel
        </el-button>
        <el-button
          data-test="projectFormSubmitButton"
          type="primary"
          @click="onSubmit(ruleFormRef)"
          size="large"
          class="action-button submit-button"
          :loading="isLoading"
          :disabled="isLoading"
        >
          <template v-if="!isLoading">
            {{ isEdit ? "Save Changes" : "Create Project" }}
          </template>
          <template v-else>
            {{ isEdit ? "Saving..." : "Creating..." }}
          </template>
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch } from "vue";
import { reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import service from "@/service";
import { useProjectStore } from "@/store/useProjectModule";
import { useRoute, useRouter } from "vue-router";
import type { ElForm } from "element-plus";
import { t } from "@/core/i18n/translate";
import { useAuthStore } from "@/store/useAuth";
import { Plus, Loading } from "@element-plus/icons-vue";
import type { UploadProps, UploadUserFile } from "element-plus";
import { uploadImagesToCloudinary } from "@/core/helpers/config";
import { ElMessage } from "element-plus";
const { currentUser } = storeToRefs(useAuthStore());
// Props
const props = defineProps({
  isEdit: { type: Boolean, default: false },
  canUpload: { type: Boolean, default: true },
});
let users = ref([]);
const { project, error } = storeToRefs(useProjectStore());
const { getProjectById, createProject, editProject, resetProject } = useProjectStore();
const route = useRoute();
const router = useRouter();
const ruleFormRef = ref<InstanceType<typeof ElForm>>();
const isLoading = ref<boolean>(false);
const loadingProgress = ref(0);
const loadingMessage = ref('');
const rules = reactive({
  title: [
    {
      required: true,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
});
const fileList = ref<UploadUserFile[]>([]);
const dialogImageUrl = ref("");
const dialogVisible = ref(false);
const handleRemove: UploadProps["onRemove"] = (uploadFile, uploadFiles) => {
  console.log('Image removed:', uploadFile);
};

const handlePictureCardPreview: UploadProps["onPreview"] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url || "";
  dialogVisible.value = true;
};

const handleExceed: UploadProps["onExceed"] = () => {
  ElMessage.warning("You can only upload up to 20 images");
};

// ✅ Fonction corrigée pour sauvegarder les images
const handleSubmitForm = async () => {
  isLoading.value = true;
  loadingProgress.value = 0;

  try {
    // Step 1: Validation
    loadingMessage.value = 'Validating project data...';
    loadingProgress.value = 10;

    // Step 2: Upload new images to Cloudinary
    const existingImages: any[] = [];
    const newFilesToUpload: UploadUserFile[] = [];

    // Séparer les images existantes des nouvelles
    for (const file of fileList.value) {
      if (file.url && !file.url.startsWith("blob:")) {
        // Image déjà uploadée (existante)
        existingImages.push({
          id: file.id,
          name: file.name,
          url: file.url,
        });
      } else if (file.raw || file.url?.startsWith("blob:")) {
        // Nouvelle image à uploader
        newFilesToUpload.push(file);
      }
    }

    let uploadedImages: any[] = [];
    
    if (newFilesToUpload.length > 0) {
      loadingMessage.value = `Uploading ${newFilesToUpload.length} new image(s) to cloud storage...`;
      loadingProgress.value = 40;
      
      ElMessage.info({
        message: `Uploading ${newFilesToUpload.length} new image(s)...`,
        duration: 3000,
      });

      // Upload des nouvelles images
      const uploadedUrls = await uploadImagesToCloudinary(newFilesToUpload);
      
      uploadedImages = uploadedUrls.map((url, index) => ({
        name: newFilesToUpload[index]?.name || `image-${Date.now()}-${index}`,
        url: url
      }));
      
      loadingProgress.value = 70;
      loadingMessage.value = 'Images uploaded successfully. Saving project...';
    } else {
      loadingProgress.value = 70;
      loadingMessage.value = props.isEdit ? 'Updating project...' : 'Saving project...';
    }

    // Step 3: Combine existing and new images
    const allImages = [...existingImages, ...uploadedImages];

    // Step 4: Prepare project data
    const projectData: any = {
      title: project.value.title,
      description: project.value.description,
      tool: project.value.tool,
    };

    // Ajouter l'utilisateur si sélectionné
    if (project.value.user?.id) {
      projectData.user = { id: project.value.user.id };
    }

    // ✅ CORRECTION CRUCIALE : Ajouter les images au bon format
    if (allImages.length > 0) {
      projectData.images = allImages;
    }

    loadingProgress.value = 85;

    // Step 5: Save project
    if (props.isEdit) {
      loadingMessage.value = 'Updating project in database...';
      const id = route?.params?.id as string;
      await editProject({ id, data: projectData });
    } else {
      loadingMessage.value = 'Creating new project...';
      await createProject({ data: projectData });
    }

    loadingProgress.value = 100;
    loadingMessage.value = props.isEdit ? 'Project updated successfully!' : 'Project created successfully!';

  } catch (error) {
    console.error("Error uploading images or saving project:", error);
    ElMessage.error({
      message: "Failed to upload images or save project. Please try again.",
      duration: 5000,
    });
    throw error;
  } finally {
    setTimeout(() => {
      isLoading.value = false;
      loadingProgress.value = 0;
      loadingMessage.value = '';
    }, 500);
  }
};

const onSubmit = (formEl: InstanceType<typeof ElForm> | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      await handleSubmitForm();
      if (!!error.value) {
        ElMessage.error({
          message: error.value?.message || "An error occurred while saving the project",
          duration: 5000,
        });
        console.log(error, "error");
      } else {
        ElMessage.success({
          message: props.isEdit ? "Project updated successfully!" : "Project created successfully!",
          duration: 4000,
        });
        router.push({ name: `${currentUser.value.role}-list-project` });
        resetProject();
      }
    } else {
      console.log("error submit!");
      return false;
    }
  });
};

const resetForm = (formEl: InstanceType<typeof ElForm> | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  resetProject();
  fileList.value = [];
};

const getCurrentProject = async (id: string) => {
  if (props.isEdit) {
    await getProjectById(id);

    // ✅ CORRECTION : Populer fileList avec les images existantes
    if (project.value.images && Array.isArray(project.value.images)) {
      fileList.value = project.value.images.map((img: any) => ({
        name: img.name || img.url.split('/').pop() || 'image',
        url: img.url,
        id: img.id,
        status: 'success' as const,
      }));
    }
  }
};

const getListOfUser = async () => {
  try {
    const { data } = await service.nest.userControllerFindMany({
      skip: 0,
      take: 1000,
    });
    users.value = data?.paginatedResult ?? [];
  } catch (err) {
    console.error("Error fetching users:", err);
    users.value = [];
  }
};

// ✅ Watch pour s'assurer que project est chargé
watch(project, (newProject) => {
  if (newProject && props.isEdit && newProject.images) {
    if (fileList.value.length === 0 && newProject.images.length > 0) {
      fileList.value = newProject.images.map((img: any) => ({
        name: img.name || img.url.split('/').pop() || 'image',
        url: img.url,
        id: img.id,
        status: 'success' as const,
      }));
    }
  }
}, { deep: true });

onMounted(async () => {
  const id = route.params.id as string;
  
  if (!props.isEdit) {
    resetProject();      // ← ajoute ça
    fileList.value = [];
  }
  
  await getListOfUser();
  await getCurrentProject(id);
});
</script>

<style lang="scss" scoped>
.project-form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: relative;
}

.form-header {
  margin-bottom: 2.5rem;
  text-align: center;

  h2 {
    color: #0077b6;
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #6c757d;
    font-size: 1rem;
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;

  .loading-content {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    max-width: 450px;
    min-width: 350px;

    .loading-spinner {
      font-size: 3rem;
      color: #0077b6;
      margin-bottom: 1rem;
      animation: spin 1s linear infinite;
    }

    h3 {
      color: #0077b6;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    p {
      color: #6c757d;
      margin-bottom: 1.5rem;
      font-size: 1rem;
      line-height: 1.5;
    }

    .loading-progress {
      margin-top: 1rem;
    }
  }
}

.project-form {
  transition: all 0.3s ease;

  &.form-loading {
    opacity: 0.7;
    pointer-events: none;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .form-item {
    margin-bottom: 1.5rem;

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #495057;
      padding-bottom: 0.5rem;
      font-size: 0.95rem;
    }
  }

  .user-select {
    width: 100%;
  }

  .user-option {
    display: flex;
    justify-content: space-between;
    width: 100%;

    .user-id {
      color: #6c757d;
      font-size: 0.85rem;
    }

    .user-name {
      font-weight: 500;
    }
  }
}

.full-width-section {
  margin-bottom: 2rem;

  .upload-container {
    border: 1px dashed #dee2e6;
    border-radius: 8px;
    padding: 1.5rem;
    background-color: #f8f9fa;
    transition: all 0.3s ease;

    &.upload-loading {
      opacity: 0.6;
      background-color: #f1f3f4;
    }

    :deep(.el-upload--picture-card) {
      width: 120px;
      height: 120px;
      line-height: 120px;
      margin: 0 8px 8px 0;
    }

    :deep(.el-upload-list--picture-card) {
      display: flex;
      flex-wrap: wrap;
    }

    :deep(.el-upload-list__item) {
      width: 120px !important;
      height: 120px !important;
    }

    .upload-tip {
      margin-top: 1rem;
      color: #6c757d;
      font-size: 0.85rem;
      transition: color 0.3s ease;
    }
  }

  .preview-image {
    width: 100%;
    max-height: 70vh;
    object-fit: contain;
  }
}

.upload-disabled-warning {
  margin: 20px 0;
  
  :deep(.el-alert) {
    border-radius: 8px;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
  margin-top: 1.5rem;

  .action-button {
    min-width: 150px;
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    transition: all 0.3s ease;

    &.submit-button {
      background-color: #0077b6;
      border-color: #0077b6;

      &:hover:not(:disabled) {
        background-color: darken(#0077b6, 10%);
        border-color: darken(#0077b6, 10%);
      }

      &:disabled {
        opacity: 0.7;
      }
    }
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
