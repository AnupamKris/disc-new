<template>
    <div class="video-player" @dblclick="isFullScreen = !isFullScreen" :class="{ fullscreen: isFullScreen }">
        <div class="filename">{{ filename }}</div>
        <video :src="videoUrl" ref="video"></video>
        <div class="controls" v-if="isLoaded">
            <div class="buttons">
                <button @click="togglePause">
                    <ion-icon :name="isPaused ? 'play' : 'pause'"></ion-icon>
                </button>
                <p class="duration">
                    {{ padInt(video.currentTime / 60) }}:{{ padInt(video.currentTime % 60) }}
                    /
                    {{ padInt(video.duration / 60) }}:{{ padInt(video.duration % 60) }}
                </p>


                <div class="vol-ctrl">
                    <button @click="toggleMute">
                        <ion-icon :name="isMuted ? 'volume-mute' : 'volume-high'"></ion-icon>
                    </button>
                    <!-- <div class="slider-wrapper">
                        <input type="range" class="volume" v-model="volume" step="0.01" min="0" max="1"
                            @input="updateVolume" />

                    </div> -->
                    <InputRange v-model="volume" :min="0" :max="1" @input="updateVolume" />
                </div>

            </div>
            <InputRange v-model="seek" @input="updateSeek" :max="100" />


        </div>
    </div>
</template>

<script setup>

const props = defineProps({
    videoUrl: String,
    filename: String,
});

const video = ref(null);

const isPaused = ref(true);
const isMuted = ref(false);
const isLoaded = ref(false);
const isFullScreen = ref(false);

const volume = ref(1);
const seek = ref(0);


const padInt = (num) => parseInt(num).toString().padStart(2, 0);

const togglePause = () => {
    if (video.value.paused) {
        video.value.play();
    } else {
        video.value.pause();
    }
    isPaused.value = video.value.paused;
};

const updateSeek = () => {
    video.value.currentTime = video.value.duration * (seek.value / 100);
    console.log(video.value.duration * (seek.value / 100), "update");
}

const updateVolume = () => {
    video.value.volume = volume.value;

}

const toggleMute = () => {
    video.value.muted = !video.value.muted;
    isMuted.value = video.value.muted;
}


onMounted(() => {
    video.value.addEventListener('loadeddata', () => {
        isLoaded.value = true;

        video.value.ontimeupdate = () => {
            seek.value = video.value.currentTime / video.value.duration * 100;
            console.log(seek.value, video.value.currentTime, video.value.duration);
        }
    });
})


</script>

<style lang="scss" scoped>
.video-player {
    position: relative;

    .filename {
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
        background: linear-gradient(180deg, #000000c1, transparent);
        color: white;
        padding: 5px;
        width: 100%;
        transition: 0.3s;


    }

    .controls {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        opacity: 0;
        background: #00000055;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding: 5px;
        transition: 0.3s;



        .buttons {
            display: flex;
            align-items: center;


            width: 100%;
            margin-bottom: 3px;

            button {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                margin-right: 10px;
                cursor: pointer;

                display: flex;
                justify-content: center;
                align-items: center;

                // flex: 1;

                // width: 33%;
            }



            .duration {
                color: white;
                // margin: 0 10px;
                width: 80px;
                font-size: 12px;

            }

            .vol-ctrl {
                width: 120px;
                min-width: 120px;
                margin-left: auto;

                display: flex;
                justify-content: center;
                align-items: center;
                // padding-right: 10px;

                .volume {
                    width: 100%;
                }

                .slider-wrapper {
                    margin: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;

                    input {
                        transform: translateX(3px);
                    }
                }
            }

        }


        .seek {
            // width: 100%;
            // margin: 0 10px;
            // margin-bottom: 5px
        }

    }

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

    &:hover {
        .filename {
            opacity: 1;
        }

        .controls {
            opacity: 1;
        }

    }
}

.fullscreen {
    position: fixed;
    top: 40px;
    left: 0;

    height: calc(100% - 40px) !important;
    width: 100%;

    z-index: 10;

    .controls {
        background: #21252b;
    }


}

video {
    height: 100%;
    width: 100%;
}
</style>