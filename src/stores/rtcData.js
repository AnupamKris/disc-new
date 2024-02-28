import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";
import { Artico } from "@rtco/client";

export const useRtcDataStore = defineStore("rtcData", () => {
  // const rtcPeerConnection = ref(null);
  const callIncoming = ref(false);
  const callerId = ref("");
  const connected = ref(false);
  const connectionId = ref("");
  const stream = ref(null);
  const selfStream = ref(null);
  const callObject = ref(null);
  const callInProgress = ref(false);
  const callOutgoing = ref(false);
  const isMuted = ref(false);

  let p;
  const createPeerConnection = (id) => {
    console.log("Creating peer connection", id);
    p = new Artico({
      id: id,
    });
    // rtcPeerConnection.value = p;

    p.on("call", (call) => {
      const { metadata } = call;
      callIncoming.value = true;
      callerId.value = metadata.username;
      console.log("Incoming call from: ", callerId.value, metadata.username);
      callObject.value = call;

      setTimeout(() => {
        if (!callInProgress.value) {
          callIncoming.value = false;
          callObject.value.close();
        }
      }, 1000 * 30);

      // callerId.value = call.peer;
    });

    p.on("open", (id) => {
      connected.value = true;
      connectionId.value = id;
      console.log("Connected to server with id: ", id);
    });
  };

  const rejectCall = () => {
    if (callObject.value) {
      callObject.value.close();
    }
    callInProgress.value = false;
    callIncoming.value = false;
    callerId.value = "";
  };

  const answerCall = async (dataStream, audioRef) => {
    console.log("Answering call", callObject.value, dataStream);
    callObject.value.answer();
    callIncoming.value = false;

    callObject.value.on("open", () => {
      console.log("Call open");
      callInProgress.value = true;

      selfStream.value = dataStream;

      callObject.value.addStream(dataStream, {
        id: "audio",
      });

      callObject.value.on("stream", (stream) => {
        console.log("Stream received: ", stream);
        stream.value = stream;
        audioRef.value.srcObject = stream;
      });

      callObject.value.on("close", () => {
        console.log("Call closed");
        callInProgress.value = false;
        callIncoming.value = false;
        callerId.value = "";
        selfStream.value = null;
      });
    });

    // console.log("Call answered: ", callObject.value);
  };

  const callPeer = (id, username, streamData, audioRef) => {
    callObject.value = p.call(id, { username: username });
    callOutgoing.value = true;
    callerId.value = id;

    setTimeout(() => {
      if (!callInProgress.value) {
        callOutgoing.value = false;
        callObject.value.close();
      }
    }, 1000 * 30);

    callObject.value.on("open", () => {
      console.log("Call open", streamData);
      selfStream.value = streamData;
      callObject.value.addStream(streamData, {
        id: "audio",
      });
      callInProgress.value = true;

      callObject.value.on("stream", (stream) => {
        console.log("Stream received: ", stream);
        stream.value = stream;
        audioRef.value.srcObject = stream;
      });

      callObject.value.on("close", () => {
        console.log("Call closed");
        callInProgress.value = false;
        callOutgoing.value = false;
        callerId.value = "";
        selfStream.value = null;
      });
    });
  };

  const toggleMute = () => {
    isMuted.value = !isMuted.value;
    if (callObject.value) {
      if (isMuted.value) {
        callObject.value.removeStream(selfStream.value);
        console.log("Muted");
      } else {
        callObject.value.addStream(selfStream.value, {
          id: "audio",
        });
        console.log("UnMuted");
      }
    }
  };

  // watch(isMuted, (val) => {
  //   console.log("Mute change: ", val, callObject.value);
  //   if (callObject.value) {
  //     // callObject.value.mute(val);
  //     console.log(callObject.value);
  //     console.log(callObject.value.tracks);
  //     callObject.value.removeTrack("audio");
  //   }
  // });

  return {
    // rtcPeerConnection,
    createPeerConnection,
    callIncoming,
    connected,
    callerId,
    callPeer,
    answerCall,
    rejectCall,
    callInProgress,
    callOutgoing,
    isMuted,
    toggleMute,
  };
});
