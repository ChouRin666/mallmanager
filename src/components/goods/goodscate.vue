<template>
  <!-- 卡片小容器 -->
  <el-card class="box-card">
    <!-- 使用全局自定义组件：面包屑组件 -->
    <my-breadcrumb level1="商品管理" level2="商品分类"></my-breadcrumb>

    <!-- 添加分类按钮 -->
    <el-button
      type="success"
      class="addCateBtn"
      plain
      @click="showAddGoodsCategoryDia()"
      >添加分类</el-button
    >

    <!-- 表格 -->
    <el-table :data="goodsCategoryList" class="dataTable">
      <!-- 
        树形结构控件 el-table-tree-column 
        treeKey   树形结构控件里的唯一标识
        parentKey 父节点的标识
        levelKey  当前层级的标识
        childKey  子节点的标识
        indentSize  每一层级展开的间隔宽度
      -->

      <!-- 把树形控件命名为 ElTreeGrid 的写法 -->
      <el-tree-grid
        label="分类名称"
        prop="cat_name"
        treeKey="cat_id"
        parentKey="cat_pid"
        levelKey="cat_level"
        childKey="children"
        :indentSize="24"
        width="220px"
      >
      </el-tree-grid>

      <el-table-column label="级别" width="300px">
        <template slot-scope="scope">
          <span v-if="scope.row.cat_level == 0">一级</span>
          <span v-else-if="scope.row.cat_level == 1">二级</span>
          <span v-else-if="scope.row.cat_level == 2">三级</span>
        </template>
      </el-table-column>
      <el-table-column label="是否有效" width="300px">
        <template slot-scope="scope">
          <span v-if="scope.row.cat_deleted == false">有效</span>
          <span v-else-if="scope.row.cat_deleted == true">无效</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            @click="showEditGoodsCategoryDia(scope.row)"
            size="medium"
            :plain="true"
            type="primary"
            icon="el-icon-edit"
            circle
          >
          </el-button>
          <el-button
            @click="showDeleGoodsCategoryMsgBox(scope.row)"
            size="medium"
            :plain="true"
            type="danger"
            icon="el-icon-delete"
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
      :page-sizes="[5, 10, 15, 20, 25]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>

    <!-- 对话框 -->
    <!-- 添加商品分类的对话框 -->
    <el-dialog title="添加商品分类" :visible.sync="dialogFormVisibleAdd">
      <el-form :model="cateForm" label-position="top">
        <el-form-item label="分类名称" required label-width="100px">
          <el-input v-model="cateForm.cat_name" autocomplete="off"></el-input>
        </el-form-item>
        {{ selectedOptions }}
        <el-form-item label="分类" label-width="100px">
          <!-- 
                级联选择器 el-cascader：
                options：数据源（一般为数组），键名可通过 Props 属性配置
                v-model：选中项绑定值，数组类型的数据
                props：配置选项（一般为对象，包含 label: "", value: "", children: ""）
                expand-trigger="hover" 属性被弃用，在 props 中配置 expandTrigger="hover"
                checkStrictly：是否严格的遵守父子节点不互相关联
            -->
          <el-cascader
            v-model="selectedOptions"
            :options="categoryList"
            :props="defaultProps"
            :show-all-levels="false"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleAdd = false">取 消</el-button>
        <el-button type="primary" @click="addGoodsCategories()"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
/* 

自定义插件名不能随便写，否则会报错，提示以下报错信息：
Unknown custom element: <el-tree-grid> - did you register the component correctly? 
For recursive components, make sure to provide the "name" option.

如果命名为：ElTreeGrid， 
那么对应 Vue 页面需要写 <el-tree-grid></el-tree-grid> 标签

如果命名为：ElTableTreeColumn， 
那么对应 Vue 页面需要写 <el-table-tree-column></el-table-tree-column> 标签 

*/

// 引入树形插件

// 引入插件的方式有 2 种：  1、使用 require   2、使用 import
// var ElTreeGrid = require("element-tree-grid");
import ElTreeGrid from "element-tree-grid";

export default {
  components: {
    ElTreeGrid, // 局部挂载 第三方插件 树形结构 element-tree-grid 的组件
  },
  created() {
    this.loadGoodsCategories();
  },
  data() {
    return {
      goodsCategoryList: [],
      // 分页参数
      pagenum: 1, // 当前页码
      pagesize: 10, // 每页显示条数
      total: -1, // 总记录数
      // 级联选择器的属性
      selectedOptions: [],
      categoryList: [],
      defaultProps: {
        expandTrigger: "hover",
        checkStrictly: true,
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      // 对话框的属性
      dialogFormVisibleAdd: false,
      cateForm: {
        cat_name: "",
        cat_pid: -1,
        cat_level: -1,
      },
    };
  },
  methods: {
    // 添加 商品分类（发送请求）
    async addGoodsCategories() {
      // 验证 提交的表单数据
      if (this.validateSubmitForm()) {
        // 添加 商品分类（发送请求）
        const res = await this.$http.post(`categories`, this.cateForm);
        console.log(res);

        const {
          data,
          meta: { msg, status },
        } = res.data;

        if (status == 201) {
          this.$message.success(msg);

          // 刷新视图
          this.loadGoodsCategories();
        } else {
          this.$message.error(msg);
        }
        // 显示 添加商品分类 对话框
        this.dialogFormVisibleAdd = false;
      }
    },
    // 验证 提交的表单数据
    validateSubmitForm() {
      let inputCateName = "";
      if (this.cateForm.cat_name) {
        inputCateName = this.cateForm.cat_name.trim();
      }
      if (inputCateName == "") {
        this.$message.error("请输入分类名称！");
        return false;
      }

      // 如果未选择 级联选择器，那么添加的是 一级分类
      if (this.selectedOptions.length == 0) {
        this.cateForm = {
          cat_name: inputCateName,
          cat_pid: 0, // 如果要添加1级分类，则父分类Id应该设置为 "0"
          cat_level: 0, // "0" 表示一级分类；"1" 表示二级分类；"2" 表示三级分类
        };
      } else if (this.selectedOptions.length == 1) {
        // 如果在 级联选择器 中选择了一级分类，那么会添加 二级分类
        this.cateForm = {
          cat_name: inputCateName,
          cat_pid: this.selectedOptions[0], // 如果要添加1级分类，则父分类Id应该设置为 "0"
          cat_level: 1, // "0" 表示一级分类；"1" 表示二级分类；"2" 表示三级分类
        };
      } else if (this.selectedOptions.length == 2) {
        // 如果在 级联选择器 中选择了二级分类，那么会添加 三级分类
        this.cateForm = {
          cat_name: inputCateName,
          cat_pid: this.selectedOptions[1], // 如果要添加1级分类，则父分类Id应该设置为 "0"
          cat_level: 2, // "0" 表示一级分类；"1" 表示二级分类；"2" 表示三级分类
        };
      }

      return true;
    },
    // 显示 添加商品分类 对话框
    showAddGoodsCategoryDia() {
      // 初始化 级联选择器
      this.getGoodsCategories();

      // 清空 请求体表单数据
      this.cateForm = {};

      // 为 级联选择器 解绑选中的数据
      this.selectedOptions = [];

      // 显示 添加商品分类 对话框
      this.dialogFormVisibleAdd = true;
    },
    // 给 级联选择器 设置数据源
    async getGoodsCategories() {
      // type：1，2，3   分别表示显示一层、二层、三层分类列表
      // 如果不传递，则默认获取所有级别的分类
      const res = await this.$http.get(`categories?type=2`);
      // console.log(res);

      const {
        data,
        meta: { msg, status },
      } = res.data;

      if (status == 200) {
        // this.$message.success(msg);
        // 获取商品分类数据列表
        this.categoryList = data;
      } else {
        this.$message.error(msg);
      }
    },
    // 分页
    handleSizeChange(val) {
      // 每页显示条数变化时 触发
      // console.log(`每页 ${val} 条`);
      this.pagesize = val;
      this.pagenum = 1;
      this.loadGoodsCategories();
    },
    handleCurrentChange(val) {
      // 当前页码改变时 触发
      // console.log(`当前页: ${val}`);
      this.pagenum = val;
      this.loadGoodsCategories();
    },
    // 加载 商品分类列表（发送请求）
    async loadGoodsCategories() {
      const res = await this.$http.get(
        `categories?type=3&pagenum=${this.pagenum}&pagesize=${this.pagesize}`
      );
      console.log(res);

      const {
        data: { total, result },
        meta: { msg, status },
      } = res.data;

      if (status == 200) {
        // this.$message.success(msg);

        // 获取商品分类数据列表
        this.goodsCategoryList = result;
        this.total = total;
      } else {
        this.$message.error(msg);
      }
    },
  },
};
</script>

<style>
.addCateBtn {
  margin-top: 20px;
}

.dataTable {
  width: 100%;
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
}
</style>