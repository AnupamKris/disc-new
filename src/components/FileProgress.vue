<template>
    <div class="fileprogress" :class="{ 'smallbar': hideText }">
        <div class="fileprogress__bar">
            <div :style="{ width: progress + '%' }" class="__bar" v-if="isProgress"></div>
            <div class="__bar __bar-moving" v-else></div>
        </div>
        <div class=" fileprogress__info" :class="{ 'hide': hideText }">
            <p>{{ filename }}</p>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    filename: String,
    progress: Number,
    isProgress: Boolean,
});

const hideText = ref(false);

onMounted(() => {
    setTimeout(() => {
        hideText.value = true;
    }, 1000);
})
</script>

<style lang="scss" scoped>
.fileprogress {
    position: absolute;
    bottom: 60px;
    right: 30px;
    width: calc(100% - 60px);

    height: 60px;

    border-radius: 5px;
    background: #282c34;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    padding: 0 10px;

    font-size: 10px;

    transition: 0.3s;

    .fileprogress__bar {
        width: 80%;
        height: 5px;

        margin-bottom: 5px;

        display: flex;
        align-items: center;
        background: #373d47;

        border-radius: 5px;
        position: relative;

        .__bar {
            height: 100%;
            width: 50px;
            background: #61afef;
            border-radius: 5px;
            // animation: move 2s linear infinite;
            transition: 0.3s;
            position: absolute;
        }

        .__bar-moving {
            animation: move 2s linear infinite;
            // transform: translateX(-50%);
        }
    }

    .fileprogress__info {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 20px;

        p {
            margin: 0;
            color: #abb2bf;
        }

        transition: 0.3s;
    }

    .hide {
        opacity: 0;
        height: 0;
        width: 50px;
        border-radius: 25px;
    }
}

.smallbar {
    width: 50px;
    height: 50px;

    border-radius: 25px;

    &:hover {
        width: calc(100% - 60px);
        height: 60px;
        border-radius: 5px;
    }
}

// bar move left and write animation
@keyframes move {
    0% {
        left: 0;
    }

    50% {
        left: calc(100% - 50px);
    }

    100% {
        left: 0;
    }
}
</style>