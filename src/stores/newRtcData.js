import { ref } from "vue";
import { defineStore } from "pinia";
import { Artico } from "@rtco/client";
// import { readBinaryFile } from "@tauri-apps/api/fs";


export const useNewRtcDataStore = defineStore("newRtcData", () => {
  let artico;
  let ongoingCall = null;
  let incomingCall = null;
  let outgoingCall = null;


  const callerId = ref("");
  const connectionId = ref("");

  const friendsObjects = ref([]);
  const notficationChats = ref([]);

  const myAudioStream = ref(null);
  const myVideoStream = ref(null);
  const myScreenStream = ref(null);

  const otherAudioStream = ref(null);

  const isConnected = ref(false);
  const isCallIncoming = ref(false);
  const isMuted = ref(false);
  const isVideoMuted = ref(false);
  const isScreenSharing = ref(false);
  const isCallOutgoing = ref(false);
  const isCallInProgress = ref(false);
  // const isNotification = ref(false);

  const createPeerConnection = (id) => {
    console.log("Creating peer connection", id);
    artico = new Artico({
      id: id,
    });


    artico.on("call", (call) => {
      let { metadata } = call;

      if (metadata.type == "notification") {
        console.log("Incoming notification from: ", metadata.username);
        notficationChats.value.push(metadata.username);
        console.log(notficationChats);
        call.hangup();
        return;
      }

      console.log("Incoming call from: ", metadata?.username);
      console.log("Incoming call from: ", "unknown");
      incomingCall = call;

      isCallIncoming.value = true;
      callerId.value = metadata.username;

      setTimeout(() => {
        if (!isCallInProgress.value) {
          rejectCall();
        }
      }, 1000 * 30);

      call.on("close", () => {
        console.log("Call closed");
        isCallIncoming.value = false;
        isCallInProgress.value = false;
        callerId.value = "";
      });

      call.on("stream", (stream) => {
        console.log("Stream received: ", stream);
        otherAudioStream.value = stream;
      });
    });

    artico.on("open", (id) => {
      isConnected.value = true;

      console.log("changing connected value", isConnected.value);
      connectionId.value = id;
      console.log("Connected to server with id: ", id);
    });
  };

  const callPeer = async (peerId, stream) => {
    let call = artico.call(peerId, {
      username: connectionId.value,
    });

    callerId.value = peerId;
    outgoingCall = call;
    isCallOutgoing.value = true;

    console.log(call, outgoingCall);

    call.on("open", () => {
      console.log("Call opened");
      ongoingCall = call;
      outgoingCall = null;
      isCallOutgoing.value = true;
      isCallInProgress.value = true;
      isCallOutgoing.value = false;

      myAudioStream.value = stream;
      call.addStream(myAudioStream.value, {
        id: "audio",
      });

      call.on("stream", (stream) => {
        console.log("Stream received: ", stream);
        otherAudioStream.value = stream;
      });
    });

    outgoingCall.on("close", () => {
      console.log("Call closed");
      isCallInProgress.value = false;
      isCallOutgoing.value = false;
    });
  };

  const answerCall = (dataStream) => {
    console.log("Answering call", incomingCall, dataStream);

    myAudioStream.value = dataStream;
    incomingCall.answer();

    incomingCall.on("open", () => {
      console.log("Call opened");
      incomingCall.addStream(myAudioStream.value, {
        id: "audio",
      });

      ongoingCall = incomingCall;
      isCallIncoming.value = false;
      isCallInProgress.value = true;
      incomingCall = null;

      ongoingCall.on("stream", (stream) => {
        console.log("Stream received: ", stream);
        otherAudioStream.value = stream;
      });

      ongoingCall.on("close", () => {
        console.log("Call closed");
        isCallInProgress.value = false;
        isCallIncoming.value = false;
        callerId.value = "";
        myAudioStream.value = null;
      });
    });
  };

  const toggleMute = () => {
    isMuted.value = !isMuted.value;
    // console.log(myAudioStream.value.getAudioTracks()[0].enabled);
    // myAudioStream.value.getAudioTracks()[0].enabled = !isMuted.value;
    if (isMuted.value) {
      ongoingCall.removeStream(myAudioStream.value);
    } else {
      ongoingCall.addStream(myAudioStream.value, {
        id: "audio",
      });
    }
  };

  const rejectCall = () => {
    if (isCallInProgress.value) {
      console.log("Closing ongoing call", ongoingCall);
      ongoingCall.hangup();
      isCallInProgress.value = false;
      isCallOutgoing.value = false;
      isCallIncoming.value = false;
      callerId.value = "";
      myAudioStream.value = null;
      otherAudioStream.value = null;
    } else if (isCallIncoming.value) {
      console.log("Closing incoming call", incomingCall);
      incomingCall.hangup();
      isCallIncoming.value = false;
      callerId.value = "";
      otherAudioStream.value = null;
    } else if (isCallOutgoing.value) {
      console.log("Closing outgoing call", outgoingCall);
      outgoingCall.hangup();
      isCallOutgoing.value = false;
      callerId.value = "";
      myAudioStream.value = null;
    }
  };

  const sendChatNotification = (peerId) => {
    let call = artico.call(peerId, {
      username: connectionId.value,
      type: "notification",
    });

    setTimeout(() => {
      call.hangup();
    }, 500);
  };

  return {
    ongoingCall,
    outgoingCall,
    callerId,
    connectionId,
    myAudioStream,
    myVideoStream,
    myScreenStream,
    otherAudioStream,
    incomingCall,
    friendsObjects,
    notficationChats,

    isCallIncoming,
    isMuted,
    isVideoMuted,
    isScreenSharing,
    isCallOutgoing,
    isCallInProgress,
    isConnected,

    createPeerConnection,
    callPeer,
    answerCall,
    toggleMute,
    rejectCall,
    sendChatNotification,
  };
});
