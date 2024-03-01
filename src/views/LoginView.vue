<template>
  <div class="login">
    <div class="container">
      <h1>Login</h1>
      <form>
        <InputField
          label="Email"
          type="email"
          v-model="email"
          :errorMessage="errorMessages.email"
        />
        <InputField
          label="Password"
          type="password"
          v-model="password"
          :errorMessage="errorMessages.password"
        />
        <UIButton text="Login" @click.prevent="signin" />
      </form>
      <p>
        Don't have an account?<RouterLink to="signup">&nbsp;Sign Up</RouterLink>
      </p>
    </div>
  </div>
</template>

<script async setup>
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "vue-router";
import { useFirebaseAuth, getCurrentUser } from "vuefire";
import { watch, ref, onMounted, computed } from "vue";

const auth = useFirebaseAuth();
const password = ref("");
const email = ref("");
const router = useRouter();
const currentUser = await getCurrentUser();

const errorMessages = ref({
  email: "",
  password: "",
});

const checkEmail = () => {
  if (email.value === "") {
    errorMessages.value.email = "Email is required";
  } else {
    let emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email.value)) {
      errorMessages.value.email = "Email is invalid";
    } else {
      errorMessages.value.email = "";
    }
  }
};

const checkPassword = () => {
  if (password.value === "") {
    errorMessages.value.password = "Password is required";
  } else if (password.value.length < 8) {
    errorMessages.value.password = "Password must be at least 8 characters";
  } else {
    errorMessages.value.password = "";
  }
};

const handleError = (err) => {
  if (err.code === "auth/user-not-found") {
    errorMessages.value.email = "User not found";
  } else if (err.code === "auth/wrong-password") {
    errorMessages.value.password = "Wrong password";
  } else {
    errorMessages.value.email = "Invalid Credentials";
  }
};

const signin = async () => {
  try {
    let res = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    console.log(res);
    if (res.user) {
      router.push("/");
    }
  } catch (error) {
    handleError(error);
  }
};

watch(email, () => {
  checkEmail();
});

watch(password, () => {
  checkPassword();
});

onMounted(() => {
  console.log("Login view mounted");
  if (currentUser) {
    router.push("/");
  }
});
</script>

<style lang="scss" scoped>
.login {
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
