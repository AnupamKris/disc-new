<template>
  <button>{{ text }}</button>
</template>

<script setup>
const props = defineProps({
  text: String,
});
</script>

<style lang="scss" scoped>
button {
  height: 40px;
  width: 80%;

  background: #4d78cc;
  color: #282c34;

  border: none;
  border-radius: 5px;

  margin-top: 10px;
  font-size: 16px;
}
</style>
