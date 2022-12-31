<template>
  <!-- 卡片小容器 -->
  <el-card class="box-card">
    <!-- 面包屑 -->
    <!-- <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb> -->

    <!-- 使用全局自定义组件：面包屑组件 -->
    <my-breadcrumb level1="用户管理" level2="用户列表"></my-breadcrumb>

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
            1、如果单元格内显示的内容不是字符串（文本），
              需要给被显示的内容外层包裹一个 template。
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
            @change="changeMgState(scope.row)"
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
            @click="showEditUserDia(scope.row)"
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
            @click="showSetUserRoleDia(scope.row)"
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
        <el-form-item label="用户名" required label-width="100px">
          <el-input v-model="form.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" required label-width="100px">
          <el-input v-model="form.password" show-password autocomplete="off"></el-input>
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

    <!-- 编辑用户的对话框 -->
    <el-dialog title="编辑用户" :visible.sync="dialogFormVisibleEdit">
      <el-form :model="form">
        <el-form-item label="用户名" required label-width="100px">
          <el-input
            disabled
            v-model="form.username"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="邮箱" label-width="100px">
          <el-input v-model="form.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="电话" label-width="100px">
          <el-input v-model="form.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleEdit = false">取 消</el-button>
        <el-button type="primary" @click="editUser()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="dialogFormVisibleRole">
      <el-form :model="form">
        <el-form-item label="用户名" label-width="100px">
          {{ currUserName }}
        </el-form-item>
        <el-form-item label="角色" label-width="100px">
          <!-- 下拉框的特性：
                如果 select 绑定的数据的值和 option 的 value 值一样，
                此时显示的是该 option 的 label 值。
             -->
          <el-select v-model="currRoleId" placeholder="请选择">
            <el-option label="请选择" :value="-1"></el-option>
            <el-option
              v-for="(item, i) in rolelist"
              :label="item.roleName"
              :value="item.id"
              :key="i"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleRole = false">取 消</el-button>
        <el-button type="primary" @click="setRole()">确 定</el-button>
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
      dialogFormVisibleEdit: false,
      dialogFormVisibleRole: false,
      // 添加用户的表单数据
      form: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      // 分配角色
      currRoleId: -1,
      currUserName: "",
      // 角色列表
      rolelist: [],
      currUserId: -1,
    };
  },
  created() {
    // 初始化用户列表信息
    this.getUserList();
  },
  methods: {
    // 分配用户角色
    async setRole() {
      // 修改用户角色（发送请求）
      const res = await this.$http.put(`users/${this.currUserId}/role`, {
        rid: this.currRoleId,
      });

      // console.log(res);

      // 对象解构赋值
      const {
        data,
        meta: { msg, status },
      } = res.data;

      if (status == 200) {
        // 提示更改角色成功
        this.$message.success(msg);
      } else {
        // 提示更改角色失败
        this.$message.error(msg);
      }

      // 关闭“分配角色”的对话框
      this.dialogFormVisibleRole = false;
    },
    // 打开“分配角色”的对话框
    async showSetUserRoleDia(user) {
      // 获取当前用户的用户名
      this.currUserName = user.username;
      this.currUserId = user.id;

      // 获取所有的角色
      const roleRes = await this.$http.get(`roles`);
      // console.log(roleRes);
      this.rolelist = roleRes.data.data;

      // 根据用户 id 获取用户信息
      const userRes = await this.$http.get(`users/${user.id}`);
      // console.log(userRes);
      // 获取当前用户的角色 id
      this.currRoleId = userRes.data.data.rid;

      // 打开“分配角色”的对话框
      this.dialogFormVisibleRole = true;
    },
    // 修改用户状态
    async changeMgState(user) {
      // 发送请求
      const res = await this.$http.put(
        `users/${user.id}/state/${user.mg_state}`
      );
      // 由于使用 v-model 双向绑定用户的 mg_state 值，因此不需要主动为 mg_state 赋值
      // console.log(res);

      const {
        data,
        meta: { msg, status },
      } = res.data;

      if (status == 200) {
        // 提示设置状态成功
        this.$message.success(msg);
      } else {
        // 提示设置状态失败
        this.$message.error(msg);
      }
    },
    // 编辑用户（发送请求）
    async editUser() {
      // const res = await this.$http.put(`users/${this.currUserId}`, this.form);
      const res = await this.$http.put(`users/${this.form.id}`, this.form);
      // console.log(res);

      if (res.data.meta.status == 200) {
        // 提示更新用户成功
        this.$message.success(res.data.meta.msg);

        // 更新用户列表信息（视图）
        this.getUserList();
      } else {
        // 提示更新用户失败
        this.$message.error(res.data.meta.msg);
      }

      // 关闭“编辑用户”对话框
      this.dialogFormVisibleEdit = false;
    },
    // 显示“编辑用户”对话框
    showEditUserDia(user) {
      // console.log(user);

      // 为表单的列绑定 user 对象的属性
      this.form = user;
      // this.currUserId = user.id;
      this.dialogFormVisibleEdit = true;
    },
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
          // console.log(res);

          if (res.data.meta.status == 200) {
            this.pagenum = 1;
            // 更新用户列表信息（视图）
            this.getUserList();
            // 提示删除用户成功
            this.$message({
              type: "success",
              message: res.data.meta.msg,
            });
          } else {
            // 提示删除用户失败
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
      // console.log(res);

      const {
        data,
        meta: { msg, status },
      } = res.data;

      if (status == 201) {
        // 提示创建用户成功
        this.$message.success(msg);
        // 更新用户列表信息（视图）
        this.getUserList();

        // 另一种写法：遍历清空对话框中的文本值（不推荐）
        /* for (const key in this.form) {
                if (this.form.hasOwnProperty(key)) {
                    this.form[key] = "";
                }
            } */
      } else {
        // 提示错误信息
        this.$message.warning(msg);
      }

      // 清空对话框中的文本值
      this.form = {};

      // 关闭“添加用户”对话框
      this.dialogFormVisibleAdd = false;
    },
    // 显示“添加用户”对话框
    showAddUserDia() {
      // 由于添加用户和编辑用户使用同一个数据源 form，因此在添加用户前，先清空数据
      this.form = {};

      // 显示“添加用户”对话框
      this.dialogFormVisibleAdd = true;
    },
    // 搜索框清空后重新加载全部用户信息
    loadUserList() {
      this.getUserList();
    },
    // 搜索用户
    searchUser() {
      // 每次查询之前，把页码设置为 1
      this.pagenum = 1;
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

      // // 获取 token
      // const AUTH_TOKEN = localStorage.getItem("token");

      // //需要授权的API  必须在请求头中使用Authorization字段提供token令牌
      // this.$http.defaults.headers.common["Authorization"] = AUTH_TOKEN;

      // 已在自定义插件模块 axios 中，为请求头设置 Authorization 字段提供 token 令牌
      const res = await this.$http.get(
        `users?query=${this.query}&pagenum=${this.pagenum}&pagesize=${this.pagesize}`
      );

      // console.log(res);

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