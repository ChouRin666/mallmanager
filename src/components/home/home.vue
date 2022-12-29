<template>
  <el-container class="container">
    <el-header class="header">
      <el-row>
        <el-col :span="4">
            <div class="grid-content bg-purple">
                <img src="../../assets/logo.png" alt="无法显示图片">
            </div>
        </el-col>
        <el-col :span="18">
            <div class="grid-content bg-purple-light">
                <h3>电商后台管理系统</h3>  
            </div>
        </el-col>
        <el-col :span="2">
            <div class="grid-content bg-purple">
                <a href="#">退出</a>
            </div>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <el-aside class="aside" width="200px">Aside</el-aside>
      <el-main class="main">Main</el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {};
</script>

<style>
.container {
  height: 100%;
}

.header {
  background-color: #b3c0d1;
}

.header img {
    width: 50px;
    height: 50px;
    margin-top: 5px;
}

.header h3 {
    color: #fff;
    text-align: center;
    margin: 5px 0 0;
}

.header a {
    text-decoration: none;
    margin-top: 10px;
}

.header a:hover {
    text-decoration: underline;
    color: #fff;
}

.aside {
  background-color: #d3dce6;
}

.main {
  background-color: #e9eef3;
  /* height: 100%; */
}
</style>