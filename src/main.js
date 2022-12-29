// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';

// 引入 element-ui 的 js 和 css 文件
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

// 引入全局样式文件 reset.css
import '@/assets/css/reset.css'

// 引入 axios
// import axios from 'axios'
// Vue.prototype.$http = axios

// import MyHttpServer from './plugins/http';
import MyHttpServer from '@/plugins/http.js';

Vue.config.productionTip = false;

// 调用 Vue 插件
Vue.use(ElementUI);
Vue.use(MyHttpServer);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});
