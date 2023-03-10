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
import GoodsList from "@/components/goods/goodslist";
import GoodsAdd from "@/components/goods/goodsadd";
import GoodsEdit from "@/components/goods/goodsedit";
import CateParams from "@/components/goods/cateparams";
import GoodsCate from "@/components/goods/goodscate";
import Orders from "@/components/orders/orders";
import Reports from "@/components/reports/reports";

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
          path: "/users", // 二级目录，从数据库查询出来，不可随便写
          name: "users",  // 用户管理 > 用户列表（自定义 name 值）
          component: Users
        },
        {
          path: "/rights", // 二级目录，从数据库查询出来，不可随便写
          name: "rights",  // 权限管理 > 权限列表（自定义 name 值）
          component: Rights
        },
        {
          path: "/roles", // 二级目录，从数据库查询出来，不可随便写
          name: "roles",  // 权限管理 > 角色列表（自定义 name 值）
          component: Roles
        },
        {
          path: "/goods", // 二级目录，从数据库查询出来，不可随便写
          name: "goods",  // 商品管理 > 商品列表（自定义 name 值）
          component: GoodsList
        },
        {
          path: "/goodsadd", // 三级目录，可自定义
          name: "goodsadd",  // 商品管理 > 商品列表（添加商品）（自定义 name 值）
          component: GoodsAdd
        },
        {
          path: "/goodsedit", // 三级目录，可自定义
          name: "goodsedit",  // 商品管理 > 商品列表（编辑商品）（自定义 name 值）
          component: GoodsEdit
        },
        {
          path: "/params", // 二级目录，从数据库查询出来，不可随便写
          name: "cateparams",  // 商品管理 > 分类参数（自定义 name 值）
          component: CateParams
        },
        {
          path: "/categories", // 二级目录，从数据库查询出来，不可随便写
          name: "goodscate",  // 商品管理 > 商品分类（自定义 name 值）
          component: GoodsCate
        },
        {
          path: "/orders", // 二级目录，从数据库查询出来，不可随便写
          name: "orders",  // 订单管理 > 订单列表（自定义 name 值）
          component: Orders
        },
        {
          path: "/reports", // 二级目录，从数据库查询出来，不可随便写
          name: "reports",  // 数据统计 > 数据报表（自定义 name 值）
          component: Reports
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
