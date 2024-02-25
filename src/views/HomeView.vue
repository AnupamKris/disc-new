<template>
  <div class="home">
    <SideBar />
    <div class="container">
      Home <br />
      {{ currentUser.uid }} <br />
      {{ rtcData.connected }}
      {{ rtcData.connectionId }}
    </div>
  </div>
</template>

<script async setup>
import { useRouter } from "vue-router";
import { getCurrentUser } from "vuefire";
import { Artico } from "@rtco/client";
import { useRtcDataStore } from "../stores/rtcData";
import axios from "axios";

const router = useRouter();
const currentUser = await getCurrentUser();
const rtcData = useRtcDataStore();

onMounted(async () => {
  // rtcData.createPeerConnection(currentUser.uid);
  console.log(currentUser.displayName, "online");
  await axios.post("http://localhost:5000/setVisibility", {
    username: currentUser.displayName,
    value: "online",
  });
});

onUnmounted(async () => {
  await axios.post("http://localhost:5000/setVisibility", {
    username: currentUser.displayName,
    value: "offline",
  });
});

window.addEventListener("beforeunload", (e) => {
  e.preventDefault();
  console.log("beforeunload", currentUser.displayName, "offline");
  axios.post("http://localhost:5000/setVisibility", {
    username: currentUser.displayName,
    value: "offline",
  });
  e.returnValue = "";
});
</script>

<style lang="scss" scoped>
.home {
  height: 100%;
  display: flex;

  .container {
    width: calc(100% - 300px);
    background: #21252b;
  }
}
</style>
