// 插件模块
import axios from "axios";

const MyHttpServer = {};

MyHttpServer.install = Vue => {
  axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";

  // 除了登录请求之外的所有其他请求，都需要设置头部并携带 token
  // 以下方式无法适用登录请求

  // 获取 token
  // const AUTH_TOKEN = localStorage.getItem("token");

  //需要授权的API  必须在请求头中使用Authorization字段提供token令牌
  // axios.defaults.headers.common["Authorization"] = AUTH_TOKEN;

  // 在请求发起之前，会先执行下述回调函数
  // 添加请求拦截器
  axios.interceptors.request.use(
    function(config) {
      // console.log(config);

      // 非登录请求才设置 header 中的 Authorization 字段
      if (config.url != "login") {
        // 获取 token
        const AUTH_TOKEN = localStorage.getItem("token");

        //需要授权的API  必须在请求头中使用Authorization字段提供token令牌
        config.headers.common.Authorization = AUTH_TOKEN;
      }

      // 在发送请求之前做些什么
      return config;
    },
    function(error) {
      // 对请求错误做些什么
      return Promise.reject(error);
    }
  );

  // 添加响应拦截器
  axios.interceptors.response.use(
    function(response) {
      // 对响应数据做点什么
      return response;
    },
    function(error) {
      // 对响应错误做点什么
      return Promise.reject(error);
    }
  );

  Vue.prototype.$http = axios;
};

export default MyHttpServer;
