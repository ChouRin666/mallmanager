<template>
  <!-- 卡片小容器 -->
  <el-card class="box-card">
    <!-- 面包屑 -->
    <!-- <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb> -->

    <!-- 使用全局自定义组件：面包屑组件 -->
    <my-breadcrumb level1="权限管理" level2="权限列表"></my-breadcrumb>

    <!-- 表格 -->
  </el-card>
</template>

<script>
export default {
  created() {
    this.getRightsList();
  },
  data() {
    return {
      rightsList: [],
    };
  },
  methods: {
    async getRightsList() {
      // // 获取 token
      // const AUTH_TOKEN = localStorage.getItem("token");

      // //需要授权的API  必须在请求头中使用Authorization字段提供token令牌
      // this.$http.defaults.headers.common["Authorization"] = AUTH_TOKEN;

      // 已在自定义插件模块 axios 中，为请求头设置 Authorization 字段提供 token 令牌
      const res = await this.$http.get(`rights/list`);
      console.log(res);

      // 对象解构赋值
      const {
        data,
        meta: { msg, status },
      } = res.data;

      if (status == 200) {
        this.rightsList = data;
        this.$message.success(msg);
      } else {
        this.$message.error(msg);
      }
    },
  },
};
</script>