<template>
    <div class="image-viewer" :class="{ fullscreen: isFullScreen }">
        <img :src="imageUrl" alt="" @dblclick="isFullScreen = !isFullScreen">
    </div>
</template>

<script setup>
const props = defineProps({
    imageUrl: String,
});

const isFullScreen = ref(false);



</script>

<style lang="scss" scoped>
.image-viewer {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }
}

.fullscreen {
    position: fixed;
    top: 40px;
    left: 0;
    width: 100%;
    height: calc(100% - 40px);
    background: #00000086;
    z-index: 1000;

    img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }
}
</style>