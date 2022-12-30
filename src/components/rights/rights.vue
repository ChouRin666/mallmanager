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
export default {};
</script>