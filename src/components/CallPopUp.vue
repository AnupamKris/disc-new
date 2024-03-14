<template>
  <div
    class="popup"
    :class="{ fullscreen: isFullScreen }"
    @mousedown="startDrag"
    @mousemove="drag"
    @mouseleave="stopDrag"
    @mouseup="stopDrag"
    :style="position"
  >
    <div class="title" @dblclick="toggleFullScreen">
      <h2>{{ rtcData.callerId }}</h2>
    </div>
    <div class="video-streams">
      <video
        autoplay
        :class="{ hidden: rtcData.isVideoMuted }"
        ref="myVideoRef"
      ></video>
      <video
        autoplay
        :class="{ hidden: !rtcData.otherVideoStream }"
        ref="otherVideoRef"
      ></video>
      <video
        autoplay
        :class="{ hidden: !rtcData.myScreenStream }"
        ref="myScreenRef"
      ></video>
      <video
        autoplay
        :class="{ hidden: !rtcData.otherScreenStream }"
        ref="otherScreenRef"
      ></video>
    </div>
    <div class="buttons" v-if="!rtcData.isCallOutgoing">
      <button @click="rtcData.toggleMute">
        <ion-icon :name="rtcData.isMuted ? 'mic-off' : 'mic'"></ion-icon>
      </button>
      <button @click="rtcData.toggleVideoMute">
        <ion-icon
          :name="rtcData.isVideoMuted ? 'videocam-off' : 'videocam'"
        ></ion-icon>
      </button>
    </div>
    <div class="buttons" v-else>
      <div class="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
    <button @click="rtcData.rejectCall" class="reject">
      <ion-icon name="call"></ion-icon>
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useNewRtcDataStore } from "../stores/newRtcData";
import { watch, ref, onMounted } from "vue";

const rtcData = useNewRtcDataStore();
const dragging = ref(false);
const myVideoRef = ref(null);
const otherVideoRef = ref(null);
const myScreenRef = ref(null);
const otherScreenRef = ref(null);

const isFullScreen = ref(false);

const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value;
};

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

watch(rtcData, () => {
  otherVideoRef.value.srcObject = rtcData.otherVideoStream;
  myVideoRef.value.srcObject = rtcData.myVideoStream;
  myScreenRef.value.srcObject = rtcData.myScreenStream;
  otherScreenRef.value.srcObject = rtcData.otherScreenStream;

  console.log(
    "Changing Streams ",
    rtcData.otherVideoStream,
    rtcData.myVideoStream
  );
});
</script>

<style lang="scss" scoped>
.popup {
  * {
    user-select: none;
  }

  position: fixed;
  bottom: 10px;
  right: 10px;

  min-height: 140px;
  background: #282c34;

  padding: 0 30px;
  border-radius: 10px;
  border-top: 18px solid #3b4048;
  padding-bottom: 10px;

  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5);

  display: flex;
  flex-direction: column;

  color: #abb2bf;
  z-index: 1000;

  .buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    margin-bottom: 10px;

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
  }

  .reject {
    border: none;
    border-radius: 10px;
    background: #f04747;
    color: #fff;

    padding: 5px 0;

    display: flex;
    justify-content: center;
    align-items: center;

    ion-icon {
      transform: rotateZ(135deg);
    }
  }

  .video-streams {
    display: flex;
    flex-wrap: wrap;

    video {
      max-width: 150px;
      // max-height: 150px;
    }

    .hidden {
      display: none;
    }
  }
}
</style>
