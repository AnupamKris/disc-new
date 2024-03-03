<template>
  <div class="overlay" @click.self="close">
    <div class="modal">
      <h3>Add Friend</h3>
      <InputField
        label="Username"
        type="text"
        v-model="username"
        :errorMessage="errorMessages.username"
      />
      <UIButton text="Add Friend" @click.prevent="addFriend" />
    </div>
  </div>
</template>

<script setup>
import { getCurrentUser } from "vuefire";
import {
  doc,
  setDoc,
  arrayUnion,
  getDoc,
  where,
  query,
  collection,
  getDocs,
} from "firebase/firestore";
import { useFirestore } from "vuefire";

const db = useFirestore();
const username = ref("");
const currentUser = await getCurrentUser();
const emit = defineEmits(["close", "requestSent"]);
const errorMessages = ref({
  username: "",
});

const addFriend = async () => {
  if (username.value === "") {
    errorMessages.value.username = "Username is required";
  } else if (username.value === currentUser.displayName) {
    errorMessages.value.username = "You can't add yourself as a friend";
  } else {
    // let res = await axios.post("http://localhost:5000/addFriend", {
    //   uid: currentUser.uid,
    //   frusername: username.value,
    // });

    let selfDocRef = doc(db, "users", currentUser.uid);
    let friendDocQuery = query(
      collection(db, "users"),
      where("username", "==", username.value)
    );
    let friendDocRef = await getDocs(friendDocQuery);
    if (friendDocRef.docs.length == 0) {
      errorMessages.value.username = "User does not exist";
      return;
    } else {
      friendDocRef = friendDocRef.docs[0].ref;
    }

    let selfData = {
      timestamp: new Date(),
      type: "outgoing",
      username: username.value,
    };

    let friendData = {
      timestamp: new Date(),
      type: "incoming",
      username: currentUser.displayName,
    };

    await setDoc(
      selfDocRef,
      {
        friendRequests: arrayUnion(selfData),
      },
      { merge: true }
    );
    await setDoc(
      friendDocRef,
      {
        friendRequests: arrayUnion(friendData),
      },
      { merge: true }
    );
    emit("requestSent");
    close();
  }
};

const close = () => {
  emit("close");
};
</script>

<style lang="scss" scoped>
.overlay {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;

  top: 0;
  left: 0;

  height: 100%;
  width: 100%;

  background: rgba(0, 0, 0, 0.5);

  .modal {
    background: #282c34;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);

    h3 {
      color: #abb2bf;
      margin-bottom: 10px;
    }
  }
}
</style>
