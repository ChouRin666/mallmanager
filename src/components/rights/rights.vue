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
    <el-table :data="rightsList" height="800px" border class="rightsTable">
      <el-table-column type="index" label="#" width="150px"> </el-table-column>
      <el-table-column prop="authName" label="权限名称" width="240px">
      </el-table-column>
      <el-table-column prop="path" label="路径" width="240px">
      </el-table-column>
      <el-table-column label="层级">
        <!-- 
            1、如果单元格内显示的内容不是字符串（文本），
              需要给被显示的内容外层包裹一个 template。
            2、template 内部要用数据，设置 slot-scope 属性，
              该属性的值需要使用数据 level 的数据源 rightsList。
            3、slot-scope 的值 rightsList 其实就是 el-table 绑定的数据 rightsList，
              rightsList.row 是指数组中的每个对象。
            4、slot-scope 的作用就是传值，会自动去上一级找最外层标签 el-table 
              绑定的数据源 rightsList。slot-scope 的属性可赋任意变量(如：scope)，
              最终找到的数据源会把值传给该变量。
        -->
        <template slot-scope="scope">
          <span v-if="scope.row.level == 0">一级</span>
          <span v-if="scope.row.level == 1">二级</span>
          <span v-if="scope.row.level == 2">三级</span>
        </template>
      </el-table-column>
    </el-table>
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
      // type 值为 list 或 tree , list 列表显示权限, tree 树状显示权限
      const res = await this.$http.get(`rights/list`);
      // console.log(res);

      // 对象解构赋值
      const {
        data,
        meta: { msg, status },
      } = res.data;

      if (status == 200) {
        this.rightsList = data;

        // 提示获取权限列表成功
        // this.$message.success(msg);
      } else {
        // 提示获取权限列表失败
        this.$message.error(msg);
      }
    },
  },
};
</script>

<style>
.rightsTable {
  width: 100%;
  margin-top: 20px;
}
</style>