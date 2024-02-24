<template>
  <div class="login">
    <div class="container">
      <h1>Login</h1>
      <form>
        <InputField label="Email" type="email" v-model="email" :errorMessage="errorMessages.email" />
        <InputField label="Password" type="password" v-model="password" :errorMessage="errorMessages.password" />
        <UIButton text="Login" @click.prevent />
      </form>
      <p>Don't have an account?<RouterLink to="signup">&nbsp;Sign Up</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue';

const password = ref("");
const email = ref("");

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
  };
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

watch(email, () => {
  checkEmail();
});

watch(password, () => {
  checkPassword();
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
