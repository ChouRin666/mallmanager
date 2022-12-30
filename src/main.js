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

// 引入 axios，原始写法
// import axios from 'axios'
// Vue.prototype.$http = axios

// 把 axios 封装成插件
// import MyHttpServer from './plugins/http';
import MyHttpServer from '@/plugins/http.js';

// 引入 moment
import moment from 'moment'

Vue.config.productionTip = false;

// 调用 Vue 插件
Vue.use(ElementUI);
Vue.use(MyHttpServer);

// 全局过滤器，处理时间格式
Vue.filter('fmtdate', (v) => {
  return moment(v).format('YYYY-MM-DD');
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});
