<script setup>
import { ref } from "vue";
import { WaveSurferPlayer } from "@meersagor/wavesurfer-vue";
const props = defineProps({
  audioUrl: String,
  filename: String,
});

const audioUrl = toRef(props, "audioUrl");

const options = ref({
  height: 48,
  waveColor: "#373d47",
  progressColor: "#4d78cc",
  barGap: 5,
  barWidth: 5,
  barRadius: 8,
  duration: 80,
  // cursorWidth: 0,
});

const currentTime = ref("00:00");
const totalDuration = ref("00:00");
const waveSurfer = ref(null);
const isPlaying = ref(false);

const formatTime = (seconds) =>
  [seconds / 60, seconds % 60]
    .map((v) => `0${Math.floor(v)}`.slice(-2))
    .join(":");

const timeUpdateHandler = (time) => {
  currentTime.value = formatTime(time);
};
const readyHandler = (duration) => {
  totalDuration.value = formatTime(duration);
};
const readyWaveSurferHandler = (ws) => {
  waveSurfer.value = ws;
};
</script>

<template>
  <main>
    <button @click="waveSurfer?.playPause()">
      <ion-icon :name="isPlaying ? 'pause' : 'play'"></ion-icon>
    </button>
    <WaveSurferPlayer
      v-if="audioUrl"
      :options="{ ...options, url: audioUrl }"
      @timeupdate="(time) => timeUpdateHandler(time)"
      @ready="(duration) => readyHandler(duration)"
      @waveSurfer="(ws) => readyWaveSurferHandler(ws)"
      @pause="isPlaying = false"
      @play="isPlaying = true"
      class="wave-surfer-player"
    />
  </main>
</template>

<style lang="scss" scoped>
main {
  min-width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  .wave-surfer-player {
    width: 100%;
    max-width: 100%;
    min-width: 350px;
  }

  button {
    font-size: 25px;
    // margin-right: 10px;
    width: 40px;
    height: 40px;

    margin: 0;
    padding: 0;

    border: none;
    background-color: transparent;
    color: #abb2bf;

    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
