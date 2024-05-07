import { createApp } from 'vue';
// import './style.css';
import App from './App.vue';
import ElementPlus from 'element-plus';
import Antd from 'ant-design-vue';
import locale from 'element-plus/lib/locale/lang/zh-cn';
import router from '@/router';
import { setupStore } from '@/store';
import 'element-plus/dist/index.css';
import '@/assets/styles/base.scss';
import '@/assets/styles/overall.scss';
import '@/assets/styles/resetElement.scss';
import '@/utils/rem';

const app = createApp(App);
setupStore(app);
app.use(router);
app.use(Antd);
app.use(ElementPlus, { locale }).mount('#app');
