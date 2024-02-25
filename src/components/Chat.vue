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
    <div
      class="calling"
      v-if="rtcData.callIncoming && rtcData.callerId == friend.username"
    >
      <div class="profiles">
        <div class="caller">
          <h3>{{ rtcData.callerId[0].toUpperCase() }}</h3>
        </div>
        <div class="receiver">
          <h3>{{ currentUser.displayName[0].toUpperCase() }}</h3>
        </div>
      </div>
      <div class="buttons">
        <button @click="acceptCall"><ion-icon name="call"></ion-icon></button>
        <button @click="rejectCall"><ion-icon name="close"></ion-icon></button>
      </div>
    </div>
    <div class="chats" v-if="chats">
      <div
        v-for="(chat, index) in chats.messages"
        :key="chat.timestamp"
        :class="{
          same: index != 0 && chats.messages[index - 1].sender == chat.sender,
        }"
        class="chat"
      >
        <span
          :class="{
            visible:
              index == 0 || chats.messages[index - 1].sender != chat.sender,
          }"
          >{{ chat.sender[0].toUpperCase() }}</span
        >
        <div class="content">
          <div
            class="sender"
            :class="{ self: chat.sender == currentUser.displayName }"
            v-if="index == 0 || chats.messages[index - 1].sender != chat.sender"
          >
            <h3>{{ chat.sender }}</h3>
            <p>{{ convertTimestampToDate(chat.timestamp) }}</p>
          </div>
          <p>{{ chat.message }}</p>
        </div>
      </div>
    </div>
    <div class="inputs">
      <button @click="sendChat" class="attach">
        <ion-icon name="attach-outline"></ion-icon>
      </button>
      <input type="text" v-model="chatInput" @keyup.enter="sendChat" />
      <button @click="sendChat" class="send">
        <ion-icon name="send"></ion-icon>
      </button>
    </div>
  </div>
</template>

<script async setup>
import { doc, collection, updateDoc, arrayUnion } from "firebase/firestore";
import { watch } from "vue";
import { useRtcDataStore } from "../stores/rtcData";
import {
  useFirestore,
  useCurrentUser,
  useDocument,
  getCurrentUser,
} from "vuefire";

const db = useFirestore();
const rtcData = useRtcDataStore();

const props = defineProps({
  friend: Object,
  calling: Boolean,
});

const emit = defineEmits(["call", "rejectCall", "acceptCall"]);

const callFriend = () => {
  emit("call");
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
  let chatData = {
    message: chatInput.value,
    sender: currentUser.displayName,
    timestamp: new Date(),
  };
  await updateDoc(chatRef, {
    messages: arrayUnion(chatData),
  });
  chatInput.value = "";
};
</script>

<style lang="scss" scoped>
.chat {
  height: 100%;
  min-width: calc(100% - 300px);
  background: #21252b;
  color: #abb2bf;

  display: flex;
  flex-direction: column;

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

    &::-webkit-scrollbar {
      width: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: #3b4048;
      border-radius: 10px;
    }

    &::-webkit-scrollbar-track {
      background: #282c34;
    }

    .chat {
      height: auto;
      max-width: calc(100% - 20px);
      width: auto;

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

        p {
          word-break: break-all;
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
  }

  .inputs {
    height: 40px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    margin-bottom: 10px;

    input {
      height: 100%;
      width: calc(100% - 60px);
      padding: 0 50px;
      border: none;
      outline: none;
      border-radius: 25px;
      background: #282c34;
      color: #abb2bf;
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
</style>