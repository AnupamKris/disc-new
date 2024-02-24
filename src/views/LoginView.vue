<template>
  <div class="login">
    <h1>Login</h1>
    <form>
      <InputField label="Email" type="email" />
      <InputField label="Password" type="password" />
      <UIButton text="Login" @click.prevent />
    </form>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.login {
  background: #262226;
}
</style>
