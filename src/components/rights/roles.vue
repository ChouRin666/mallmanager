<template>
  <!-- 卡片小容器 -->
  <el-card class="box-card">
    <!-- 使用全局自定义组件：面包屑组件 -->
    <my-breadcrumb level1="权限管理" level2="角色列表"></my-breadcrumb>

    <!-- 添加角色按钮 -->
    <el-row class="addRoleRow">
      <el-col>
        <el-button type="primary" @click="showAddRoleDia()">添加角色</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table :data="rolesList" height="800px" class="dataTable">
      <el-table-column type="expand" width="100px">
        <!-- 
          页面布局如果是行列问题，考虑使用 for 循环嵌套输出 el-tag 。
          el-tag 的 type 属性控制标签颜色：
          type: ''  蓝色
          type: 'success'  绿色
          type: 'info'  灰色
          type: 'warning'  黄色
          type: 'danger'  红色
        -->
        <template slot-scope="scope">
          <el-row v-for="(itemLevel1, i) in scope.row.children" :key="i">
            <el-col :span="4">
              <!-- 展示一级权限 -->
              <el-tag closable>
                {{ itemLevel1.authName }}
              </el-tag>
              <!-- Icon 图标：直接通过设置类名为 el-icon-iconName 来使用即可 -->
              <i class="el-icon-arrow-right"></i>
            </el-col>
            <el-col :span="20">
              <el-row v-for="(itemLevel2, i) in itemLevel1.children" :key="i">
                <el-col :span="4">
                  <!-- 展示二级权限 -->
                  <el-tag closable type="success">
                    {{ itemLevel2.authName }}
                  </el-tag>
                  <!-- Icon 图标：直接通过设置类名为 el-icon-iconName 来使用即可 -->
                  <i class="el-icon-arrow-right"></i>
                </el-col>
                <el-col :span="20">
                  <!-- 展示三级权限 -->
                  <el-tag
                    v-for="(itemLevel3, i) in itemLevel2.children"
                    :key="i"
                    closable
                    type="warning"
                    class="roleTag"
                  >
                    {{ itemLevel3.authName }}
                  </el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <!-- type="index"  设置该列的每个单元格的内容是从 1 开始的序号 -->
      <el-table-column type="index" label="#" width="100px"> </el-table-column>
      <el-table-column prop="roleName" label="角色名称" width="200px">
      </el-table-column>
      <el-table-column prop="roleDesc" label="角色描述" width="360px">
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            @click="showEditRoleDia(scope.row)"
            size="medium"
            :plain="true"
            type="primary"
            icon="el-icon-edit"
            circle
          >
          </el-button>
          <el-button
            @click="showDeleRoleMsgBox(scope.row.id)"
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

    <!-- 对话框 -->
    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="dialogFormVisibleAdd">
      <el-form :model="roleForm">
        <el-form-item label="角色名称" required label-width="100px">
          <el-input v-model="roleForm.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" label-width="100px">
          <el-input v-model="roleForm.roleDesc" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleAdd = false">取 消</el-button>
        <el-button type="primary" @click="addRole()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑角色的对话框 -->
    <el-dialog title="编辑角色" :visible.sync="dialogFormVisibleEdit">
      <el-form :model="roleForm">
        <el-form-item label="角色名称" required label-width="100px">
          <el-input v-model="roleForm.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" label-width="100px">
          <el-input v-model="roleForm.roleDesc" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleEdit = false">取 消</el-button>
        <el-button type="primary" @click="editRole()">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  created() {
    this.getRolesList();
  },
  data() {
    return {
      rolesList: [],
      // 添加角色的表单数据
      roleForm: {
        roleName: "",
        roleDesc: "",
      },
      // 添加对话框的属性
      dialogFormVisibleAdd: false,
      dialogFormVisibleEdit: false,
    };
  },
  methods: {
    // 编辑角色（发送请求）
    async editRole() {
      const res = await this.$http.put(
        `roles/${this.roleForm.id}`,
        this.roleForm
      );
      // console.log(res);

      if (res.data.meta.status == 200) {
        // 提示更新角色成功
        this.$message.success(res.data.meta.msg);

        // 更新角色列表信息（视图）
        this.getRolesList();
      } else {
        // 提示更新角色失败
        this.$message.error(res.data.meta.msg);
      }

      // 关闭“编辑角色”对话框
      this.dialogFormVisibleEdit = false;
    },
    // 显示“编辑角色”对话框
    showEditRoleDia(role) {
      // console.log(role);

      // 为表单的列绑定 role 对象的属性
      this.roleForm = role;

      // 显示“编辑角色”对话框
      this.dialogFormVisibleEdit = true;
    },
    // 显示“删除角色”消息盒子
    showDeleRoleMsgBox(roleId) {
      this.$confirm("此操作将永久删除该角色, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          // 发送删除角色的请求
          const res = await this.$http.delete(`roles/${roleId}`);
          // console.log(res);

          if (res.data.meta.status == 200) {
            // 更新角色列表信息（视图）
            this.getRolesList();
            // 提示删除角色成功
            this.$message({
              type: "success",
              message: res.data.meta.msg,
            });
          } else {
            // 提示删除角色失败
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
    // 添加角色（发送请求）
    async addRole() {
      // 已在自定义插件模块 axios 中，为请求头设置 Authorization 字段提供 token 令牌
      const res = await this.$http.post(`roles`, this.roleForm);
      // console.log(res);

      // 对象解构赋值
      const {
        data,
        meta: { msg, status },
      } = res.data;

      if (status == 201) {
        // 提示创建角色成功
        this.$message.success(msg);

        // 更新角色列表信息（视图）
        this.getRolesList();
      } else {
        // 提示创建角色失败
        this.$message.error(msg);
      }

      // 清空对话框中的文本值
      this.roleForm = {};

      // 关闭“添加角色”对话框
      this.dialogFormVisibleAdd = false;
    },
    showAddRoleDia() {
      // 由于添加角色和编辑角色使用同一个数据源 roleForm，因此在添加角色前，先清空数据
      this.roleForm = {};

      // 显示“添加角色”对话框
      this.dialogFormVisibleAdd = true;
    },
    async getRolesList() {
      // 已在自定义插件模块 axios 中，为请求头设置 Authorization 字段提供 token 令牌
      const res = await this.$http.get(`roles`);
      console.log(res);

      // 对象解构赋值
      const {
        data,
        meta: { msg, status },
      } = res.data;

      if (status == 200) {
        this.rolesList = data;
        // 提示获取角色列表成功
        // this.$message.success(msg);
      } else {
        // 提示获取角色列表失败
        this.$message.error(msg);
      }
    },
  },
};
</script>

<style>
.addRoleRow {
  margin-top: 20px;
}

.dataTable {
  margin-top: 20px;
}

.roleTag {
  margin: 5px;
}
</style>