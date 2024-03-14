<template>
  <div class="home">
    <SideBar @selectFriend="selectFriend" @selectGroup="selectGroup" />
    <div class="container">
      <Chat v-if="activeFriend" :calling="false" :friend="activeFriend" />
      <ChatGroup v-else-if="activeGroup" :group="activeGroup" />

      <div class="empty" v-else>
        Woah! It's lonely in here. <br />
        Don't you have any friends to chat with?
      </div>
    </div>
  </div>
</template>

<script async setup>
import { useRouter } from "vue-router";
import { getCurrentUser } from "vuefire";
import { useNewRtcDataStore } from "@/stores/newRtcData";
// import { useCounterStore } from "@/stores/counter";
import SideBar from "@/components/SideBar.vue";
import Chat from "@/components/Chat.vue";
import CallNotification from "@/components/CallNotification.vue";

import { watch, ref, onMounted, onUnmounted } from "vue";

// const rtcData = {};
const router = useRouter();

const currentUser = await getCurrentUser();
// const rtcData = useNewRtcDataStore();
const activeFriend = ref(null);
const activeGroup = ref(null);

const selectFriend = (friend) => {
  activeFriend.value = null;
  setTimeout(() => {
    activeFriend.value = friend;
  }, 10);
};

const selectGroup = (group) => {
  activeGroup.value = null;
  setTimeout(() => {
    activeGroup.value = group;
  }, 10);
};

onUnmounted(async () => {});

// watch(rtcData, (newVal) => {
//   console.log("update");
//   if (newVal.otherAudioStream && newVal.isCallInProgress) {
//     console.log("new audio stream", newVal.otherAudioStream);
//     audioRef.value.srcObject = newVal.otherAudioStream;
//   }
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
