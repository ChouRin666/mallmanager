<template>
  <div class="login-wrap">
    <el-form
      class="login-form"
      label-position="top"
      label-width="80px"
      :model="formdata"
    >
      <h2>用户登录</h2>
      <el-form-item label="用户名">
        <el-input v-model="formdata.username"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="formdata.password"></el-input>
      </el-form-item>
      <el-button 
      @click.prevent = "handleLogin()"
      type="primary" class="login-btn">登录</el-button>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      formdata: {
        username: "",
        password: "",
      },
    };
  },
  methods: {
    // 登录请求
    /* handleLogin() {

      // 异步代码，返回结果写在 then 方法的函数中
      this.$http.post('login', this.formdata)
          .then((res) => {

            console.log(res);

            // 对象结构赋值
            const { 
              data, 
              meta: {msg, status}
            } = res.data;

            // 登录成功
            if(status == 200) {
              // 1.提示成功
              this.$message.success(msg);
              // 2.跳转到home
              this.$router.push({name: 'home'});
            }
            else {
              // 登录失败
              // 1.提示错误消息
              this.$message.error(msg);
            }
            
          });
    } */

    // ES 7 提供 async + await 操作
    // 使异步代码看起来像同步代码
    async handleLogin() {

      const res = await this.$http.post('login', this.formdata);

      console.log(res);

      // 对象结构赋值
      const { 
        data, 
        meta: {msg, status}
      } = res.data;

      // 登录成功
      if(status == 200) {
        // 1.提示成功
        this.$message.success(msg);
        // 2.跳转到home
        this.$router.push({name: 'home'});
      }
      else {
        // 登录失败
        // 1.提示错误消息
        this.$message.error(msg);
      }
    }

  }
};
</script>

<style>
.login-wrap {
    height: 100%;
    background-color:#324152;
    /* 弹性盒布局：水平和垂直居中 */
    display: flex;
    justify-content: center;
    align-items: center;
}

.login-wrap .login-form {
    width: 400px;
    background-color: #fff;
    border-radius: 5px;
    padding: 30px;
}

.login-wrap .login-btn {
    width: 100%;
}
</style>