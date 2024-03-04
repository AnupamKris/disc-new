<template>
  <div
    class="fileprogress"
    :class="{ smallbar: hideText }"
    @mouseover="hideText = false"
    @mouseout="hideText = true"
  >
    <div class="progress">
      <circle-progress
        class="progress"
        :percent="progress"
        :size="50"
        :border-width="5"
        :border-bg-width="5"
        empty-color="#373d47"
      />
      <p>{{ parseInt(progress) }}</p>
    </div>
    <div class="fileprogress__info" :class="{ hide: hideText }">
      <p>{{ filename }}</p>
    </div>
  </div>
</template>

<script setup>
import "vue3-circle-progress/dist/circle-progress.css";
import CircleProgress from "vue3-circle-progress";

const props = defineProps({
  filename: String,
  progress: Number,
  isProgress: Boolean,
});

const hideText = ref(false);

onMounted(() => {
  setTimeout(() => {
    hideText.value = true;
  }, 1000);
});
</script>

<style lang="scss" scoped>
.fileprogress {
  position: fixed;
  bottom: 60px;
  right: 30px;
  width: 220px;
  height: 60px;
  border-radius: 30px;

  z-index: 10;

  background: #282c34;

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5px;
  padding-left: 15px;

  font-size: 10px;
  transition: 0.3s;
  flex-direction: row-reverse;

  .progress {
    position: relative;
    p {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      margin: 0;
      color: #abb2bf;
      font-size: 14px;
      text-align: center;
    }
  }

  .fileprogress__info {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 20px;

    p {
      margin: 0;
      color: #abb2bf;
    }

    transition: opacity 0.3s 0.3s;
  }

  .hide {
    opacity: 0;
    height: 0;
    width: 0px;
    // flex: 0;
    border-radius: 25px;
    transition: opacity 0s 0s;
  }
}

.smallbar {
  width: 50px;
  height: 60px;

  border-radius: 25px;
  background: transparent;

  &:hover {
    width: 200px;
    height: 60px;
    border-radius: 30px;
    background: #282c34;
    .hide {
    }
  }
}

.vue3-circular-progressbar {
  width: 50px;
  height: 50px;
}

// bar move left and write animation
@keyframes move {
  0% {
    left: 0;
  }

  50% {
    left: calc(100% - 50px);
  }

  100% {
    left: 0;
  }
}
</style>
