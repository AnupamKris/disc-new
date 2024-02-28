<template>
  <div
    class="popup"
    @mousedown="startDrag"
    @mousemove="drag"
    @mouseleave="stopDrag"
    @mouseup="stopDrag"
    :style="position"
  >
    <div class="title">
      <h2>{{ rtcData.callerId }}</h2>
    </div>
    <div class="buttons">
      <button @click="rtcData.toggleMute">
        <ion-icon :name="rtcData.isMuted ? 'mic-off' : 'mic'"></ion-icon>
      </button>
      <button @click="rtcData.rejectCall" class="reject">
        <ion-icon name="close"></ion-icon>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRtcDataStore } from "../stores/rtcData";

const rtcData = useRtcDataStore();
const dragging = ref(false);

const pos = ref({
  bottom: 10,
  right: 10,
});

const startDrag = (e) => {
  dragging.value = true;
};

const drag = (e) => {
  if (dragging.value) {
    pos.value.bottom -= e.movementY;
    pos.value.right -= e.movementX;
  }
};

const stopDrag = () => {
  dragging.value = false;
};

const position = computed(() => {
  return {
    bottom: `${pos.value.bottom}px`,
    right: `${pos.value.right}px`,
  };
});
</script>

<style lang="scss" scoped>
.popup {
  position: fixed;
  bottom: 10px;
  right: 10px;

  height: 100px;

  background: #282c34;

  padding: 0 10px;
  border-radius: 10px;
  border-top: 18px solid #3b4048;

  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5);

  display: flex;
  flex-direction: column;

  color: #abb2bf;
  z-index: 1000;

  .buttons {
    display: flex;
    justify-content: center;
    align-items: center;

    button {
      height: 30px;
      width: 30px;

      display: flex;
      justify-content: center;
      align-items: center;

      cursor: pointer;
      border-radius: 50%;
      background: #3b4048;
      color: #abb2bf;
      outline: none;
      border: none;

      margin: 0 5px;
      margin-top: 5px;
    }

    .reject {
      background: #f04747;
      color: #fff;
    }
  }
}
</style>
