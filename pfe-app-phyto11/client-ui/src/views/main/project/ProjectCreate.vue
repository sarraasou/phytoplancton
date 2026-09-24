<template>
  <div class="project-create-page">
    <ProjectForm :isEdit="false" />
  </div>
</template>

<script setup lang="ts">
import ProjectForm from "@/components/forms/ProjectForm.vue";
import { setCurrentPageBreadcrumbs } from "@/core/helpers/config";
import { onMounted } from "vue";

onMounted(() => {
  setCurrentPageBreadcrumbs("Create Project", ["Projects"]);
});
</script>

<style lang="scss" scoped>
.project-create-page {
  padding: 2rem;
  background-color: #f8f9fa;
  min-height: calc(100vh - 64px); // Adjust based on your header height
}
</style>