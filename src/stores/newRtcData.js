import { ref } from "vue";
import { defineStore } from "pinia";

export const useRtcDataStore = defineStore("newRtcData", () => {
  let artico;
  const onGoingCalls = ref([]);
  const callerId = ref("");
  const connected = ref(false);
  const connectionId = ref("");
  const myAudioStream = ref(null);
  const myVideoStream = ref(null);
  const myScreenStream = ref(null);
  const incomingCall = ref(null);

  const isCallIncoming = ref(false);
  const isMuted = ref(false);
  const isVideoMuted = ref(false);
  const isScreenSharing = ref(false);
  const isCallOutgoing = ref(false);
  const isCallInProgress = ref(false);

  const createPeerConnection = (id) => {
    console.log("Creating peer connection", id);
    artico = new Artico({
      id: id,
    });

    artico.on("call", (call) => {
      const { metadata } = call;
      isCallIncoming.value = true;
      callerId.value = metadata.username;
      console.log("Incoming call from: ", callerId.value, metadata.username);
      incomingCall.value = call;
      setTimeout(() => {
        if (!isCallInProgress.value) {
          isCallIncoming.value = false;
          call.close();
        }
      }, 1000 * 30);
    });

    artico.on("open", (id) => {
      connected.value = true;
      connectionId.value = id;
      console.log("Connected to server with id: ", id);
    });

    artico.on("close", () => {
      connected.value = false;
      connectionId.value = "";
      console.log("Disconnected from server");
    });
  };
});
