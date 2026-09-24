<template>
  <div class="mx-auto py-5 ms-4 me-4 h-100">
    <el-card
      shadow="never"
      class="card h-100"
      :body-style="{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }"
    >
      <el-button
        color="#606266"
        class="button__excel"
        :disabled="imageList.length === 0"
        @click="dataToExcel"
        >Export to EXCEL</el-button
      >
      <el-table
        :data="imageList"
        :row-style="{ background: '$primary-500' }"
        v-loading="isLoading"
      >
        <el-table-column :prop="'id'" :label="'id'" width="80">
          <template #default="scope">
            <el-tooltip placement="right-start">
              <template #content>
                <span>{{ scope.row.id }}</span>
              </template>
              <router-link
                :data-test="`imageList_${imageList[scope.$index].id}`"
                :to="`/${currentUser.role}/${entityPluralName}/${
                  imageList[scope.$index].id
                }`"
                >{{ scope.row.id.substring(0, 4) }}...</router-link
              >
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          v-for="fieldName in fieldsName"
          :key="fieldName"
          :prop="fieldName"
          :label="fieldName.charAt(0).toUpperCase() + fieldName.slice(1)"
        />
        <el-table-column prop="actions" align="right" width="150">
          <template #default="scope">
            <router-link
              :data-test="`imageList${fieldName}EditLink_${
                imageList[scope.$index].id
              }`"
              :to="`/${currentUser.role}/${entityPluralName}/edit/${
                imageList[scope.$index].id
              }`"
              :underline="false"
              type="primary"
              class="me-3"
            >
              <el-button icon="Edit" circle plain link type="success" />
            </router-link>

            <el-button
              :data-test="`imageList${fieldName}DeleteBtn_${
                imageList[scope.$index].id
              }`"
              @click="() => handleOpenConfirmModal(imageList[scope.$index]?.id)"
              icon="Delete"
              circle
              plain
              type="danger"
            />
            <ConfirmModal
              :title="$t('confirmModal.deleteTitle')"
              :isLoading="deleteLoading"
              :isOpenModal="
                isOpenModal && modalId === imageList[scope.$index].id
              "
              @close-confirm-modal="
                isOpenModal = false;
                modalId = null;
              "
              @approve-confirm-modal="
                () => handleRemoveEntity(imageList[scope.$index]?.id)
              "
            >
              <span>{{ $t("confirmModal.deleteContent") }} </span>
            </ConfirmModal>
          </template>
        </el-table-column>
      </el-table>

      <div class="footer__wrapper">
        <Pagination
          :itemsPerPage="imagePagination.take"
          :set-items-per-page="setItemsPerPage"
          :page="Math.floor(imagePagination.skip / imagePagination.take) + 1"
          :current-page-change="currentPageChange"
          :total="imagePagination.total"
          :pages-array="[5, 20, 50, 100]"
        />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, defineAsyncComponent } from "vue";
import { setCurrentPageBreadcrumbs } from "@/core/helpers/config";
import { storeToRefs } from "pinia";
import { useImageStore } from "@/store/useImageModule";
import Pagination from "@/components/shared/pagination/Pagination.vue";
import { useBodyStore } from "@/store/useBodyModule";
import * as XLSX from "xlsx";
import { useAuthStore } from "@/store/useAuth";
const { currentUser } = storeToRefs(useAuthStore());

const ConfirmModal = defineAsyncComponent(
  () => import("@/components/modals/ConfirmModal.vue")
);
const entityPluralName = "images";
const fieldsName = ref(["name", "project", "annotations"]);
const isOpenModal = ref(false);
const modalId = ref<string | null>(null);
const { isLoading } = storeToRefs(useBodyStore());
const { imageList, imagePagination, imageExcelFile } = storeToRefs(
  useImageStore()
);
const {
  fetchImages,
  deleteImage,
  fetchDataExcelImages,
  softDeleteImage,
} = useImageStore();

async function dataToExcel() {
  await fetchDataExcelImages();
  const workbook = XLSX.read(imageExcelFile.value.toString());
  XLSX.writeFile(workbook, "imageData.xlsx");
}
const deleteLoading = ref<boolean>(false);
const handleRemoveEntity = async (id: string) => {
  deleteLoading.value = true;
  await softDeleteImage(id);
  deleteLoading.value = false;
};
const handleOpenConfirmModal = (id: string) => {
  isOpenModal.value = true;
  modalId.value = id;
};
const setItemsPerPage = async (event: any) => {
  await fetchImages({
    skip: 0,
    take: parseInt(event.target.value),
  });
};
const currentPageChange = async (val: number) => {
  await fetchImages({
    skip: (val - 1) * imagePagination.value.take,
    take: imagePagination.value.take,
  });
};
onMounted(async () => {
  setCurrentPageBreadcrumbs(entityPluralName, []);
  await fetchImages({
    skip: 0,
    take: Number(localStorage.getItem("take")) || 5,
  });
  isLoading.value = false;
});
</script>

<style scoped lang="scss">
.footer__wrapper {
  border-top: solid 1px $bd-card-color;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-inline: 20px;
  height: 76px;
  margin-bottom: 0;
}

.button__excel {
  display: max-content;
  align-self: end;
}

:deep(.el-card__body) {
  justify-content: flex-start !important;
}
:deep(.el-table) {
  margin-top: 17px;
}
:deep(.el-table .cell) {
  line-height: 39px;
}
</style>
