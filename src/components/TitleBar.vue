<template>
  <div class="titlebar" data-tauri-drag-region>
    <p>Super Chat</p>
    <div class="controls">
      <div class="ctl" @click="minimize">
        <ion-icon name="remove-outline"></ion-icon>
      </div>
      <div class="ctl" @click="toggleMaximize">
        <ion-icon name="stop-outline"></ion-icon>
      </div>
      <div class="ctl" @click="close">
        <ion-icon name="close-outline"></ion-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { appWindow } from "@tauri-apps/api/window";

const toggleMaximize = () => {
  appWindow.toggleMaximize();
};

const minimize = () => {
  appWindow.minimize();
};

const close = () => {
  appWindow.close();
};
</script>

<style lang="scss" scoped>
.titlebar {
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #282c34;
  color: #abb2bf;
  border-bottom: 1px solid #3b4048;

  position: relative;

  p {
    pointer-events: none;
    padding: 0 20px;
  }

  .controls {
    position: absolute;
    right: 0;

    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    .ctl {
      width: 40px;
      height: 100%;

      display: flex;
      justify-content: center;
      align-items: center;

      font-size: 24px;

      color: #abb2bf;

      transition: 0.3s;
    }

    .ctl:hover {
      background: #3e4451;
      cursor: pointer;

      &:last-child {
        background: #ff7c7c;
        color: #282c34;
      }
    }
  }
}
</style>
