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
import axios from "axios";
import { getCurrentUser } from "vuefire";

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
    let res = await axios.post("http://localhost:5000/addFriend", {
      uid: currentUser.uid,
      frusername: username.value,
    });
    if (res.data.error) {
      errorMessages.value.username = res.data.error;
    } else {
      errorMessages.value.username = "";
      emit("requestSent");
      setTimeout(() => {
        emit("close");
      }, 100);
    }
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
