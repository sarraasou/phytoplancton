<template>
  <el-form :model="image" label-width="120px" :rules="rules" ref="ruleFormRef">

    <el-form-item label="name" prop="name">
      <el-input v-model="image.name" data-test="imageFormname" />
    </el-form-item>

    <el-form-item label="project_id" prop="project">
      <el-select
        v-model="image.project.id"
        data-test="imageFormprojectId"
        class="m-2"
        placeholder="Select"
        size="large"
      >
        <el-option
          v-for="project in projects"
          :data-test="project.id"
          :label="project.title ?? project.id"
          :key="project.id"
          :value="project.id"
        />
      </el-select>
    </el-form-item>

    <div class="d-flex justify-content-end">
      <el-button data-test="imageFormCancelButton" @click="resetForm(ruleFormRef)">
        Cancel
      </el-button>
      <el-button
        data-test="imageFormSubmitButton"
        type="primary"
        :loading="isLoading"
        @click="onSubmit(ruleFormRef)"
      >
        {{ isEdit ? "Save" : "Create" }}
      </el-button>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import { storeToRefs } from "pinia";
import service from "@/service";
import { useImageStore } from "@/store/useImageModule";
import { useRoute, useRouter } from "vue-router";
import type { ElForm } from "element-plus";
import { Components } from "@tekab-dev-team/storybook-devfactory";
import { t } from "@/core/i18n/translate";
import { useAuthStore } from "@/store/useAuth";

const { currentUser } = storeToRefs(useAuthStore());

const props = defineProps({
  isEdit: { type: Boolean, default: false },
});

let projects = ref([]);
const { image, error } = storeToRefs(useImageStore());
const { getImageById, createImage, editImage, resetImage } = useImageStore();

const route = useRoute();
const router = useRouter();
const ruleFormRef = ref<InstanceType<typeof ElForm>>();
const isLoading = ref<boolean>(false);

const rules = reactive({
  name: [
    {
      required: true,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  project: [
    {
      required: true,
      validator: (_rule: any, _val: any, callback: any) => {
        if (!image.value?.project?.id) {
          callback(new Error(t("entityForm.validation.required")));
        } else {
          callback();
        }
      },
      trigger: "change",
    },
  ],
});

const handleSubmitForm = async () => {
  isLoading.value = true;
  try {
    if (props.isEdit) {
      const id = route?.params?.id as string;
      await editImage({ id });
    } else {
      // ✅ url requis par le backend — envoyé automatiquement sans champ visible
      (image.value as any).url = (image.value as any).url || "";
      // ✅ project : uniquement { id }
      if (image.value.project?.id) {
        image.value.project = { id: image.value.project.id };
      }
      await createImage();
    }
  } finally {
    isLoading.value = false;
  }
};

const onSubmit = (formEl: InstanceType<typeof ElForm> | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      await handleSubmitForm();
      if (!!error.value) {
        const msg = Array.isArray(error.value?.message)
          ? error.value.message.join(", ")
          : error.value?.message ?? "Erreur";
        Components.ElMessage.error(msg);
        console.error("Image form error:", error.value);
      } else {
        router.push({ name: `${currentUser.value.role}-list-image` });
        resetImage();
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
  resetImage();
};

const getCurrentImage = async (id: string) => {
  if (props.isEdit) await getImageById(id);
};

const getListOfProject = async () => {
  try {
    const { data } = await service.nest.projectControllerFindMany({
      skip: 0,
      take: 1000,
    });
    projects.value = data?.paginatedResult ?? [];
  } catch (e) {
    console.error("Error fetching projects:", e);
    projects.value = [];
  }
};

onMounted(async () => {
  const id = route.params.id as string;
  await getListOfProject();
  await getCurrentImage(id);
});
</script>