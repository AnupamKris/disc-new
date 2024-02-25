import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { Artico } from "@rtco/client";

export const useRtcDataStore = defineStore("rtcData", () => {
  // const rtcPeerConnection = ref(null);
  const callIncoming = ref(false);
  const connected = ref(false);
  const connectionId = ref("");
  let p;
  const createPeerConnection = (id) => {
    p = new Artico({ id: id });
    // rtcPeerConnection.value = p;

    p.on("call", (call) => {
      callIncoming.value = true;
    });

    p.on("open", (id) => {
      connected.value = true;
      connectionId.value = id;
      console.log("Connected to server with id: ", id);
    });
  };

  const answerCall = () => {
    p.answer();
  }

  return {
    // rtcPeerConnection,
    createPeerConnection,
    callIncoming,
    connected,
    connectionId,
  };
});
