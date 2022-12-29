<template>
  <!-- 卡片小容器 -->
  <el-card class="box-card">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 搜索 -->
    <el-row class="searchRow">
      <el-col>
        <el-input
          placeholder="请输入内容"
          v-model="query"
          class="input-with-select inputSearch"
        >
          <el-button slot="append" icon="el-icon-search"></el-button>
        </el-input>
        <el-button type="success">添加用户</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table :data="tableData" style="width: 100%">
        <!-- type="index"  设置该列的每个单元格的内容是从 1 开始的序号 -->
      <el-table-column type="index" label="#" width="60"> </el-table-column>
      <el-table-column prop="name" label="姓名" width="100"> </el-table-column>
      <el-table-column prop="address" label="邮箱" width="260"> </el-table-column>
      <el-table-column prop="name" label="电话" width="150"> </el-table-column>
      <el-table-column prop="name" label="创建日期" width="180"> </el-table-column>
      <el-table-column prop="name" label="用户状态" width="180"> </el-table-column>
      <el-table-column prop="name" label="操作"> </el-table-column>
    </el-table>

    <!-- 分页 -->

  </el-card>
</template>

<script>
export default {
  data() {
    return {
      query: "",
      pagenum: 1,
      pagesize: 5,
      tableData: [{
            date: '2016-05-02',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1518 弄'
          }, {
            date: '2016-05-04',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1517 弄'
          }, {
            date: '2016-05-01',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1519 弄'
          }, {
            date: '2016-05-03',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1516 弄'
          }]
    };
  },
  created() {
    // 初始化用户列表信息
    this.getUserList();
  },
  methods: {
    // 获取用户列表的请求
    async getUserList() {
        //query  查询参数 可以为空
        //pagenum 当前页码   不能为空
        //pagesize 每页显示条数  不能为空

        // 获取 token
        const AUTH_TOKEN = localStorage.getItem('token');
        
        //需要授权的API  必须在请求头中使用Authorization字段提供token令牌
        this.$http.defaults.headers.common['Authorization'] = AUTH_TOKEN;

        const res = await this.$http.get(
            `users?query=${this.query}&pagenum=${this.pagenum}&pagesize=${this.pagesize}`
        );
        console.log(res);
    }
  }
};
</script>

<style>
.box-card {
  height: 100%;
}

.searchRow {
  margin-top: 20px;
}

.inputSearch {
  width: 400px;
}
</style>