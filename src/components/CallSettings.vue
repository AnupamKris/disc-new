<template>
  <div class="backdrop">
    <div class="settings"></div>
    <select name="" id="">
      <option
        v-for="device in rtcData.audioDevices"
        :key="device.id"
        :value="device.id"
      >
        {{ device.label }}
      </option>
    </select>
    <select name="" id="">
      <option
        v-for="device in rtcData.videoDevices"
        :key="device.id"
        :value="device.id"
      >
        {{ device.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { useNewRtcDataStore } from "@/stores/newRtcData";

const rtcData = useNewRtcDataStore();
</script>

<style lang="scss" scoped>
.backdrop {
  position: fixed;
  top: 40px;

  right: 0;

  height: calc(100% - 40px);
  width: 100%;

  z-index: 10;

  display: flex;
  justify-content: center;
  align-items: center;
  background: #00000080;
}
</style>
