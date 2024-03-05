<template>
  <div class="audio-player">
    <div class="container">
      <AudioWave :audioUrl="audioUrl" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  audioUrl: String,
  filename: String,
});

const audioUrl = toRef(props, "audioUrl");
</script>

<style lang="scss" scoped>
.audio-player {
  display: flex;
  justify-content: center;
  align-items: center;

  .icon {
    font-size: 25px;
    margin-right: 10px;
    width: 40px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    p {
      color: #abb2bf;
      margin-bottom: 3px;
      font-size: 12px;
    }

    .slider-wrapper {
      .volume {
        background: #abb2bf !important;
      }
    }

    .duration {
      color: #abb2bf;
      margin-bottom: 10px;
      font-size: 12px;
      display: flex;
      justify-content: center;
      align-items: center;

      margin: 0;
    }
  }

  .controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 3px;

    .vol-ctrl {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 120px;
      margin-left: auto;

      .slider-wrapper {
        margin: 0;
      }
    }

    button {
      background: none;
      border: none;
      color: #abb2bf;
      font-size: 20px;
      cursor: pointer;

      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
