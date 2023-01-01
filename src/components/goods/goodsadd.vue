<template>
  <!-- 卡片小容器 -->
  <el-card class="box-card">
    <!-- 使用全局自定义组件：面包屑组件 -->
    <my-breadcrumb level1="商品管理" level2="商品列表"></my-breadcrumb>

    <!-- Alert 提示信息 -->
    <el-alert
      class="alertMsg"
      title="添加商品信息"
      type="info"
      center
      show-icon
    >
    </el-alert>

    <!-- 步骤条 el-steps -->
    <el-steps
      :active="1 * activeTabIdx"
      finish-status="success"
      simple
      style="margin-top: 20px"
    >
      <el-step title="基本信息"></el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品图片"></el-step>
      <el-step title="商品内容"></el-step>
    </el-steps>

    <!-- Tabs 标签页 -->
    <el-tabs
      v-model="activeTabIdx"
      tab-position="left"
      class="tabPane"
      
    >
      <el-tab-pane label="基本信息" name="1">基本信息</el-tab-pane>
      <el-tab-pane label="商品参数" name="2">商品参数</el-tab-pane>
      <el-tab-pane label="商品属性" name="3">商品属性</el-tab-pane>
      <el-tab-pane label="商品图片" name="4">商品图片</el-tab-pane>
      <el-tab-pane label="商品内容" name="5">商品内容</el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
        // 绑定 el-tab-pane 控件的 name 属性值
        // 与 el-steps 控件的 :active 属性联动
        activeTabIdx: 1,
    };
  },
  methods: {},
};
</script>

<style>
.alertMsg {
  margin-top: 20px;
  height: 50px;
}

.alertMsg span {
  line-height: 60px;
}

.tabPane {
  margin-top: 20px;
  height: 600px;
}
</style>