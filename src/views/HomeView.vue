<template>
  <div class="home">
    <SideBar @selectFriend="selectFriend" />
    <div class="container">
      <Chat
        v-if="activeFriend"
        :calling="false"
        :friend="activeFriend"
        @call="call"
        @acceptCall="acceptCall"
        @rejectCall="rejectCall"
      />
      <div class="empty" v-else>
        Woah! It's lonely in here. <br />
        Don't you have any friends to chat with?
        {{ rtcData }}
      </div>
    </div>

    <CallNotification
      v-if="rtcData.isCallIncoming"
      :callerId="rtcData.callerId"
      @acceptCall="acceptCall"
      @rejectCall="rejectCall"
    />

    <CallPopUp v-if="rtcData.isCallOutgoing || rtcData.isCallInProgress" />
    <audio autoplay ref="audioRef"></audio>
  </div>
</template>

<script async setup>
import { useRouter } from "vue-router";
import { getCurrentUser } from "vuefire";
import { useRtcDataStore } from "../stores/newRtcData";
import axios from "axios";
import SideBar from "@/components/SideBar.vue";
import Chat from "@/components/Chat.vue";
import CallNotification from "@/components/CallNotification.vue";

import { watch, ref, onMounted, onUnmounted } from "vue";

const audioRef = ref(null);
// const rtcData = {};
const router = useRouter();
const currentUser = await getCurrentUser();
const rtcData = useRtcDataStore();
const activeFriend = ref(null);

const call = async () => {
  let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  rtcData.callPeer(activeFriend.value.username, stream, audioRef);
};

const rejectCall = () => {
  rtcData.rejectCall();
};

const acceptCall = async () => {
  let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  rtcData.answerCall(stream, audioRef);
};

const selectFriend = (friend) => {
  activeFriend.value = null;
  setTimeout(() => {
    activeFriend.value = friend;
  }, 10);
};

onMounted(async () => {
  console.log("Mounted Again", rtcData.connectionId);
  if (rtcData.connectionId === "") {
    rtcData.createPeerConnection(currentUser.displayName);
  }
  console.log(currentUser.displayName, "online");

  // const socket = io("http://localhost:5000/");
  // socket.on("connect", () => {
  //   console.log("connected");
  //   socket.emit("uid", currentUser.displayName);
  // });
});

onUnmounted(async () => {});

watch(rtcData, (newVal) => {
  console.log("update");
  if (newVal.otherAudioStream && newVal.isCallInProgress) {
    console.log("new audio stream", newVal.otherAudioStream);
    audioRef.value.srcObject = newVal.otherAudioStream;
  }
});
</script>

<style lang="scss" scoped>
.home {
  height: 100%;
  display: flex;
  color: #abb2bf;

  .container {
    width: calc(100% - 300px);
    background: #21252b;

    .empty {
      height: 100%;
      width: 100%;

      display: flex;
      justify-content: center;
      align-items: center;

      text-align: center;
    }
  }

  audio {
    display: none;
  }
}
</style>
