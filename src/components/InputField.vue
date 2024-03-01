<template>
  <div class="input-field">
    <div class="field">
      <label :class="{ error: errorMessage.length }" :for="id"
        ><ion-icon :name="iconname"></ion-icon
      ></label>
      <input
        :class="{ error: errorMessage.length }"
        :type="type"
        :id="id"
        :name="id"
        @blur="emit('blur')"
        v-model="modelValue"
        :placeholder="'Enter ' + label"
      />
    </div>
    <p :class="{ 'error-active': errorMessage.length }">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { computed } from "vue";
const modelValue = defineModel();

const props = defineProps({
  id: String,
  type: String,
  label: String,
  placeholder: String,
  errorMessage: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["blur"]);

const iconname = computed(() => {
  if (props.label.toLowerCase() === "password") {
    return "lock-open-outline";
  } else if (props.label.toLowerCase() === "email") {
    return "mail-outline";
  } else if (props.label.toLowerCase() === "repeat password") {
    return "lock-closed-outline";
  } else {
    return "at-outline";
  }
});
</script>

<style lang="scss" scoped>
.input-field {
  display: flex;
  flex-direction: column;
  margin-top: 10px;

  .field {
    display: flex;
  }

  label {
    height: 40px;
    width: auto;

    padding: 0 10px;
    display: flex;
    justify-content: center;
    align-items: center;

    background: #21252b;
    color: #abb2bf;
    border: 1px solid #373d47;

    font-size: 14px;

    border-radius: 5px 0 0 5px;

    min-width: 50px;
  }

  input {
    height: 40px;
    width: 100%;

    padding: 0 10px;
    display: flex;
    justify-content: center;
    align-items: center;

    background: #21252b;
    color: #abb2bf;

    font-size: 14px;

    border-radius: 0 5px 5px 0;
    border: 1px solid #373d47;
    border-left: none;

    outline: none;
  }

  p {
    font-size: 12px;
    color: #ff7c7c;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .error-active {
    opacity: 1;
  }

  .error {
    border-color: #ff7c7c;
    color: #ff7c7c;
  }
}
</style>
