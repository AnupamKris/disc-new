<template>
  <div>Home</div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

onMounted(() => {
  console.log("Home view mounted");
});
</script>

<style lang="scss" scoped></style>
