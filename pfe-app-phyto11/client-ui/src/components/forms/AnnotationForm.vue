<template>
  <el-form
    :model="annotation"
    label-width="120px"
    :rules="rules"
    ref="ruleFormRef"
  >
    <el-form-item label="aimodel_id" prop="aimodel">
      <el-select
        v-model="annotation.aimodel.id"
        data-test="annotationFormaimodelId"
        class="m-2"
        placeholder="Select"
        size="large"
      >
        <el-option
          v-for="aimodel in aimodels"
          :data-test="aimodel.id"
          :label="aimodel.id"
          :key="aimodel.id"
          :value="aimodel.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="image_id" prop="image">
      <el-select
        v-model="annotation.image.id"
        data-test="annotationFormimageId"
        class="m-2"
        placeholder="Select"
        size="large"
      >
        <el-option
          v-for="image in images"
          :data-test="image.id"
          :label="image.id"
          :key="image.id"
          :value="image.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="validatedBy_id" prop="validatedBy">
      <el-select
        v-model="annotation.validatedBy.id"
        data-test="annotationFormvalidatedById"
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
    <div class="d-flex justify-content-end">
      <el-button
        data-test="annotationFormCancelButton"
        @click="resetForm(ruleFormRef)"
        >Cancel</el-button
      >
      <el-button
        data-test="annotationFormSubmitButton"
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

import { useAnnotationStore } from "@/store/useAnnotationModule";
import { useRoute, useRouter } from "vue-router";
import type { ElForm } from "element-plus";
import { Components } from "@tekab-dev-team/storybook-devfactory";
import { t } from "@/core/i18n/translate";
import { useAuthStore } from "@/store/useAuth";
const { currentUser } = storeToRefs(useAuthStore());

const props = defineProps({
  isEdit: { type: Boolean, default: false },
});
let aimodels = ref([]);
let images = ref([]);
let users = ref([]);
const { annotation, error } = storeToRefs(useAnnotationStore());
const {
  getAnnotationById,
  createAnnotation,
  editAnnotation,
  resetAnnotation,
} = useAnnotationStore();

const route = useRoute();
const router = useRouter();
const ruleFormRef = ref<InstanceType<typeof ElForm>>();
const isLoading = ref<boolean>(false);
const rules = reactive({
  aimodel: [
    {
      required: true,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  image: [
    {
      required: true,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
  validatedBy: [
    {
      required: false,
      message: `${t("entityForm.validation.required")}`,
      trigger: "blur",
    },
  ],
});

const handleSubmitForm = async () => {
  isLoading.value = true;
  if (props.isEdit) {
    const id = route?.params?.id as string;
    return await editAnnotation({ id });
  } else await createAnnotation();
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
        router.push({ name: `${currentUser.value.role}-list-annotation` });
        resetAnnotation();
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
  resetAnnotation();
};
const getCurrentAnnotation = async (id: string) => {
  if (props.isEdit) {
    await getAnnotationById(id);
  }
};

const getListOfAiModel = async () => {
  try {
    const { data } = await service.nest.aiModelControllerFindMany({
      skip: 0,
      take: 1000,
    });
    aimodels.value = data?.paginatedResult ?? [];
  } catch (error) {
    console.error("Error fetching aimodels:", error);
    aimodels.value = [];
  }
};
const getListOfImage = async () => {
  try {
    const { data } = await service.nest.imageControllerFindMany({
      skip: 0,
      take: 1000,
    });
    images.value = data?.paginatedResult ?? [];
  } catch (error) {
    console.error("Error fetching images:", error);
    images.value = [];
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

onMounted(async () => {
  const id = route.params.id as string;
  await getListOfAiModel();
  await getListOfImage();
  await getListOfUser();
  await getCurrentAnnotation(id);
});
</script>
