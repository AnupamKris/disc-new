<template>
  <div class="sidebar" v-if="userDoc">
    {{ statusDoc }}
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
      <h3>Friends</h3>
      <div class="friend" v-for="friend in userDoc.friends" :key="friend">
        <p>{{ friend.username }}</p>
        <p>{{ statusDoc[friend.username] }}</p>
      </div>
    </div>

    <div class="ctl-buttons">
      <button @click="addFriend">
        <ion-icon name="person-add-outline"></ion-icon>
      </button>
      <button @click="logout">
        <ion-icon name="power-outline"></ion-icon>
      </button>
    </div>
  </div>
</template>

<script async setup>
import { getCurrentUser, useDocument, useFirestore } from "vuefire";
import { doc } from "firebase/firestore";

const addFriendVisible = ref(false);
const alertData = ref({
  type: "",
  message: "",
});
const showAlert = ref(false);
const db = useFirestore();
const currentUser = await getCurrentUser();
const userDoc = useDocument(doc(db, "users", currentUser.uid));
const statusDoc = useDocument(doc(db, "status", "status_doc"));

const addFriend = () => {
  addFriendVisible.value = !addFriendVisible.value;
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
  let res = await fetch("http://localhost:5000/acceptFriend", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uid: currentUser.uid,
      frusername: req.username,
    }),
  });
  let data = await res.json();
  if (data.error) {
    alertReq("error", data.error);
  } else {
    alertReq("msg", "Friend Added!");
  }
};
</script>

<style lang="scss" scoped>
.sidebar {
  height: 100%;
  background: #282c34;
  width: 300px;
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
    h3 {
      margin-bottom: 5px;
    }
    .friend {
      height: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      //   background: #21252b;

      //   padding: 0 10px;
      //   border-radius: 5px;
      margin-bottom: 5px;
      border-bottom: 1px solid #373d47;
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
