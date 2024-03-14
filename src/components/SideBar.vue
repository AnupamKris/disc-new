<template>
  <div class="sidebar" v-if="userDoc && statusDoc">
    <AddFriend
      v-if="addFriendVisible"
      @close="addFriendVisible = false"
      @requestSent="alertReq('msg', 'Friend Request Sent!')"
    />
    <AlertMessage
      :type="alertData.type"
      :message="alertData.message"
      v-if="alertData.message"
    />

    <div
      class="reqs"
      v-if="
        userDoc.friendRequests.filter((req) => req.type === 'incoming').length
      "
    >
      <h3>Friend Requests</h3>
      <div
        class="req"
        v-for="req in userDoc.friendRequests.filter(
          (req) => req.type === 'incoming'
        )"
        :key="req"
      >
        <p>{{ req.username }}</p>
        <div class="req-ctl">
          <button @click="acceptFriend(req)">
            <ion-icon name="checkmark-outline"></ion-icon>
          </button>
          <button @click="rejectFriend(req)">
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>
    </div>
    <div class="friends">
      <div class="group">
        <h3
          :class="{ active: currentSection == 'friends' }"
          @click="setSection('friends')"
        >
          <ion-icon name="people-outline"></ion-icon>
        </h3>
        <h3
          :class="{ active: currentSection == 'groups' }"
          @click="setSection('groups')"
        >
          <ion-icon name="chatbubbles-outline"></ion-icon>
        </h3>
        <h3 @click="toggleCreateGroup">
          <ion-icon name="add-circle-outline"></ion-icon>
        </h3>
      </div>
      <div class="items" v-if="currentSection == 'friends'">
        <div
          class="friend"
          v-for="friend in userDoc.friends"
          :key="friend"
          @click="selectFriend(friend)"
        >
          <p class="name">{{ friend.username }}</p>
          <p
            class="unseen"
            v-if="
              rtcData.notficationChats.filter(
                (uname) => uname == friend.username
              ).length
            "
          >
            {{
              rtcData.notficationChats.filter(
                (uname) => uname == friend.username
              ).length
            }}
          </p>
          <!-- <p
          class="stat online"
          v-if="rtcData.friendsObjects.includes(friend.username)"
        >
          online
        </p>
        <p class="stat" v-else>offline</p> -->
        </div>
      </div>
      <div class="items" v-else>
        <div
          class="friend"
          v-for="group in userDoc.groups"
          :key="group"
          @click="selectGroup(group)"
        >
          <p>{{ group.name }}</p>
        </div>
      </div>
    </div>

    <div class="ctl-buttons">
      <button @click="toggleSettings">
        <ion-icon name="settings-outline"></ion-icon>
      </button>
      <button @click="addFriend">
        <ion-icon name="person-add-outline"></ion-icon>
      </button>
      <button @click="logout">
        <ion-icon name="power-outline"></ion-icon>
      </button>
    </div>
  </div>
  <CallNotification
    v-if="rtcData.isCallIncoming"
    :callerId="rtcData.callerId"
  />
  <FileProgress
    v-if="rtcData.isTransferInProgress"
    :isProgress="rtcData.isTransferInProgress"
    :progress="rtcData.transferProgress"
    :filename="rtcData.transferFileName"
  />
  <CallSettings v-if="showSettings" @close="toggleSettings" />
  <CallPopUp v-if="rtcData.isCallOutgoing || rtcData.isCallInProgress" />
  <CreateGroup v-if="showCreateGroup" @close="toggleCreateGroup" />

  <audio :src="ringing" autoplay loop v-if="rtcData.isCallIncoming"></audio>
  <audio :src="waiting" autoplay loop v-if="rtcData.isCallOutgoing"></audio>
  <audio :src="popsound" ref="notifRef"></audio>
  <audio autoplay ref="audioRef"></audio>
</template>

<script async setup>
import {
  getCurrentUser,
  useDocument,
  useFirestore,
  useFirebaseAuth,
} from "vuefire";
import ringing from "@/assets/ringing.wav";
import waiting from "@/assets/waiting.wav";
import popsound from "@/assets/pop.mp3";
import {
  addDoc,
  collection,
  doc,
  setDoc,
  updateDoc,
  query,
  getDocs,
  where,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useRouter } from "vue-router";
import { watch, ref, onMounted } from "vue";
import { useNewRtcDataStore } from "../stores/newRtcData";
import CallNotification from "./CallNotification.vue";
import CallPopUp from "./CallPopUp.vue";
import AlertMessage from "./AlertMessage.vue";
import AddFriend from "./AddFriend.vue";

const notifRef = ref(null);
const addFriendVisible = ref(false);
const alertData = ref({
  type: "",
  message: "",
});
const showAlert = ref(false);
const showSettings = ref(false);
const db = useFirestore();
const currentUser = await getCurrentUser();
const userDoc = useDocument(doc(db, "users", currentUser.uid));
const statusDoc = useDocument(doc(db, "status", "status_doc"));
const auth = useFirebaseAuth();
const router = useRouter();
const rtcData = useNewRtcDataStore();
const emit = defineEmits(["call", "selectFriend", "selectGroup"]);
const audioRef = ref(null);
const lastNotif = ref(0);
const currentSection = ref("friends");
const showCreateGroup = ref(false);

const addFriend = () => {
  addFriendVisible.value = !addFriendVisible.value;
};

const selectFriend = (friend) => {
  console.log(friend);
  emit("selectFriend", friend);
  removeNotification(friend.username);
};

const selectGroup = (group) => {
  console.log(group);
  // let groupDoc = doc(db, "groups", group.id);

  emit("selectGroup", group);
  removeNotification(group.name);
};

const alertReq = (type, message) => {
  alertData.value.type = type;
  alertData.value.message = message;
  showAlert.value = true;
  setTimeout(() => {
    alertData.value.message = "";
    showAlert.value = false;
  }, 3000);
};

const acceptFriend = async (req) => {
  let selfReqData = req;
  let friendReqData = {
    timestamp: selfReqData.timestamp,
    type: "outgoing",
    username: currentUser.displayName,
  };

  let friendDocQuery = query(
    collection(db, "users"),
    where("username", "==", selfReqData.username)
  );

  let friendDocRef = await getDocs(friendDocQuery);
  friendDocRef = friendDocRef.docs[0].ref;

  let selfDocRef = doc(db, "users", currentUser.uid);
  let chatObj = await addDoc(collection(db, "chats"), {
    messages: [],
  });
  let chatId = chatObj.id;

  let selfFriendData = {
    username: selfReqData.username,
    chatId: chatId,
    timestamp: new Date(),
  };

  let friendFriendData = {
    username: friendReqData.username,
    chatId: chatId,
    timestamp: new Date(),
  };

  await updateDoc(selfDocRef, {
    friends: arrayUnion(selfFriendData),
    friendRequests: arrayRemove(selfReqData),
  });

  await updateDoc(friendDocRef, {
    friends: arrayUnion(friendFriendData),
    friendRequests: arrayRemove(friendReqData),
  });

  alertReq("msg", "Friend Request Accepted!");
};

const rejectFriend = async (req) => {
  let selfReqData = req;
  let friendReqData = {
    timestamp: selfReqData.timestamp,
    type: "outgoing",
    username: currentUser.displayName,
  };

  let friendDocQuery = query(
    collection(db, "users"),
    where("username", "==", selfReqData.username)
  );

  let friendDocRef = await getDocs(friendDocQuery);
  friendDocRef = friendDocRef.docs[0].ref;

  let selfDocRef = doc(db, "users", currentUser.uid);

  await updateDoc(selfDocRef, {
    friendRequests: arrayRemove(selfReqData),
  });

  await updateDoc(friendDocRef, {
    friendRequests: arrayRemove(friendReqData),
  });

  alertReq("msg", "Friend Request Rejected!");
};

const logout = async () => {
  console.log("logging out");
  await signOut(auth);
  router.push("/login");
};

const removeNotification = (uname) => {
  rtcData.notficationChats = rtcData.notficationChats.filter(
    (username) => username != uname
  );
};

const setSection = (sect) => {
  currentSection.value = sect;
};

// const createGroup = () => {
//   console.log("create group");

//   toggleCreateGroup
//   // alertReq("msg", "Feature Coming Soon!");
// };

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
};

const toggleCreateGroup = () => {
  showCreateGroup.value = !showCreateGroup.value;
};

onMounted(() => {
  console.log("sidebar mounted", currentUser.displayName);
  rtcData.createPeerConnection(currentUser.displayName);
  let notifChats = JSON.parse(localStorage.getItem("notficationChats"));
  if (notifChats) {
    rtcData.notficationChats = notifChats;
    lastNotif.value = notifChats.length;
  }
});

watch(rtcData, (newVal) => {
  if (lastNotif.value < newVal.notficationChats.length) {
    notifRef.value.src = popsound;
    notifRef.value.play();
    lastNotif.value = newVal.notficationChats.length;
  }
  if (newVal.otherAudioStream && newVal.isCallInProgress) {
    console.log("new audio stream", newVal.otherAudioStream);
    audioRef.value.srcObject = newVal.otherAudioStream;
  } else {
    console.log(rtcData.notficationChats);
    localStorage.setItem(
      "notficationChats",
      JSON.stringify(rtcData.notficationChats)
    );
  }
});
</script>

<style lang="scss" scoped>
.sidebar {
  height: 100%;
  background: #282c34;
  border-right: 1px solid #373d47;
  min-width: 300px;
  display: flex;
  flex-direction: column;

  padding: 0 10px;

  .friends,
  .reqs {
    padding: 10px;
    color: #abb2bf;
  }

  .reqs {
    h3 {
      margin-bottom: 5px;
    }

    .req {
      height: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      background: #21252b;

      padding: 0 10px;
      border-radius: 5px;

      .req-ctl {
        display: flex;
        justify-content: center;
        align-items: center;

        button {
          width: 20px;
          height: 20px;
          border-radius: 15px;
          margin-left: 5px;
          display: flex;

          font-size: 14px;

          justify-content: center;
          align-items: center;
          background: #373d47;
          color: #abb2bf;
          border: none;
          outline: none;
          cursor: pointer;

          &:hover {
            background: #4d78cc;
            color: #282c34;
          }
        }
      }
    }
  }

  .friends {
    .group {
      display: flex;
      // justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #373d47;
      margin-bottom: 10px;

      h3 {
        // background: #373d47;
        padding: 10px;
        // border-radius: 5px;

        display: flex;
        justify-content: center;
        align-items: center;

        border-right: 1px solid #373d47;

        &:hover {
          background: #373d47;
        }
      }

      .active {
        color: #4d78cc;
      }

      ion-icon {
        font-size: 24px;
      }
    }

    .friend {
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      //   background: #21252b;

      padding: 0 10px;
      //   border-radius: 5px;
      margin-bottom: 5px;
      border-bottom: 1px solid #373d47;
      transition: 0.3s;

      &:hover {
        background: #373d47;
        border-radius: 5px;
      }

      .unseen {
        width: 18px;
        height: 18px;
        border-radius: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #4d78cc;
        color: #282c34;
        font-size: 10px;
        font-weight: bold;
      }
    }

    .online {
      color: #4dcc77;

      .stat {
        color: #4dcc77;
      }
    }

    .offline {
      color: #ff6b6b;

      .stat {
        color: #ff6b6b;
      }
    }
  }

  .ctl-buttons {
    margin-top: auto;
    height: 60px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;

    button {
      height: 40px;
      width: 40px;
      margin-right: 10px;
      border-radius: 20px;

      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 18px;

      outline: none;
      border: none;
      background: #373d47;
      color: #abb2bf;

      cursor: pointer;

      &:hover {
        background: #4d78cc;
        color: #282c34;
      }
    }
  }
}
</style>
