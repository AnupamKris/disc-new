<template>
  <div class="alert">
    <ion-icon
      :name="type === 'error' ? 'alert-circle' : 'information-circle'"
    ></ion-icon>
    <p :class="type">{{ message }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  message: String,
  type: String,
});
</script>

<style lang="scss" scoped>
.alert {
  position: fixed;
  right: 10px;
  bottom: 10px;

  background: #282c34;
  min-height: 80px;
  min-width: 200px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  border-radius: 5px;
  color: #abb2bf;

  ion-icon {
    font-size: 40px;
    margin: 0 10px;
  }

  p {
    padding: 10px;
    border-radius: 5px;
    width: calc(100% - 50px);

    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
