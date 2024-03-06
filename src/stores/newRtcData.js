import { ref } from "vue";
import { defineStore } from "pinia";
import { Artico } from "@rtco/client";
import {
  readBinaryFile,
  writeBinaryFile,
  BaseDirectory,
} from "@tauri-apps/api/fs";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useFirestore } from "vuefire";

export const useNewRtcDataStore = defineStore("newRtcData", () => {
  const db = useFirestore();
  let artico;
  let ongoingCall = null;
  let incomingCall = null;
  let outgoingCall = null;

  let audioDevices = [];
  let videoDevices = [];

  const callerId = ref("");
  const connectionId = ref("");

  const friendsObjects = ref([]);
  const notficationChats = ref([]);

  const myAudioStream = ref(null);
  const myVideoStream = ref(null);
  const myScreenStream = ref(null);
  const transferProgress = ref(0);
  const transferFileName = ref("");
  const otherAudioStream = ref(null);
  const otherVideoStream = ref(null);
  const otherScreenStream = ref(null);

  const isConnected = ref(false);
  const isCallIncoming = ref(false);
  const isMuted = ref(false);
  const isVideoMuted = ref(true);
  const isScreenSharing = ref(false);
  const isCallOutgoing = ref(false);
  const isCallInProgress = ref(false);
  const isTransferInProgress = ref(false);

  // const isNotification = ref(false);

  const sendFileChat = async (
    chatId,
    username,
    filename,
    senderPath,
    recieverPath
  ) => {
    let chatRef = doc(db, "chats", chatId);
    console.log(chatRef, chatId, username, filename);
    let chatData = {
      message: filename,
      sender: username,
      type: "file",
      senderPath: senderPath,
      recieverPath: recieverPath,
      timestamp: new Date(),
    };

    await updateDoc(chatRef, {
      messages: arrayUnion(chatData),
    });

    sendChatNotification(username);
  };

  const setupDevicesList = async () => {
    let devices = await navigator.mediaDevices.enumerateDevices();
    // get devices with unique groupId

    console.log(devices, "devices");
    devices.forEach((device) => {
      if (device.kind == "audioinput") {
        audioDevices.push(device);
      } else if (device.kind == "videoinput") {
        videoDevices.push(device);
      }
    });

    audioDevices = audioDevices.filter(
      (v, i, a) => a.findIndex((t) => t.groupId === v.groupId) === i
    );

    videoDevices = videoDevices.filter(
      (v, i, a) => a.findIndex((t) => t.groupId === v.groupId) === i
    );
  };

  const createPeerConnection = (id) => {
    console.log("Creating peer connection", id);
    artico = new Artico({
      id: id,
    });

    setupDevicesList();

    artico.on("call", (call) => {
      let { metadata } = call;

      if (metadata.type == "notification") {
        console.log("Incoming notification from: ", metadata.username);
        notficationChats.value.push(metadata.username);
        console.log(notficationChats);
        call.hangup();
        return;
      } else if (metadata.type == "file") {
        isTransferInProgress.value = true;
        console.log("Incoming file from: ", metadata.username);
        transferFileName.value =
          "Receiving " + metadata.filename + " from " + metadata.username;
        call.answer();

        var receivedData = new Uint8Array(metadata.length);
        var i = 0;
        var chunkNumber = 0;

        call.on("open", () => {
          console.log("Call opened");
          isTransferInProgress.value = true;
        });

        call.on("data", async (data) => {
          if (data == "EOF") {
            let interval = setInterval(async () => {
              if (!isTransferInProgress.value) {
                clearInterval(interval);
                console.log(
                  "EOF received",
                  i,
                  metadata.length,
                  receivedData[i - 1]
                );
                await writeBinaryFile(metadata.filename, receivedData, {
                  dir: BaseDirectory.Download,
                });
                await sendFileChat(
                  metadata.chatId,
                  metadata.username,
                  metadata.filename,
                  metadata.senderPath,
                  BaseDirectory.Download + "\\" + metadata.filename
                );
                call.hangup();
                setTimeout(() => {
                  isTransferInProgress.value = false;
                }, 1000);
              } else {
                console.log(
                  "EOF received waiting for completion",
                  i,
                  metadata.length
                );
              }
            }, 500);
          } else {
            console.log("==", i);
            for (var j = 0; j < data.length; j++) {
              receivedData[j + i] = data.charCodeAt(j);
            }
            i += data.length;
            console.log(
              i,
              metadata.length,
              i == metadata.length,
              i == metadata.length ? "Transfer complete" : "Transfer incomplete"
            );
            call.send(JSON.stringify({ type: "ack", chunk: chunkNumber }));
            transferProgress.value = (chunkNumber / metadata.totalChunks) * 100;
            // console.log(transferProgress.value, i, metadata.totalChunks);
            if (i == metadata.length) {
              isTransferInProgress.value = false;
              console.log("File transfer complete");
              transferProgress.value = 0;
            }
            chunkNumber++;
          }
          // console.log("Data received: ", data);
        });
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
        myAudioStream.value = null;
        otherAudioStream.value = null;
        myVideoStream.value = null;
        otherVideoStream.value = null;
        
      });

      call.on("stream", (stream, metadata) => {
        console.log("Stream received: ", stream, "metadata", metadata);
        if (metadata.id == "audio") otherAudioStream.value = stream;
        else if (metadata.id == "video") otherVideoStream.value = stream;
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

    setTimeout(() => {
      if (!isCallInProgress.value) {
        rejectCall();
      }
    }, 1000 * 30);

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

      call.on("stream", (stream, metadata) => {
        // console.log("Stream received: ", stream);
        console.log("Some stream recieved", metadata);
        if (metadata.id == "audio") otherAudioStream.value = stream;
        else if (metadata.id == "video") otherVideoStream.value = stream;
      });
    });

    outgoingCall.on("close", () => {
      console.log("Call closed");
      isCallInProgress.value = false;
      isCallOutgoing.value = false;
      myAudioStream.value = null;
        otherAudioStream.value = null;
        myVideoStream.value = null;
        otherVideoStream.value = null;
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

      ongoingCall.on("stream", (stream, metadata) => {
        console.log("Some stream recived", metadata);
        if (metadata.id == "audio") otherAudioStream.value = stream;
        else if (metadata.id == "video") otherVideoStream.value = stream;
        // console.log("Stream received: ", stream);
        // otherAudioStream.value = stream;
      });

      

      ongoingCall.on("close", () => {
        console.log("Call closed");
        isCallInProgress.value = false;
        isCallIncoming.value = false;
        callerId.value = "";
        
        myAudioStream.value = null;
        otherAudioStream.value = null;
        myVideoStream.value = null;
        otherVideoStream.value = null;
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

  const toggleVideoMute = async () => {
    isVideoMuted.value = !isVideoMuted.value;
    let devs = await navigator.mediaDevices.enumerateDevices();
    console.log(devs, "---");
    if (!myVideoStream.value && !isVideoMuted.value) {
      console.log("Getting video stream and adding");
      myVideoStream.value = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      ongoingCall.addStream(myVideoStream.value, {
        id: "video",
      });
      
    } else if (myVideoStream.value && isVideoMuted.value) {
      console.log("Removing video stream");
      ongoingCall.removeStream(myVideoStream.value);
    } else if (myVideoStream.value && !isVideoMuted.value) {
      console.log("Adding video stream");
      ongoingCall.addStream(myVideoStream.value, {
        id: "video",
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

  const sendFile = async (peerId, chatId, filepath, filename) => {
    let chunksize = 100000;

    let shortFilename = filename.split(".")[0].substring(0, 10);
    +"..." + filename.split(".")[1];
    transferFileName.value = "Processing " + shortFilename + " to " + peerId;
    var chunks = [];

    let file = await readBinaryFile(filepath);
    transferFileName.value = "Waiting for connection...";
    let call = artico.call(peerId, {
      username: connectionId.value,
      type: "file",
      filename: filename,
      length: file.length,
      totalChunks: Math.ceil(file.length / chunksize),
      chatId: chatId,
      senderPath: filepath,
    });

    // var binaryString = String.fromCharCode.apply(null, file);

    // read the uint8 array in chunks

    for (var i = 0; i < file.length; i += chunksize) {
      chunks.push(file.subarray(i, i + chunksize));
    }

    console.log(chunks);

    // return

    // console.log(binaryString);
    // // convert binary uint 8 as chunk of strings
    // // send in 100kb chunks
    // var chunkSize = 100000;
    // var chunks = [];
    // for (var i = 0; i < binaryString.length; i += chunkSize) {
    //   chunks.push(binaryString.substring(i, i + chunkSize));
    // }
    // console.log(chunks);
    call.on("open", () => {
      console.log("Call opened");
      transferFileName.value = "Sending " + shortFilename + " to " + peerId;
      // chunks.forEach((chunk) => {
      //   let chunkString = String.fromCharCode.apply(null, chunk);
      //   call.send(chunkString);
      // });
      isTransferInProgress.value = true;
      let i = 0;
      let chunk = String.fromCharCode.apply(null, chunks[i]);
      call.send(chunk);

      call.on("data", (data) => {
        let parsedData = JSON.parse(data);
        if (parsedData.type == "ack" && parsedData.chunk == i) {
          console.log("Ack received for chunk: ", i);
          transferProgress.value = (i / chunks.length) * 100;
          i++;
          if (i < chunks.length) {
            let chunk = String.fromCharCode.apply(null, chunks[i]);
            call.send(chunk);
          } else {
            call.send("EOF");
            transferFileName.value = "File sent Successfully to " + peerId;
            setTimeout(() => {
              isTransferInProgress.value = false;
              transferProgress.value = 0;
              transferFileName.value = "";
              console.log("EOF sent");
            }, 1000);
          }
        } else {
          console.log("Invalid ack received");
          // call.send("");
        }
      });
    });

    // let file = await readBinaryFile(file);
    // console.log(file);
  };

  const sendChunks = (peerId, chatId, chunks, filename) => {
    let call = artico.call(peerId, {
      username: connectionId.value,
      type: "file",
      filename: filename,
      length: chunks.length,
      chatId: chatId,
    });

    call.on("open", () => {
      console.log("Call opened");
      chunks.forEach((chunk) => {
        call.send(chunk);
      });
    });
  }

  return {
    ongoingCall,
    outgoingCall,
    callerId,
    connectionId,
    myAudioStream,
    myVideoStream,
    myScreenStream,
    otherAudioStream,
    otherVideoStream,
    otherScreenStream,
    incomingCall,
    friendsObjects,
    notficationChats,
    transferProgress,
    transferFileName,
    audioDevices,
    videoDevices,

    isCallIncoming,
    isMuted,
    isVideoMuted,
    isScreenSharing,
    isCallOutgoing,
    isCallInProgress,
    isConnected,
    isTransferInProgress,

    createPeerConnection,
    callPeer,
    answerCall,
    toggleMute,
    toggleVideoMute,
    rejectCall,
    sendChatNotification,
    sendFile,
  };
});
