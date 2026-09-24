<template>
  <div class="user-form-container">
    <div class="form-header">
      <h2>{{ isEdit ? 'Edit User' : 'Create New User' }}</h2>
      <p class="subtitle">Fill in the details below to {{ isEdit ? 'update' : 'create' }} a user</p>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <el-icon class="loading-spinner"><Loading /></el-icon>
        <h3>{{ isEdit ? 'Updating User' : 'Creating User' }}</h3>
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
      :model="user"
      label-width="150px"
      :rules="rules"
      ref="ruleFormRef"
      label-position="top"
      class="user-form"
      :class="{ 'form-loading': isLoading }"
    >
      <div class="form-grid">
        <!-- Left Column -->
        <div class="form-column">
          <el-form-item label="First Name" prop="firstName" class="form-item">
            <el-input
              v-model="user.firstName"
              placeholder="Enter user's first name"
              data-test="userFormfirstName"
              size="large"
              :disabled="isLoading"
            />
          </el-form-item>

          <el-form-item label="Last Name" prop="lastName" class="form-item">
            <el-input
              v-model="user.lastName"
              placeholder="Enter user's last name"
              data-test="userFormlastName"
              size="large"
              :disabled="isLoading"
            />
          </el-form-item>
        </div>

        <!-- Right Column -->
        <div class="form-column">
          <el-form-item label="Username" prop="username" class="form-item">
            <el-input
              v-model="user.username"
              placeholder="Enter username"
              data-test="userFormusername"
              size="large"
              :disabled="isLoading"
            />
          </el-form-item>

          <el-form-item label="Account Status" prop="isValid" class="form-item">
            <el-switch
              v-model="user.isValid"
              data-test="userFormisValid"
              :disabled="isLoading"
              active-text="Active"
              inactive-text="Inactive"
            />
          </el-form-item>
        </div>
      </div>

      <!-- Full Width Section -->
      <div class="full-width-section">
        <!-- Remplacer le select existant -->
<el-form-item label="User Role" prop="userRole" class="form-item">
  <el-select
    v-model="user.userRole"
    placeholder="Select user role"
    size="large"
    class="role-select"
    :disabled="isLoading"
  >
    <el-option label="Admin"      value="ADMIN"      />
    <el-option label="Expert"     value="EXPERT"     />
    <el-option label="User"       value="USER"       />
  </el-select>
</el-form-item>
      </div>

      <div class="form-actions">
        <el-button
          data-test="userFormCancelButton"
          @click="resetForm(ruleFormRef)"
          size="large"
          class="action-button"
          :disabled="isLoading"
        >
          Cancel
        </el-button>
        <el-button
          data-test="userFormSubmitButton"
          type="primary"
          @click="onSubmit(ruleFormRef)"
          size="large"
          class="action-button submit-button"
          :loading="isLoading"
          :disabled="isLoading"
        >
          <template v-if="!isLoading">
            {{ isEdit ? "Save Changes" : "Create User" }}
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
import { onMounted } from "vue";
import { reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import { supabase } from "@/core/services/SupabaseClientService";

import { useUserStore } from "@/store/useUserModule";
import { useRoute, useRouter } from "vue-router";
import type { ElForm } from "element-plus";
import { Components } from "@tekab-dev-team/storybook-devfactory";
import { t } from "@/core/i18n/translate";
import { useAuthStore } from "@/store/useAuth";
import { Loading } from "@element-plus/icons-vue";

const { currentUser } = storeToRefs(useAuthStore());

const props = defineProps({
  isEdit: { type: Boolean, default: false },
});

const { user, error } = storeToRefs(useUserStore());
const { getUserById, createUser, editUser, resetUser } = useUserStore();

const route = useRoute();
const router = useRouter();
const ruleFormRef = ref<InstanceType<typeof ElForm>>();
const isLoading = ref<boolean>(false);
const loadingProgress = ref(0);
const loadingMessage = ref('');

const rules = reactive({
  firstName: [
    {
      required: false,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  lastName: [
    {
      required: false,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  username: [
    {
      required: true,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  isValid: [
    {
      required: false,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  roles: [
    {
      required: true,
      message: `${t("entityForm.validation.required")}`,
      trigger: "change",
    },
  ],
});

const handleSubmitForm = async () => {
  isLoading.value      = true
  loadingProgress.value = 20
  loadingMessage.value  = 'Validating user data...'

  try {
    loadingProgress.value = 50
    loadingMessage.value  = props.isEdit ? 'Updating user...' : 'Creating user...'

    if (props.isEdit) {
      const id = route?.params?.id as string

      // ✅ Synchroniser roles[] avec userRole avant d'envoyer
      if (user.value.userRole) {
        user.value.roles = [user.value.userRole.toLowerCase()]
      }

      await editUser({ id })
    } else {
      // ✅ Idem pour la création
      if (user.value.userRole) {
        user.value.roles = [user.value.userRole.toLowerCase()]
      }
      await createUser()
    }

    loadingProgress.value = 100
    loadingMessage.value  = props.isEdit
      ? 'User updated successfully!'
      : 'User created successfully!'

  } catch (err) {
    console.error("Error saving user:", err)
    throw err
  } finally {
    setTimeout(() => {
      isLoading.value       = false
      loadingProgress.value = 0
      loadingMessage.value  = ''
    }, 500)
  }
}

const onSubmit = (formEl: InstanceType<typeof ElForm> | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      await handleSubmitForm();
      if (!!error.value) {
        Components.ElMessage.error({
          message: error.value?.message || "An error occurred while saving the user",
          duration: 5000,
        });
        console.log(error, "error");
      } else {
        Components.ElMessage.success({
          message: props.isEdit ? "User updated successfully!" : "User created successfully!",
          duration: 4000,
        });
        router.push({ name: `${currentUser.value.role}-list-user` });
        resetUser();
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
  resetUser();
};

const getCurrentUser = async (id: string) => {
  if (props.isEdit) {
    await getUserById(id);
  }
};

onMounted(async () => {
  const id = route.params.id as string;
  await getCurrentUser(id);
});
</script>

<style lang="scss" scoped>
.user-form-container {
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

// Loading Overlay Styles
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

.user-form {
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

  .role-select {
    width: 100%;
  }
}

.full-width-section {
  margin-bottom: 2rem;
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

// Spin animation
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>