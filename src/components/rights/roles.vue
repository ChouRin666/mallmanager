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
          <el-row
            v-for="(itemLevel1, i) in scope.row.children"
            :key="i"
            class="showRoleRow"
          >
            <el-col :span="4">
              <!-- 展示一级权限 -->
              <el-tag closable @close="deleteRights(scope.row, itemLevel1.id)">
                {{ itemLevel1.authName }}
              </el-tag>
              <!-- Icon 图标：直接通过设置类名为 el-icon-iconName 来使用即可 -->
              <i class="el-icon-arrow-right"></i>
            </el-col>
            <el-col :span="20">
              <el-row v-for="(itemLevel2, i) in itemLevel1.children" :key="i">
                <el-col :span="4">
                  <!-- 展示二级权限 -->
                  <el-tag
                    closable
                    type="success"
                    @close="deleteRights(scope.row, itemLevel2.id)"
                  >
                    {{ itemLevel2.authName }}
                  </el-tag>
                  <!-- Icon 图标：直接通过设置类名为 el-icon-iconName 来使用即可 -->
                  <i class="el-icon-arrow-right"></i>
                </el-col>
                <el-col :span="20">
                  <!-- 展示三级权限 -->
                  <el-tag
                    @close="deleteRights(scope.row, itemLevel3.id)"
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

          <!-- 无权限的提示 -->
          <div v-if="scope.row.children.length == 0" class="noRoleDiv">
            未分配权限
          </div>
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
            @click="showSetRoleRightsDia(scope.row)"
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

    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="dialogFormVisibleRights">
      <!-- 
        Tree 树形结构控件： 
        1、分别通过 default-expanded-keys 和 default-checked-keys 
          设置默认展开和默认选中的节点。数据类型均为数组。
        2、必须设置 node-key，其值为节点数据中的一个字段名，该字段在整棵树中是唯一的。
          通常是数据源 data 中的 key 值（例如： id）
        3、props 是配置选项：
          label	指定节点标签为节点对象的某个属性值
          children	指定子树为节点对象的某个属性值
          disabled	指定节点选择框是否禁用为节点对象的某个属性值
          isLeaf	指定节点是否为叶子节点，仅在指定了 lazy 属性的情况下生效
        4、show-checkbox	节点是否可被选择（是否显示 CheckBox）
      -->
      <!-- 
        逐个获取所有权限的 id 值需要三层循环遍历数组，比较麻烦
        :default-expanded-keys="expandedKeyArr"  
        可使用 default-expand-all 属性完成展开所有树形节点的功能
      -->
      <el-tree
        ref="rightsTree"
        :data="rightsTreeList"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="checkedKeysArr"
        :props="defaultProps"
      >
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleRights = false">取 消</el-button>
        <el-button type="primary" @click="setRoleRights()">确 定</el-button>
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
      rolesList: [], // 所有角色的列表信息
      // 添加角色的表单数据
      roleForm: {
        roleName: "",
        roleDesc: "",
      },
      // 添加对话框的属性
      dialogFormVisibleAdd: false,
      dialogFormVisibleEdit: false,
      dialogFormVisibleRights: false,
      rightsTreeList: [], // 树形结构的所有权限数据
      // 树形结构的配置
      defaultProps: {
        children: "children", // 包含下级子节点的属性名（通常为包含子节点的容器数组名）
        label: "authName", // 显示当前节点文本值的属性名
      },
      // 默认展开的所有节点
      // expandedKeyArr: [],
      // 默认选中的节点
      checkedKeysArr: [],
      currRoleId: -1,
    };
  },
  methods: {
    async setRoleRights() {
      /* 
        在 Vue 中获取 el-tree 组件的 DOM 元素的步骤：
        1、在 el-tree 组件中设置 ref 属性值（例如：ref="rightsTree"）
        2、通过 this.$refs.ref属性值.js方法名() 调用，
         例如：
          this.$refs.rightsTree.getCheckedKeys(); 
          this.$refs.rightsTree.getHalfCheckedKeys();
      */
      
      // element-ui 提供的 el-tree 组件获取全选 key 的数组方法 
      // getCheckedKeys() ：获取目前被全选中的节点的 key 所组成的数组
      let checkedKeysArr = this.$refs.rightsTree.getCheckedKeys();
      // console.log(checkedKeysArr);
      
      // element-ui 提供的 el-tree 组件获取半选 key 的数组方法 
      // getHalfCheckedKeys() ：获取目前被半选中的节点的 key 所组成的数组 
      let halfCheckedKeysArr = this.$refs.rightsTree.getHalfCheckedKeys();
      // console.log(halfCheckedKeysArr);

      // 拼接数组，方式 1：使用 concat 方法
      // let finalKeysArr = checkedKeysArr.concat(halfCheckedKeysArr);

      // 拼接数组，方式 2：使用 ES6 提供的展开运算符
      // 可存放 ...数组或者对象
      let finalKeysArr = [...checkedKeysArr, ...halfCheckedKeysArr];
      // console.log(finalKeysArr);

      // rids：权限 ID 列表（字符串）
      // 以 `,` 分割的权限 ID 列表（获取所有被选中、叶子节点的key和
      // 半选中节点的key,包括 1，2，3级节点）
      const res = await this.$http.post(`roles/${this.currRoleId}/rights`, {
        rids: finalKeysArr.join(","),
      });

      // console.log(res);

      if (res.data.meta.status == 200) {
        // 提示更新权限成功
        this.$message.success(res.data.meta.msg);

        // 更新角色列表信息（视图） 
        this.getRolesList();
      } else {
        // 提示更新权限失败
        this.$message.error(res.data.meta.msg);
      }

      // 关闭“分配权限”对话框
      this.dialogFormVisibleRights = false;
    },
    // 显示“分配权限”对话框
    async showSetRoleRightsDia(role) {
      this.currRoleId = role.id;
      // 获取树形结构的所有权限数据
      // type 值为 list 或 tree , list 列表显示权限, tree 树状显示权限
      const res = await this.$http.get(`rights/tree`);
      // console.log(res);

      // 对象解构赋值
      const {
        data,
        meta: { msg, status },
      } = res.data;

      if (status == 200) {
        // 提示获取权限列表成功
        // this.$message.success(msg);

        // 树形结构的所有权限数据
        this.rightsTreeList = data;

        // 把一级、二级、三级权限的所有 id 都存储到临时数组 tempExpandedArr 中
        /* var tempExpandedArr = [];
        this.rightsTreeList.forEach((itemLevel1) => {
          // 把一级权限的 id 添加到数组中
          tempExpandedArr.push(itemLevel1.id);

          itemLevel1.children.forEach((itemLevel2) => {
            // 把二级权限的 id 添加到数组中
            tempExpandedArr.push(itemLevel2.id);

            itemLevel2.children.forEach((itemLevel3) => {
              // 把三级权限的 id 添加到数组中
              tempExpandedArr.push(itemLevel3.id);
            });
          });
        });

        // 为 :default-expanded-keys 属性赋值，值为 expandedKeyArr 数组
        this.expandedKeyArr = tempExpandedArr; */

        /* 
          把当前角色 role 分配的权限 id 都存储到临时数组 tempCheckedArr 中。
          由于树形结构组件的特性，子节点被全部选中或部分选中，
          上级父节点会自动出现相应的全选或半选状态，因此不宜把一级和二级权限的 id 
          存储到临时数组 tempCheckedArr 中，否则会出现以下 bug：
          三级子节点部分选中，但上面的一级和二级父节点的状态仍然是全选状态！
        */
        // console.log(role);
        var tempCheckedArr = [];
        role.children.forEach((itemLevel1) => {
          // 把一级权限的 id 添加到数组中
          // tempCheckedArr.push(itemLevel1.id);

          itemLevel1.children.forEach((itemLevel2) => {
            // 把二级权限的 id 添加到数组中
            // tempCheckedArr.push(itemLevel2.id);

            itemLevel2.children.forEach((itemLevel3) => {
              // 把三级权限的 id 添加到数组中
              tempCheckedArr.push(itemLevel3.id);
            });
          });
        });

        // 为 :default-checked-keys 属性赋值，值为 checkedKeysArr 数组
        this.checkedKeysArr = tempCheckedArr;
      } else {
        // 提示获取权限列表失败
        this.$message.error(msg);
      }

      // 显示“分配权限”对话框
      this.dialogFormVisibleRights = true;
    },
    // 删除角色指定权限
    async deleteRights(role, rightId) {
      // role：当前角色对象，roleId：角色id，rightId：权限id
      const res = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
      // console.log(res);

      // 对象解构赋值
      const {
        data, // 返回的 data, 是当前角色下最新的权限数据
        meta: { msg, status },
      } = res.data;

      if (status == 200) {
        // 提示取消权限成功
        this.$message.success(msg);

        // 更新角色和权限列表信息（视图），会刷新整个视图，用户体验感不好
        // this.getRolesList();

        // 局部刷新（取消哪个角色就更新哪个角色的权限列表）
        role.children = data;
      } else {
        // 提示取消权限失败
        this.$message.error(msg);
      }
    },
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
      // console.log(res);

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

.showRoleRow {
  margin-left: 20px;
}

.noRoleDiv {
  margin-left: 40px;
  padding: 10px 0;
}

.roleTag {
  margin: 5px;
}
</style>