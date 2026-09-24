<template>
  <el-form
    :model="collaborator"
    label-width="120px"
    :rules="rules"
    ref="ruleFormRef"
  >
    <el-form-item label="user_id" prop="user">
      <el-select
        v-model="collaborator.user.id"
        data-test="collaboratorFormuserId"
        class="m-2"
        placeholder="Select"
        size="large"
      >
        <el-option
          v-for="user in users"
          :data-test="user.id"
          :label="user.id"
          :key="user.id"
          :value="user.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="project_id" prop="project">
      <el-select
        v-model="collaborator.project.id"
        data-test="collaboratorFormprojectId"
        class="m-2"
        placeholder="Select"
        size="large"
      >
        <el-option
          v-for="project in projects"
          :data-test="project.id"
          :label="project.id"
          :key="project.id"
          :value="project.id"
        />
      </el-select>
    </el-form-item>
    <div class="d-flex justify-content-end">
      <el-button
        data-test="collaboratorFormCancelButton"
        @click="resetForm(ruleFormRef)"
        >Cancel</el-button
      >
      <el-button
        data-test="collaboratorFormSubmitButton"
        type="primary"
        @click="onSubmit(ruleFormRef)"
        >{{ isEdit ? "Save" : "Create" }}</el-button
      >
    </div>
  </el-form>
</template>
<script lang="ts" setup>
import { onMounted } from "vue";
import { reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import service from "@/service";

import { useCollaboratorStore } from "@/store/useCollaboratorModule";
import { useRoute, useRouter } from "vue-router";
import type { ElForm } from "element-plus";
import { Components } from "@tekab-dev-team/storybook-devfactory";
import { t } from "@/core/i18n/translate";
import { useAuthStore } from "@/store/useAuth";
const { currentUser } = storeToRefs(useAuthStore());

const props = defineProps({
  isEdit: { type: Boolean, default: false },
});
let users = ref([]);
let projects = ref([]);
const { collaborator, error } = storeToRefs(useCollaboratorStore());
const {
  getCollaboratorById,
  createCollaborator,
  editCollaborator,
  resetCollaborator,
} = useCollaboratorStore();

const route = useRoute();
const router = useRouter();
const ruleFormRef = ref<InstanceType<typeof ElForm>>();
const isLoading = ref<boolean>(false);
const rules = reactive({
  user: [
    {
      required: true,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  project: [
    {
      required: true,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
});

const handleSubmitForm = async () => {
  isLoading.value = true;
  if (props.isEdit) {
    const id = route?.params?.id as string;
    return await editCollaborator({ id });
  } else await createCollaborator();
};

const onSubmit = (formEl: InstanceType<typeof ElForm> | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      await handleSubmitForm();
      if (!!error.value) {
        Components.ElMessage.error(error.value?.message);
        console.log(error, "error");
      } else {
        router.push({ name: `${currentUser.value.role}-list-collaborator` });
        resetCollaborator();
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
  resetCollaborator();
};
const getCurrentCollaborator = async (id: string) => {
  if (props.isEdit) {
    await getCollaboratorById(id);
  }
};

const getListOfUser = async () => {
  try {
    const { data } = await service.nest.userControllerFindMany({
      skip: 0,
      take: 1000,
    });
    users.value = data?.paginatedResult ?? [];
  } catch (error) {
    console.error("Error fetching users:", error);
    users.value = [];
  }
};
const getListOfProject = async () => {
  try {
    const { data } = await service.nest.projectControllerFindMany({
      skip: 0,
      take: 1000,
    });
    projects.value = data?.paginatedResult ?? [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    projects.value = [];
  }
};

onMounted(async () => {
  const id = route.params.id as string;
  await getListOfUser();
  await getListOfProject();
  await getCurrentCollaborator(id);
});
</script>
