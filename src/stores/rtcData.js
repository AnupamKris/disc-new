import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { Artico } from "@rtco/client";

export const useRtcDataStore = defineStore("rtcData", () => {
  // const rtcPeerConnection = ref(null);
  const callIncoming = ref(false);
  const callerId = ref("");
  const connected = ref(false);
  const connectionId = ref("");
  const stream = ref(null);
  const callObject = ref(null);

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
      // callerId.value = call.peer;
    });

    p.on("open", (id) => {
      connected.value = true;
      connectionId.value = id;
      console.log("Connected to server with id: ", id);
    });
  };

  const rejectCall = () => {
    callIncoming.value = false;
    callerId.value = "";
  };

  const answerCall = async (dataStream, audioRef) => {
    console.log("Answering call", callObject.value, dataStream);
    callObject.value.answer();
    callIncoming.value = false;

    callObject.value.on("open", () => {
      console.log("Call open");

      callObject.value.addStream(dataStream);

      callObject.value.on("stream", (stream) => {
        console.log("Stream received: ", stream);
        stream.value = stream;
        audioRef.value.srcObject = stream;
      });
    });

    // console.log("Call answered: ", callObject.value);
  };

  const callPeer = (id, username, streamData, audioRef) => {
    callObject.value = p.call(id, { username: username });

    callObject.value.on("open", () => {
      console.log("Call open", streamData);
      callObject.value.addStream(streamData);

      callObject.value.on("stream", (stream) => {
        console.log("Stream received: ", stream);
        stream.value = stream;
        audioRef.value.srcObject = stream;
      });
    });
  };

  return {
    // rtcPeerConnection,
    createPeerConnection,
    callIncoming,
    connected,
    callerId,
    callPeer,
    answerCall,
    rejectCall,
  };
});
