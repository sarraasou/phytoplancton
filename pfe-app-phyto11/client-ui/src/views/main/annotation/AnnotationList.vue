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
        :disabled="annotationList.length === 0"
        @click="dataToExcel"
        >Export to EXCEL</el-button
      >
      <el-table
        :data="annotationList"
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
                :data-test="`annotationList_${annotationList[scope.$index].id}`"
                :to="`/${currentUser.role}/${entityPluralName}/${
                  annotationList[scope.$index].id
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
        >
          <template #default="scope">
            <span
              v-if="fieldName === 'result'"
              class="result-pill"
              :class="`result-pill--${String(scope.row.result || '').toLowerCase()}`"
            >
              {{ scope.row.result || '-' }}
            </span>
            <span v-else>{{ formatCellContent(scope.row[fieldName]) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="actions" align="right" width="150">
          <template #default="scope">
            <router-link
              :data-test="`annotationList${fieldName}EditLink_${
                annotationList[scope.$index].id
              }`"
              :to="`/${currentUser.role}/${entityPluralName}/edit/${
                annotationList[scope.$index].id
              }`"
              :underline="false"
              type="primary"
              class="me-3"
            >
              <el-button icon="Edit" circle plain link type="success" />
            </router-link>

            <el-button
              :data-test="`annotationList${fieldName}DeleteBtn_${
                annotationList[scope.$index].id
              }`"
              @click="
                () => handleOpenConfirmModal(annotationList[scope.$index]?.id)
              "
              icon="Delete"
              circle
              plain
              type="danger"
            />
            <ConfirmModal
              :title="$t('confirmModal.deleteTitle')"
              :isLoading="deleteLoading"
              :isOpenModal="
                isOpenModal && modalId === annotationList[scope.$index].id
              "
              @close-confirm-modal="
                isOpenModal = false;
                modalId = null;
              "
              @approve-confirm-modal="
                () => handleRemoveEntity(annotationList[scope.$index]?.id)
              "
            >
              <span>{{ $t("confirmModal.deleteContent") }} </span>
            </ConfirmModal>
          </template>
        </el-table-column>
      </el-table>

      <div class="footer__wrapper">
        <Pagination
          :itemsPerPage="annotationPagination.take"
          :set-items-per-page="setItemsPerPage"
          :page="
            Math.floor(annotationPagination.skip / annotationPagination.take) +
            1
          "
          :current-page-change="currentPageChange"
          :total="annotationPagination.total"
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
import { useAnnotationStore } from "@/store/useAnnotationModule";
import Pagination from "@/components/shared/pagination/Pagination.vue";
import { useBodyStore } from "@/store/useBodyModule";
import * as XLSX from "xlsx";
import { useAuthStore } from "@/store/useAuth";
const { currentUser } = storeToRefs(useAuthStore());

const ConfirmModal = defineAsyncComponent(
  () => import("@/components/modals/ConfirmModal.vue")
);
const entityPluralName = "annotations";
const fieldsName = ref(["result", "image", "aimodel", "validatedBy"]);
const isOpenModal = ref(false);
const modalId = ref<string | null>(null);
const { isLoading } = storeToRefs(useBodyStore());
const {
  annotationList,
  annotationPagination,
  annotationExcelFile,
} = storeToRefs(useAnnotationStore());
const {
  fetchAnnotations,
  deleteAnnotation,
  fetchDataExcelAnnotations,
  softDeleteAnnotation,
} = useAnnotationStore();

async function dataToExcel() {
  await fetchDataExcelAnnotations();
  const workbook = XLSX.read(annotationExcelFile.value.toString());
  XLSX.writeFile(workbook, "annotationData.xlsx");
}
const formatCellContent = (content: any): string => {
  if (content === null || content === undefined) return '-';

  if (Array.isArray(content)) {
    if (content.length === 0) return '-';
    return content
      .map((item: any) => {
        if (typeof item === 'string') return item.substring(0, 8) + '...';
        return item?.name || item?.email || item?.title || item?.username ||
               (item?.id ? item.id.substring(0, 8) + '...' : JSON.stringify(item));
      })
      .join(', ');
  }

  if (typeof content === 'object') {
    return content?.name || content?.email || content?.title || content?.username ||
           (content?.id ? content.id.substring(0, 8) + '...' : JSON.stringify(content));
  }

  if (typeof content === 'string' && content.length > 50) {
    return content.substring(0, 50) + '...';
  }

  return String(content);
};
const deleteLoading = ref<boolean>(false);
const handleRemoveEntity = async (id: string) => {
  deleteLoading.value = true;
  await softDeleteAnnotation(id);
  deleteLoading.value = false;
};
const handleOpenConfirmModal = (id: string) => {
  isOpenModal.value = true;
  modalId.value = id;
};
const setItemsPerPage = async (event: any) => {
  await fetchAnnotations({
    skip: 0,
    take: parseInt(event.target.value),
  });
};
const currentPageChange = async (val: number) => {
  await fetchAnnotations({
    skip: (val - 1) * annotationPagination.value.take,
    take: annotationPagination.value.take,
  });
};
onMounted(async () => {
  setCurrentPageBreadcrumbs(entityPluralName, []);
  await fetchAnnotations({
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

.result-pill {
  display: inline-flex;
  align-items: center;
  min-width: 86px;
  justify-content: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;

  &--karenia {
    color: #dc2626;
    background: #fee2e2;
    border-color: #ef4444;
  }

  &--alexandrium {
    color: #ea580c;
    background: #ffedd5;
    border-color: #f97316;
  }

  &--autres {
    color: #15803d;
    background: #dcfce7;
    border-color: #22c55e;
  }
}
</style>
