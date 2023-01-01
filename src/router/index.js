import Vue from "vue";
import Router from "vue-router";
// 传统写法，此处弃用
// import Login from '../components/login/login'
// webpack 封装好路径，通过 @ 寻找 src 文件夹下的文件。  @ -> src
import Login from "@/components/login/login";
import Home from "@/components/home/home";
import Users from "@/components/users/users";
import Rights from "@/components/rights/rights";
import Roles from "@/components/rights/roles";
import Goods from "@/components/goods/goodslist";

// 单独引用 Message
import { Message } from "element-ui";

Vue.use(Router);

// 定义 router 变量接收 Router 对象(vue-router)
const router = new Router({
  routes: [
    {
      path: "/login",
      name: "login",
      component: Login
    },
    {
      path: "/",
      name: "home",
      component: Home,
      children: [
        {
          path: "/users",
          name: "users",
          component: Users
        },
        {
          path: "/rights",
          name: "rights",
          component: Rights
        },
        {
          path: "/roles",
          name: "roles",
          component: Roles
        },
        {
          path: "/goods",
          name: "goods",
          component: Goods
        }
      ]
    }
  ]
});

/* 
如果存在和 home 组件同级的其他组件，又要写一遍 判断 token 的代码（代码冗余）
在路由配置生效之前，由 “路由/导航 守卫” 统一判断是否有 token
to：要跳转的路由配置对象
from：当前的路由配置对象
next：让 to 的路由配置继续生效
*/

// vue-router 提供的导航守卫主要用来通过跳转或取消的方式守卫导航。
router.beforeEach((to, from, next) => {
  // console.log(to, from);
  // to     name: "login", path: "/login"
  // from   name: "home", path: "/"

  // 如果是跳转到登录页面，继续执行后续路由。
  if (to.path == "/login") {
    next();
  } else {
    // 获取 token
    const token = localStorage.getItem("token");

    // 如果没有 token，页面跳转到登录界面
    if (!token) {
      /*  
        全局方法：
        Element 为 Vue.prototype 添加了全局方法 $message。
        因此在 vue instance 中可以采用 Vue 封装好的 $message 方式调用 Message。 
        this.$message.success("提示消息");

        单独引用：
        由于在本页面中不存在 vue instance，因此无法使用上述方式调用 Message。
        Element 提供了单独引入 Message 的方法，此时调用方法类似以下： 
        Message.success(options)。
      */
      // 提示用户重新登录
      Message.warning("用户未登录，请先登录！");

      // 当前页面不是 Vue 文件，没有 Vue 实例对象，即 this，
      // 因此无法使用 Vue 封装好的路由对象 $router
      // this.$router.push({ name: "login" });

      // 路由跳转，方式 1：
      // 由于当前页面存在路由对象 router，可以直接调用。
      // router.push({ name: "login" });

      // 路由跳转，方式 2：
      // 注意：路由标识（name）区分大小写，否则会报以下错误
      // Route with name 'Login' does not exist
      next({ name: "login" });

      return;
    }

    // 如果有 token，继续执行后续路由。
    next();
  }
  // 返回 false 以取消导航
  // return false
});

export default router;
