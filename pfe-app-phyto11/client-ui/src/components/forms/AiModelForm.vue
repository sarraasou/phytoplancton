<template>
  <el-form
    :model="aimodel"
    label-width="120px"
    :rules="rules"
    ref="ruleFormRef"
  >
    <el-form-item label="name" prop="name">
      <el-input v-model="aimodel.name" data-test="aimodelFormname" />
    </el-form-item>
    <el-form-item label="type" prop="type">
      <el-input v-model="aimodel.type" data-test="aimodelFormtype" />
    </el-form-item>
    <div class="d-flex justify-content-end">
      <el-button
        data-test="aimodelFormCancelButton"
        @click="resetForm(ruleFormRef)"
        >Cancel</el-button
      >
      <el-button
        data-test="aimodelFormSubmitButton"
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
import { supabase } from "@/core/services/SupabaseClientService";

import { useAiModelStore } from "@/store/useAiModelModule";
import { useRoute, useRouter } from "vue-router";
import type { ElForm } from "element-plus";
import { Components } from "@tekab-dev-team/storybook-devfactory";
import { t } from "@/core/i18n/translate";
import { useAuthStore } from "@/store/useAuth";
const { currentUser } = storeToRefs(useAuthStore());

const props = defineProps({
  isEdit: { type: Boolean, default: false },
});

const { aimodel, error } = storeToRefs(useAiModelStore());
const {
  getAiModelById,
  createAiModel,
  editAiModel,
  resetAiModel,
} = useAiModelStore();

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
  type: [
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
    return await editAiModel({ id });
  } else await createAiModel();
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
        router.push({ name: `${currentUser.value.role}-list-aimodel` });
        resetAiModel();
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
  resetAiModel();
};
const getCurrentAiModel = async (id: string) => {
  if (props.isEdit) {
    await getAiModelById(id);
  }
};

onMounted(async () => {
  const id = route.params.id as string;

  await getCurrentAiModel(id);
});
</script>
