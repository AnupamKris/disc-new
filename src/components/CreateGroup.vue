<template>
  <div class="overlay" @click.self="close">
    <div class="modal">
      <h3>Create Group</h3>
      <InputField
        label="GroupName"
        type="text"
        v-model="groupname"
        :errorMessage="errorMessages.username"
      />
      <UIButton text="Create Group" @click.prevent="createGroup" />
    </div>
  </div>
</template>

<script setup>
import { getCurrentUser } from "vuefire";
import {
  doc,
  updateDoc,
  addDoc,
  arrayUnion,
  collection,
  getDoc,
  where,
  query,
  getDocs,
} from "firebase/firestore";
import { useFirestore } from "vuefire";

const db = useFirestore();
const groupname = ref("");
const currentUser = await getCurrentUser();
const emit = defineEmits(["close", "requestSent"]);
const errorMessages = ref({
  groupname: "",
});

const createGroup = async () => {
  if (groupname.value === "") {
    errorMessages.value.groupname = "Group Name is required";
  } else if (groupname.value === currentUser.displayName) {
    errorMessages.value.groupname = "You can't add yourself as a friend";
  } else {
    // let res = await axios.post("http://localhost:5000/addFriend", {
    //   uid: currentUser.uid,
    //   frusername: username.value,
    // });
    let chatObj = await addDoc(collection(db, "chats"), {
      messages: [],
    });
    let chatId = await chatObj.id;

    let selfDocRef = doc(db, "users", currentUser.uid);
    let grp = await addDoc(collection(db, "groups"), {
      name: groupname.value,
      members: [currentUser.uid],
      owner: currentUser.uid,
      chatId: chatId,
    });

    await updateDoc(selfDocRef, {
      groups: arrayUnion({
        name: groupname.value,
        id: await grp.id,
        chatId: chatId,
      }),
    });

    emit("close");
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

  z-index: 5;

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
