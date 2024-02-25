<template>
  <div class="home">
    <SideBar @selectFriend="selectFriend" />
    <div class="container">
      <Chat
        v-if="activeFriend"
        :calling="false"
        :friend="activeFriend"
        @call="call"
      />
      <div class="empty" v-else>
        Woah! It's lonely in here. <br />
        Don't you have any friends to chat with?
      </div>
    </div>
    <CallNotification
      v-if="rtcData.callIncoming && rtcData.callerId != activeFriend.username"
      :callerId="rtcData.callerId"
      @acceptCall="acceptCall"
      @rejectCall="rejectCall"
    />
    <audio autoplay ref="audioRef"></audio>
  </div>
</template>

<script async setup>
import { useRouter } from "vue-router";
import { getCurrentUser } from "vuefire";
import { Artico } from "@rtco/client";
import { useRtcDataStore } from "../stores/rtcData";
import axios from "axios";
import { io } from "socket.io-client";
import { watch } from "vue";

const audioRef = ref(null);

const router = useRouter();
const currentUser = await getCurrentUser();
const rtcData = useRtcDataStore();
const activeFriend = ref(null);

const call = async () => {
  let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  rtcData.callPeer(
    activeFriend.value.username,
    currentUser.displayName,
    stream,
    audioRef
  );
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
  // rtcData.createPeerConnection(currentUser.uid);
  // console.log(currentUser.displayName, "online");
  // axios.post("http://localhost:5000/setVisibility", {
  //   username: currentUser.displayName,
  //   value: "online",
  // });
};

onMounted(async () => {
  rtcData.createPeerConnection(currentUser.displayName);
  console.log(currentUser.displayName, "online");

  const socket = io("http://localhost:5000");
  socket.on("connect", () => {
    console.log("connected");
    socket.emit("uid", currentUser.displayName);
  });
});

onUnmounted(async () => {
  await axios.post("http://localhost:5000/setVisibility", {
    username: currentUser.displayName,
    value: "offline",
  });
});

// window.addEventListener("beforeunload", async (e) => {
//   console.log("beforeunload", currentUser.displayName, "offline");
//   let res = await axios.post(
//     "http://localhost:5000/setVisibility",
//     {
//       username: currentUser.displayName,
//       value: "offline",
//     },
//     {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   console.log(res.data);
// });
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
