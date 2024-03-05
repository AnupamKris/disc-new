<template>
    <div class="slider-wrapper">
        <input type="range" class="volume" v-model="value" :step="step" :min="min" :max="max"
            :style="{ background: bg }" />
    </div>
</template>

<script setup>
const value = defineModel()

const props = defineProps({
    step: {
        type: Number,
        default: 0.01
    },
    min: {
        type: Number,
        default: 0
    },
    max: {
        type: Number,
        default: 1
    },
    bg: {
        type: String,
        default: "#282c34"
    }
});


</script>

<style lang="scss" scoped>
.slider-wrapper {
    width: 100%;
    height: 12px;
    border-radius: 3px;
    overflow: hidden;

    margin-bottom: 5px;
    display: flex;
    justify-content: center;
    align-items: center;


}

input[type="range"] {
    -webkit-appearance: none;
    width: 100%;
    min-width: 100%;
    height: 100%;

    background: #282c34;
    border-radius: 3px;
    outline: none;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 12px;
    width: 5px;

    border-radius: 10px;
    background: #ffffff;
    cursor: ew-resize;
    box-shadow: 0 0 2px 0 #555;
    transition: background 0.3s ease-in-out;
    z-index: 2;
    border: 2px solid #4d78cc;
    box-shadow: -15002px 0 0 15000px #4d78cc;

    box-sizing: border-box;
}

input[type="range"]::-webkit-slider-runnable-track {
    -webkit-appearance: none;
    box-shadow: none;
    border: none;
}
</style>