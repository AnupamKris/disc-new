<template>
  <div class="backdrop">
    <div class="settings">
      <h1>Audio Settings</h1>
      <label for="audioin">Audio Input</label>
      <select v-model="audioin" name="" id="audioin">
        <option
          v-for="device in rtcData.audioDevices"
          :key="device.deviceId"
          :value="device.deviceId"
        >
          {{ device.label }}
        </option>
      </select>
      <label for="videoin">Video Input</label>
      <select v-model="videoin" name="" id="videoin">
        <option
          v-for="device in rtcData.videoDevices"
          :key="device.deviceId"
          :value="device.deviceId"
        >
          {{ device.label }}
        </option>
      </select>
      <UIButton text="Save" @click="saveSettings" />
    </div>
  </div>
</template>

<script setup>
import { useNewRtcDataStore } from "@/stores/newRtcData";

const rtcData = useNewRtcDataStore();

const audioin = ref(rtcData.audioInputDevice);
const videoin = ref(rtcData.videoInputDevice);

const emit = defineEmits(["close"]);

const saveSettings = () => {
  console.log("save settings");
  rtcData.setDefaultDevices(audioin.value, videoin.value);

  emit("close");
};
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

  .settings {
    width: 40%;
    max-width: 400px;
    height: 400px;

    border-radius: 10px;
    background: #21252b;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    border: 1px solid #373d47;

    select {
      margin: 10px;
      height: 40px;
      width: 80%;

      border-radius: 5px;
      border: none;
      background: #282c34;
      border: 1px solid #373d47;

      color: #abb2bf;
    }

    label {
      width: 80%;
    }

    button {
      width: 80%;
    }
  }
}
</style>
