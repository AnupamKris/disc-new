<template>
  <div class="call-notif">
    <p>Incoming Call</p>
    <h3>{{ callerId }}</h3>
    <div class="buttons">
      <button @click="acceptCall"><ion-icon name="call"></ion-icon></button>
      <button @click="rejectCall"><ion-icon name="close"></ion-icon></button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  callerId: String,
});

const emit = defineEmits(["acceptCall", "rejectCall"]);

const acceptCall = () => {
  emit("acceptCall");
};

const rejectCall = () => {
  emit("rejectCall");
};
</script>

<style lang="scss" scoped>
.call-notif {
  position: fixed;
  bottom: 10px;
  right: 10px;

  background: #282c34;
  height: 110px;
  width: 200px;

  padding: 0 10px;

  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5);

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  border-radius: 5px;
  color: #abb2bf;

  h3 {
    width: 100%;
  }

  p {
    padding-top: 10px;
    font-size: 12px;
    width: 100%;
  }

  .buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 40px;

    button {
      height: 35px;
      width: 48%;
      border-radius: 5px;
      border: none;
      outline: none;

      display: flex;
      justify-content: center;
      align-items: center;

      font-size: 18px;

      &:nth-child(1) {
        background: #2ecc71;
        color: #282c34;
      }

      &:nth-child(2) {
        background: #e74c3c;
        color: #282c34;
      }
    }
  }
}
</style>
