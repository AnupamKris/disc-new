<template>
  <div class="chat">
    <div class="title">
      <h2>{{ friend.username }}</h2>
      <div class="buttons">
        <div class="call" @click="callFriend">
          <ion-icon name="call"></ion-icon>
        </div>
      </div>
    </div>
    <div class="chats" v-if="chats" ref="chatsRef">
      <div v-for="(chat, index) in chats.messages" :key="chat.timestamp" class="chat" :class="({
        same: index != 0 && chats.messages[index - 1].sender == chat.sender,
      },
        chat.type)
        ">
        <span :class="{
        visible:
          index == 0 || chats.messages[index - 1].sender != chat.sender,
      }">{{ chat.sender[0].toUpperCase() }}</span>
        <div class="content">
          <div class="sender" :class="{ self: chat.sender == currentUser.displayName }"
            v-if="index == 0 || chats.messages[index - 1].sender != chat.sender">
            <h3>{{ chat.sender }}</h3>
            <p>{{ convertTimestampToDate(chat.timestamp) }}</p>
          </div>
          <p class="message image" v-if="['png', 'jpg', 'jpeg'].includes(chat.senderPath?.split('.').pop())
        ">
            <!-- <img :src="imageUrls[chat.message]" alt="" /> -->
            <ImageViewer :imageUrl="imageUrls[chat.message]" />
          </p>
          <p class="message image" v-else-if="['mp4'].includes(chat.senderPath?.split('.').pop())">
            <VideoPlayer :videoUrl="imageUrls[chat.message]" :filename="chat.message" />
          </p>
          <p class="message audio" v-else-if="['mp3', 'wav'].includes(chat.senderPath?.split('.').pop())
        ">
            <AudioPlayer :audioUrl="imageUrls[chat.message]" :filename="chat.message" />

          </p>
          <p class="message" v-else>
            <ion-icon v-if="chat.type == 'file'" name="document-attach"></ion-icon>
            <!-- <pre>{{ formatMessage(chat.message) }}</pre> -->


          <div v-for="part in formatMessage(chat.message)">
            <!-- {{ part }} -->
            <pre v-if="part.type == 'text'">{{ part.content.trim("\n") }}</pre>
            <VCodeBlock v-else highlightjs :lang="part.language" theme="atom-one-dark" :code="part.content" />
          </div>
          <!-- <p v-if="part.type == 'text'">{{ part.content }}</p> -->
          </p>
        </div>
      </div>
    </div>
    <div class="inputs">
      <button @click="attachFile" class="attach">
        <ion-icon name="attach-outline"></ion-icon>
      </button>

      <textarea type="text" v-model="chatInput" @keyup.enter.exact="sendChat"></textarea>

      <button @click="sendChat" class="send">
        <ion-icon name="send"></ion-icon>
      </button>
    </div>
  </div>
</template>

<script async setup>
import { doc, collection, updateDoc, arrayUnion } from "firebase/firestore";
import { watch, ref, onMounted } from "vue";
import { useNewRtcDataStore } from "../stores/newRtcData";
import {
  useFirestore,
  useCurrentUser,
  useDocument,
  getCurrentUser,
} from "vuefire";
import { BaseDirectory, exists, readBinaryFile } from "@tauri-apps/api/fs";
import { open } from "@tauri-apps/api/dialog";
import VideoPlayer from "./VideoPlayer.vue";

const imageUrls = ref({});
const db = useFirestore();
const rtcData = useNewRtcDataStore();
const transferFileName = ref("");
const transferStarted = ref(false);
const chatsRef = ref(null);

const props = defineProps({
  friend: Object,
  calling: Boolean,
});

const emit = defineEmits(["rejectCall", "acceptCall"]);

const callFriend = async () => {
  let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  rtcData.callPeer(props.friend.username, stream);
};

const formatMessage = (msg) => {
  // put everythin in a pre tag and convert every content enclosed in ``` to a code block
  let parts = msg.split("```");

  return (parts.map((part, index) => {
    if (index % 2 === 0) {
      // This is a normal text part
      // console.log(part);
      return { type: "text", content: part }
    } else {
      // This is a code part
      // console.log("code", part);
      let language = part.split("\n")[0];
      if (language === "") {
        language = "javascript"
      }
      let content = part.split("\n").slice(1).join("\n");
      return { type: "code", content: content, language: language }
    }
  }))

}

const getImageIntoDataUrl = async (file, downloads) => {
  let data;
  console.log(file, downloads);
  console.log(await exists(file), file);
  if (downloads) {
    data = await readBinaryFile(file, {
      dir: BaseDirectory.Download,
    });
  } else {
    data = await readBinaryFile(file);
    console.log(data);
  }
  let blob = new Blob([new Uint8Array(data)]);
  let url = URL.createObjectURL(blob);

  imageUrls.value[file.split("\\").pop()] = url;
  console.log(imageUrls.value);
};

const currentUser = await getCurrentUser();
const chats = useDocument(doc(db, "chats", props.friend.chatId));

const convertTimestampToDate = (timestamp) => {
  //   console.log(timestamp, Date(timestamp));
  const date = new Date(Date(timestamp));
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const dateString = date.toLocaleDateString(undefined, options);
  const timeString = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateString} ${timeString}`;
};

const acceptCall = () => {
  emit("acceptCall");
};

const rejectCall = () => {
  emit("rejectCall");
};

const chatInput = ref("");
const sendChat = async () => {
  if (chatInput.value === "") return;
  let chatRef = doc(db, "chats", props.friend.chatId);
  console.log(props.friend.chatId, "chatRef");
  let chatData = {
    message: chatInput.value,
    sender: currentUser.displayName,
    timestamp: new Date(),
  };
  chatInput.value = "";
  await updateDoc(chatRef, {
    messages: arrayUnion(chatData),
  });

  rtcData.sendChatNotification(props.friend.username);
  chatsRef.value.scrollTop = chatsRef.value.scrollHeight;
};

const attachFile = async () => {
  let path = await open({ directory: false, multiple: false });
  if (!path) return;
  let filename = path.split("\\").pop();
  rtcData.isTransferInProgress = true;
  // let file = await readBinaryFile(path);
  // console.log(filename);
  rtcData.sendFile(props.friend.username, props.friend.chatId, path, filename);
};

watch(chats, (newVal) => {
  console.log(newVal);
  if (newVal.messages) {
    setTimeout(() => {
      chatsRef.value.scrollTop = chatsRef.value.scrollHeight;
    }, 10);

    newVal.messages.forEach((message) => {
      if (
        message.type == "file" &&
        ["png", "jpg", "jpeg", "mp4", "mp3", "wav"].includes(
          message.senderPath.split(".").pop()
        )
      ) {
        if (message.sender == currentUser.displayName) {
          let path = message.senderPath;
          getImageIntoDataUrl(path, false);
        } else {
          let path = message.senderPath.split("\\").pop();
          getImageIntoDataUrl(path, true);
        }
      }
    });
  }
});

watch(rtcData, (newVal) => {
  if (transferStarted.value && !newVal.isTransferInProgress) {
    transferStarted.value = false;
  } else if (rtcData.notficationChats.includes(props.friend.username)) {
    chatsRef.value.scrollTop = chatsRef.value.scrollHeight;
  }
});
</script>

<style lang="scss" scoped>
.chat {
  height: 100%;
  min-width: calc(100% - 300px);
  background: #21252b;
  color: #abb2bf;

  display: flex;
  flex-direction: column;
  position: relative;

  .title {
    height: 45px;
    width: 100%;
    padding: 0 10px;

    display: flex;
    align-items: center;
    justify-content: space-between;
    // background: darken(#282c34, 3%);
    border-bottom: 1px solid #3b4048;

    .call {
      height: 30px;
      width: 30px;

      display: flex;
      justify-content: center;
      align-items: center;

      cursor: pointer;
      border-radius: 50%;
      background: #3b4048;
    }
  }

  .calling {
    height: 250px;
    width: 100%;

    background: #282c34;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .profiles {
      height: 100px;
      width: 300px;
      display: flex;
      justify-content: space-around;
      align-items: center;

      .caller,
      .receiver {
        height: 80px;
        width: 80px;
        border-radius: 50%;
        background: #3b4048;

        display: flex;
        justify-content: center;
        align-items: center;

        position: relative;
        z-index: 1;

        .bouncer {
          height: 80px;
          width: 80px;
          border-radius: 50%;
          background: radial-gradient(circle, #4d77cc00 0%, #4d78cc 100%);

          position: absolute;
          top: 0;
          // transform: translate(-50%, -50%);

          animation: zoominout 1s infinite;
          z-index: -1;
        }

        h3 {
          font-size: 24px;
        }
      }

      .caller {
        background: #4d78cc;
      }
    }

    .buttons {
      height: 50px;
      // width: 100;

      display: flex;
      justify-content: space-around;
      align-items: center;

      button {
        height: 40px;
        width: 40px;
        border-radius: 50%;
        background: #3b4048;
        color: #abb2bf;
        border: none;
        outline: none;
        cursor: pointer;
        font-size: 24px;

        margin: 0 10px;

        display: flex;
        justify-content: center;
        align-items: center;

        &:hover {
          background: #4d78cc;
          color: #282c34;
        }
      }
    }
  }

  .chats {
    height: calc(100% - 80px);
    overflow: auto;
    display: flex;
    flex-direction: column;
    padding-bottom: 20px;



    .chat {
      height: auto;
      max-width: calc(100% - 20px);
      width: auto;
      // overflow-x: hidden;

      padding: 10px 5px 0 5px;

      //   background: darken(#282c34, 6%);
      border-radius: 10px;

      display: flex;
      flex-direction: row;
      margin-left: 10px;

      span {
        height: 0;
        width: 40px;
        min-width: 40px;
        min-height: 0;
        border-radius: 50%;
        background: #3b4048;

        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
      }

      .visible {
        opacity: 1;
        height: 40px;
        width: 40px;
        min-width: 40px;
        min-height: 40px;
      }

      .content {
        margin-left: 10px;
        overflow-x: auto;

        p {
          word-break: break-all;
          height: auto;

          .wrapper {
            padding: 0;
            margin: 0;
            height: auto;
          }
        }
      }

      .sender {
        display: flex;
        // justify-content: center;
        align-items: flex-end;
        width: 100%;

        h3 {
          font-size: 16px;
          display: flex;
          justify-content: center;
        }

        p {
          font-size: 10px;
          color: #abb2bf;
          margin-left: 10px;
          padding-bottom: 1px;
        }
      }

      .self {
        h3 {
          color: #61afef;
        }
      }
    }

    .same {
      padding-top: 1px;
    }

    .file {
      .content {
        display: block;

        .message {
          width: fit-content;
          font-size: 14px;
          color: #abb2bf;
          margin-top: 10px;
          background: #282c34;
          padding: 0 10px;

          height: 60px;
          border-radius: 5px;

          display: flex;
          justify-content: space-between;
          align-items: center;

          img {
            height: 100%;
            width: 100%;
            object-fit: cover;
          }

          .video-player {
            height: 100%;
            width: 100%;

            object-fit: cover;
          }

          ion-icon {
            font-size: 24px;
            margin: 0 10px;
          }
        }

        .image {
          height: auto;
          width: fit-content;
          max-width: 50%;
          border-radius: 5px;
          background: #282c34;
          padding: 0;
          overflow: hidden;

          display: flex;
          justify-content: center;
          align-items: center;

          img {
            height: 100%;
            width: 100%;
            object-fit: cover;
          }
        }

        .audio {
          height: 70px;
        }
      }
    }
  }

  .inputs {
    height: 40px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    margin-bottom: 10px;

    input,
    textarea {
      height: 40px;
      width: calc(100% - 60px);
      padding: 1px 50px;
      resize: vertical;
      border: none;
      outline: none;
      border-radius: 25px;
      background: #282c34;
      color: #abb2bf;
      position: absolute;
      padding-top: 10px;

      left: 50%;
      bottom: 0;
      transform: translate(-50%, 0)
    }

    button {
      height: 100%;
      width: 30px;
      height: 30px;
      border: none;
      outline: none;
      background: #373d47;
      color: #abb2bf;
      cursor: pointer;
      border-radius: 25px;

      z-index: 1;

      display: flex;
      justify-content: center;
      align-items: center;

      position: absolute;
      right: 35px;
      top: 50%;
      transform: translateY(-50%);

      font-size: 16px;
    }

    .attach {
      left: 35px;
    }
  }
}

@keyframes zoominout {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}
</style>
