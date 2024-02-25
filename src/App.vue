<template>
  <TitleBar />
  <Suspense>
    <RouterView />
  </Suspense>
</template>

<script setup>
import TitleBar from "./components/TitleBar.vue";
</script>

<style lang="scss" scoped></style>
