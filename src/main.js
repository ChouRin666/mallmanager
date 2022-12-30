// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';

// 引入 element-ui 的 js 和 css 文件
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

// 导入 面包屑组件 作为公共组件
// MyBreadCrumb 就是组件选项所在的对象 {template: '', data() {}, props: []}
import MyBreadCrumb from '@/components/custom/myBreadCrumb'

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

// 全局自定义组件：面包屑组件
// 详细写法
/* Vue.component('my-breadcrumb', {
  template: '',
  data() {return {}},
  props: []
}); */

// 简略写法
// Vue.component('my-breadcrumb', MyBreadCrumb);
Vue.component(MyBreadCrumb.name, MyBreadCrumb);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
});
