<template>
  <div>Home</div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

onMounted(() => {
  console.log("Home view mounted");
  router.push("/login");
});
</script>

<style lang="scss" scoped></style>
