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
                <a href="#" @click.prevent="handleSignout()">退出</a>
            </div>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <el-aside class="aside" width="200px">
        <!-- 侧边栏导航 -->
        <el-menu :unique-opened="true" default-active="2" 
            class="el-menu-vertical-demo">
            
            <el-submenu index="1">
                <template slot="title">
                    <i class="el-icon-location"></i>
                    <span>用户管理</span>
                </template>
                <el-menu-item index="1-1">
                    <i class="el-icon-menu"></i>
                    <span>用户列表</span>
                </el-menu-item>
            </el-submenu>

            <el-submenu index="2">
                <template slot="title">
                    <i class="el-icon-location"></i>
                    <span>权限管理</span>
                </template>
                <el-menu-item index="2-1">
                    <i class="el-icon-menu"></i>
                    <span>角色列表</span>
                </el-menu-item>
                <el-menu-item index="2-2">
                    <i class="el-icon-menu"></i>
                    <span>权限列表</span>
                </el-menu-item>
            </el-submenu>

            <el-submenu index="3">
                <template slot="title">
                    <i class="el-icon-location"></i>
                    <span>商品管理</span>
                </template>
                <el-menu-item index="3-1">
                    <i class="el-icon-menu"></i>
                    <span>商品列表</span>
                </el-menu-item>
                <el-menu-item index="3-2">
                    <i class="el-icon-menu"></i>
                    <span>分类参数</span>
                </el-menu-item>
                <el-menu-item index="3-3">
                    <i class="el-icon-menu"></i>
                    <span>商品分类</span>
                </el-menu-item>
            </el-submenu>

            <el-submenu index="4">
                <template slot="title">
                    <i class="el-icon-location"></i>
                    <span>订单管理</span>
                </template>
                <el-menu-item index="4-1">
                    <i class="el-icon-menu"></i>
                    <span>订单列表</span>
                </el-menu-item>
            </el-submenu>

            <el-submenu index="5">
                <template slot="title">
                    <i class="el-icon-location"></i>
                    <span>数据统计</span>
                </template>
                <el-menu-item index="5-1">
                    <i class="el-icon-menu"></i>
                    <span>数据报表</span>
                </el-menu-item>
            </el-submenu>
        
        </el-menu>
      </el-aside>
      <el-main class="main">Main</el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {

    // newVue 之前自动触发
    beforeCreate() {

        // 获取 token
        const token = localStorage.getItem('token');

        // 如果没有 token，页面跳转到登录界面
        if(!token) {
            this.$router.push({name: 'login'});
        }
    },
    methods: {

        handleSignout() {
            // 清除 token
            localStorage.removeItem('token');
            // 提示退出成功
            this.$message.success('退出成功');
            // 跳转到登录界面
            this.$router.push({name: 'login'});
        }
    }

};
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