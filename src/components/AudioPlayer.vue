<template>
    <div class="audio-player">
        <div class="icon">
            <ion-icon name="musical-notes-outline"></ion-icon>
        </div>
        <div class="container">
            <p>{{ filename }}</p>
            <audio :src="audioUrl" ref="audio"></audio>
            <div class="controls" v-if="isLoaded">
                <button @click="togglePause">
                    <ion-icon :name="isPaused ? 'play' : 'pause'"></ion-icon>
                </button>

                <p class="duration">
                    {{ padInt(audio.currentTime / 60) }}:{{ padInt(audio.currentTime % 60) }}
                    /
                    {{ padInt(audio.duration / 60) }}:{{ padInt(audio.duration % 60) }}
                </p>

                <div class="vol-ctrl">
                    <button @click="toggleMute">
                        <ion-icon :name="isMuted ? 'volume-mute' : 'volume-high'"></ion-icon>
                    </button>
                    <InputRange v-model="volume" :min="0" :max="1" @input="updateVolume" bg="#21252b" />
                </div>
            </div>
            <InputRange v-model="seek" @input="updateSeek" :max="100" class="seek" bg="#21252b" />
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    audioUrl: String,
    filename: String,
});

const padInt = (num) => parseInt(num).toString().padStart(2, 0);
const audio = ref(null);
const isPaused = ref(true);
const isMuted = ref(false);
const isLoaded = ref(false);

const volume = ref(1);
const seek = ref(0);

const toggleMute = () => {
    audio.value.muted = !audio.value.muted;
    isMuted.value = audio.value.muted;
};

const togglePause = () => {
    if (audio.value.paused) {
        audio.value.play();
    } else {
        audio.value.pause();
    }
    isPaused.value = audio.value.paused;
};

const updateVolume = () => {
    audio.value.volume = volume.value;
};

const updateSeek = () => {
    audio.value.currentTime = (seek.value / 100) * audio.value.duration;
};

onMounted(() => {
    console.log(audio.value);
    audio.value.addEventListener("loadeddata", () => {
        isLoaded.value = true;
        audio.value.onended = () => {
            isPaused.value = true;
        };

        audio.value.ontimeupdate = () => {
            seek.value = (audio.value.currentTime / audio.value.duration) * 100;
        };
    });
});

</script>

<style lang="scss" scoped>
.audio-player {
    display: flex;
    justify-content: center;
    align-items: center;

    .icon {
        font-size: 25px;
        margin-right: 10px;
        width: 40px;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        p {
            color: #abb2bf;
            margin-bottom: 3px;
            font-size: 12px;
        }

        .slider-wrapper {
            .volume {
                background: #abb2bf !important;
            }
        }

        .duration {
            color: #abb2bf;
            margin-bottom: 10px;
            font-size: 12px;
            display: flex;
            justify-content: center;
            align-items: center;

            margin: 0;
        }


    }

    .controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin-bottom: 3px;

        .vol-ctrl {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 120px;
            margin-left: auto;

            .slider-wrapper {
                margin: 0;
            }
        }

        button {
            background: none;
            border: none;
            color: #abb2bf;
            font-size: 20px;
            cursor: pointer;

            display: flex;
            justify-content: center;
            align-items: center;
        }

    }


}
</style>