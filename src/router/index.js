import Vue from 'vue';
import Router from 'vue-router';
// 传统写法，此处弃用
// import Login from '../components/login/login'
// webpack 封装好路径，通过 @ 寻找 src 文件夹下的文件。  @ -> src
import Login from '@/components/login/login'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
  ],
});
