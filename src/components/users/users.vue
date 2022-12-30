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
          @clear="loadUserList()"
          clearable
          placeholder="请输入内容"
          v-model="query"
          class="input-with-select inputSearch"
        >
          <el-button
            @click="searchUser()"
            slot="append"
            icon="el-icon-search"
          ></el-button>
        </el-input>
        <el-button type="success" @click="showAddUserDia()">添加用户</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table :data="userlist" class="dataTable">
      <!-- type="index"  设置该列的每个单元格的内容是从 1 开始的序号 -->
      <el-table-column type="index" label="#" width="60"> </el-table-column>
      <el-table-column prop="username" label="姓名" width="100">
      </el-table-column>
      <el-table-column prop="email" label="邮箱" width="260"> </el-table-column>
      <el-table-column prop="mobile" label="电话" width="150">
      </el-table-column>
      <el-table-column label="创建日期" width="180">
        <!-- {{ create_time | fmtdate }}  无效用法 -->
        <!-- prop="create_time | fmtdate" 无效用法 -->
        <!-- 
            1、如果单元格内显示的内容不是字符串（文本），需要给被显示的内容外层包裹一个。
            2、template 内部要用数据，设置 slot-scope 属性，
                该属性的值需要使用数据 create_time 的数据源 userlist。
            3、slot-scope 的值 userlist 其实就是 el-table 绑定的数据 userlist，
                userlist.row 是指数组中的每个对象。
            4、slot-scope 的作用就是传值，会自动去上一级找最外层标签 el-table 
                绑定的数据源 userlist。slot-scope 的属性可赋任意变量(如：scope)，
                最终找到的数据源会把值传给该变量。
        -->
        <template slot-scope="userlist">
          {{ userlist.row.create_time | fmtdate }}
        </template>
      </el-table-column>
      <el-table-column label="用户状态" width="180">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.mg_state"
            active-color="#13ce66"
            inactive-color="#ff4949"
          >
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="medium"
            :plain="true"
            type="primary"
            icon="el-icon-edit"
            circle
          >
          </el-button>
          <el-button
            @click="showDeleUserMsgBox(scope.row.id)"
            size="medium"
            :plain="true"
            type="danger"
            icon="el-icon-delete"
            circle
          >
          </el-button>
          <el-button
            size="medium"
            :plain="true"
            type="success"
            icon="el-icon-check"
            circle
          >
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[1, 2, 3, 4, 5]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>

    <!-- 对话框 -->
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogFormVisibleAdd">
      <el-form :model="form">
        <el-form-item label="用户名" label-width="100px">
          <el-input v-model="form.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" label-width="100px">
          <el-input v-model="form.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" label-width="100px">
          <el-input v-model="form.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话" label-width="100px">
          <el-input v-model="form.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleAdd = false">取 消</el-button>
        <el-button type="primary" @click="addUser()">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      query: "",
      pagenum: 1,
      pagesize: 2,
      total: 0,
      userlist: [],
      // 添加对话框的属性
      dialogFormVisibleAdd: false,
      // 添加用户的表单数据
      form: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
    };
  },
  created() {
    // 初始化用户列表信息
    this.getUserList();
  },
  methods: {
    // 显示“删除用户”消息盒子
    showDeleUserMsgBox(userId) {
      this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          // 发送删除用户的请求
          const res = await this.$http.delete(`users/${userId}`);
          console.log(res);

          if(res.data.meta.status == 200) {
            this.pagenum = 1;
            // 更新用户列表信息（视图）
            this.getUserList();
            // 提示删除成功
            this.$message({
                type: "success",
                message: res.data.meta.msg,
            });
          }
          else {
            // 提示删除失败
            this.$message({
                type: "error",
                message: res.data.meta.msg,
            });
          }
          
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    // 添加用户（发送请求）
    async addUser() {
      const res = await this.$http.post("users", this.form);
      console.log(res);

      const {
        data,
        meta: { msg, status },
      } = res.data;

      if (status == 201) {
        // 提示创建成功
        this.$message.success(msg);
        // 更新用户列表信息（视图）
        this.getUserList();
        // 清空对话框中的文本值
        this.form = {};

        // 另一种写法：遍历清空对话框中的文本值（不推荐）
        /* for (const key in this.form) {
                if (this.form.hasOwnProperty(key)) {
                    this.form[key] = "";
                }
            } */
      } else {
        // 提示错误信息
        this.$message.warning(msg);
        // 清空对话框中的文本值
        this.form = {};
      }

      // 关闭“添加用户”对话框
      this.dialogFormVisibleAdd = false;
    },
    // 显示“添加用户”对话框
    showAddUserDia() {
      this.dialogFormVisibleAdd = true;
    },
    // 搜索框清空后重新加载全部用户信息
    loadUserList() {
      this.getUserList();
    },
    // 搜索用户
    searchUser() {
      this.getUserList();
    },
    // 分页
    handleSizeChange(val) {
      // 每页显示条数变化时 触发
      // console.log(`每页 ${val} 条`);
      this.pagesize = val;
      this.pagenum = 1;
      this.getUserList();
    },
    handleCurrentChange(val) {
      // 当前页码改变时 触发
      // console.log(`当前页: ${val}`);
      this.pagenum = val;
      this.getUserList();
    },
    // 获取用户列表的请求
    async getUserList() {
      //query  查询参数 可以为空
      //pagenum 当前页码   不能为空
      //pagesize 每页显示条数  不能为空

      // 获取 token
      const AUTH_TOKEN = localStorage.getItem("token");

      //需要授权的API  必须在请求头中使用Authorization字段提供token令牌
      this.$http.defaults.headers.common["Authorization"] = AUTH_TOKEN;

      const res = await this.$http.get(
        `users?query=${this.query}&pagenum=${this.pagenum}&pagesize=${this.pagesize}`
      );
      console.log(res);

      // 对象解构赋值
      const {
        meta: { status, msg },
        data: { users, total },
      } = res.data;

      if (status == 200) {
        // 给表格提供数据源
        // this.userlist = res.data.data.users;  (详细写法)
        this.userlist = users;

        // 给 total 赋值
        this.total = total;

        // 提示成功消息
        // this.$message.success(msg);
      } else {
        // 提示错误消息
        // this.$message.error(msg);
        this.$message.warning(msg);
      }
    },
  },
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

.dataTable {
  width: 100%;
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
}
</style>