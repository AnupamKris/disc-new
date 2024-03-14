import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
    import { VueFire, VueFireAuth } from 'vuefire'
    import { app as firebaseApp } from './firebaseConfig'
import { createVCodeBlock } from '@wdns/vue-code-block';

import App from './App.vue'
import router from './router'

const VCodeBlock = createVCodeBlock({
    // options
});


const app = createApp(App)

app.use(createPinia())
app.use(VCodeBlock)
app.use(router)
app.use(VueFire, {
    // imported above but could also just be created here
    firebaseApp,
    modules: [
        // we will see other modules later on
        VueFireAuth(),
    ],
})

app.mount('#app')
