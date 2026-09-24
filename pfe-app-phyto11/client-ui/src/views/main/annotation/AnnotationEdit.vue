<template>
  <div
    class="col-12 col-md-8 mx-auto mt-4 border border-secondary p-5 bg-white"
  >
    <h3 class="text-center text-primary my-4">Edit Annotation</h3>
    <AnnotationForm isEdit />
  </div>
</template>
<script lang="ts" setup>
import AnnotationForm from "@/components/forms/AnnotationForm.vue";
import { setCurrentPageBreadcrumbs } from "@/core/helpers/config";
import { onMounted } from "vue";
onMounted(() => {
  setCurrentPageBreadcrumbs("Edit annotation", ["annotations"]);
});
</script>
