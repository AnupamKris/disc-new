<template>
  <div class="signup">
    <div class="container">
      <h1>Sign Up</h1>
      <form>
        <InputField
          label="Email"
          type="email"
          v-model="email"
          :errorMessage="errorMessages.email"
          @blur="checkEmailExists"
        />
        <InputField
          label="Username"
          type="text"
          v-model="username"
          :errorMessage="errorMessages.username"
          @blur="checkUsernameExists"
        />
        <InputField
          label="Password"
          type="password"
          v-model="password"
          :errorMessage="errorMessages.password"
        />
        <InputField
          label="Repeat Password"
          type="password"
          v-model="repeatPassword"
          :errorMessage="errorMessages.repeatPassword"
        />
        <UIButton text="Sign Up" @click.prevent="signup" />
      </form>
      <p>
        Already have an account?<RouterLink to="login">&nbsp;Login</RouterLink>
      </p>
    </div>
  </div>
</template>

<script async setup>
import { useFirestore, useFirebaseAuth, getCurrentUser } from "vuefire";
import { collection, getDocs, where, query } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useRouter } from "vue-router";
import axios from "axios";
import { onMounted } from "vue";

const db = useFirestore();
const password = ref("");
const email = ref("");
const username = ref("");
const repeatPassword = ref("");
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
const auth = useFirebaseAuth();
const router = useRouter();
const currentUser = await getCurrentUser();

const errorMessages = ref({
  email: "",
  username: "",
  password: "",
  repeatPassword: "",
});

const checkEmailExists = async () => {
  const user = query(
    collection(db, "users"),
    where("email", "==", email.value)
  );
  const docSnap = await getDocs(user);
  console.log(docSnap.docs.length);
  if (docSnap.docs.length > 0) {
    errorMessages.value.email = "Email already exists";
  } else {
    errorMessages.value.email = "";
  }
};

const checkUsernameExists = async () => {
  const user = query(
    collection(db, "users"),
    where("username", "==", username.value)
  );
  const docSnap = await getDocs(user);
  console.log(docSnap.docs.length);
  if (docSnap.docs.length > 0) {
    errorMessages.value.username = "Username already exists";
  } else {
    errorMessages.value.username = "";
  }
};

watch(email, () => {
  if (email.value === "") {
    errorMessages.value.email = "Email is required";
  } else if (!emailRegex.test(email.value)) {
    errorMessages.value.email = "Email is invalid";
  } else {
    errorMessages.value.email = "";
  }
});

watch(username, () => {
  if (username.value === "") {
    errorMessages.value.username = "Username is required";
  } else {
    errorMessages.value.username = "";
  }
});

watch(password, () => {
  if (password.value === "") {
    errorMessages.value.password = "Password is required";
  } else if (password.value.length < 8) {
    errorMessages.value.password = "Password must be at least 8 characters";
  } else {
    errorMessages.value.password = "";
  }
});

watch(repeatPassword, () => {
  if (repeatPassword.value === "") {
    errorMessages.value.repeatPassword = "Repeat Password is required";
  } else if (repeatPassword.value !== password.value) {
    errorMessages.value.repeatPassword = "Passwords do not match";
  } else {
    errorMessages.value.repeatPassword = "";
  }
});

const signup = async () => {
  if (
    errorMessages.value.email === "" &&
    errorMessages.value.username === "" &&
    errorMessages.value.password === "" &&
    errorMessages.value.repeatPassword === "" &&
    email.value !== "" &&
    username.value !== "" &&
    password.value !== "" &&
    repeatPassword.value !== ""
  ) {
    console.log("Sign up");
    let authuser = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    ).catch((error) => {
      console.log(error);
    });

    await updateProfile(authuser.user, {
      displayName: username.value,
    });

    if (authuser.user) {
      await axios.post("http://localhost:5000/createUser", {
        email: email.value,
        username: username.value,
        uid: authuser.user.uid,
      });

      router.push({ name: "home" });
    }
  }
};

onMounted(() => {
  console.log("Signup view mounted");
  if (currentUser) {
    router.push("/");
  }
});
</script>

<style lang="scss" scoped>
.signup {
  background: #282c34;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  h1 {
    color: #ffffff;
    text-align: center;
  }

  .container {
    width: 400px;

    button {
      width: 100%;
    }

    p {
      margin-top: 15px;

      display: flex;
      justify-content: center;
      align-items: center;

      color: #abb2bf;

      a {
        color: #4d78cc;
        cursor: pointer;
        text-decoration: none;
      }
    }
  }
}
</style>
