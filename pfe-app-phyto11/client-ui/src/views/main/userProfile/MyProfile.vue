<template>
  <div class="mx-auto py-5 ms-4 me-4 h-100 w-100 cards">
    <div style="width: 900px; height: 640px">
      <UserInfo />
    </div>
   
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import UserInfo from "@/components/shared/userProfile/UserInfo.vue";

export default defineComponent({
  setup() {
    return {};
  },
  components: { UserInfo },
});
</script>

<style lang="scss" scoped>
.card-header {
  align-items: center;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.box-card {
  width: 480px;
}


</style>
