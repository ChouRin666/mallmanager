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

    <!-- 编辑商品分类的对话框 -->
    <el-dialog title="编辑商品分类" :visible.sync="dialogFormVisibleEdit">
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
            @change="changeCategory()"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleEdit = false">取 消</el-button>
        <el-button type="primary" @click="editGoodsCategories()"
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
      dialogFormVisibleEdit: false,
      // 提交表单数据
      cateForm: {
        cat_name: "",
        cat_pid: -1,
        cat_level: -1,
      },
      // 编辑 商品分类的数据
      //   fetchedCateId: -1, // 编辑前的 一级分类 CateId
      currCateId: -1, // 编辑时的 一级分类 CateId
    };
  },
  methods: {
    // 删除 商品分类（发送请求）
    showDeleGoodsCategoryMsgBox(goodsCategory) {},

    // 编辑 商品分类（发送请求）
    async editGoodsCategories() {
      // 验证 提交的表单数据
      if (this.validateSubmitForm("edit")) {
        // 编辑 商品分类（发送请求）
        const res = await this.$http.put(
          `categories/${this.currCateId}`,
          this.cateForm
        );
        // console.log(res);

        const {
          data,
          meta: { msg, status },
        } = res.data;

        if (status == 200) {
          this.$message.success(msg);

          // 刷新视图
          this.loadGoodsCategories();
        } else {
          this.$message.error(msg);
        }

        // 隐藏 编辑商品分类 对话框
        this.dialogFormVisibleEdit = false;
      }
    },
    // 显示 编辑商品分类 对话框
    showEditGoodsCategoryDia(goodsCategory) {
      // 初始化 级联选择器（显示三级分类）
      this.getFullGoodsCategories();

      this.currCateId = goodsCategory.cat_id;
      this.cateForm.cat_name = goodsCategory.cat_name;

      // 为表单绑定数据
      if (goodsCategory.cat_level == 0) {
        // 如果编辑的是 一级分类，此时传入的对象 goodsCategory 是 一级分类对象

        // 举例： this.selectedOptions = [1];
        this.selectedOptions = [goodsCategory.cat_id];
      } else if (goodsCategory.cat_level == 1) {
        // 如果编辑的是 二级分类，此时传入的对象 goodsCategory 是 二级分类对象

        // 举例： this.selectedOptions = [1, 3];
        this.selectedOptions = [goodsCategory.cat_pid, goodsCategory.cat_id];
      } else if (goodsCategory.cat_level == 2) {
        /* 
          this.categoryList 是级联选择器的数据源，
          不宜采用 级联选择器的数据源，原因有 2 个：

          1、
          因为在 初次打开 编辑商品分类 对话框时，
          调用 this.getFullGoodsCategories() 方法 初始化级联选择器（显示三级分类），
          耗时 500 - 900 ms 不等，在返回结果之前，this.categoryList 是空数组。
          而此时采用循环遍历 this.categoryList ，是无法完成 级联选择器 的绑值操作的。
          也就是 绑值操作 执行时间早于 返回 this.categoryList 数组的值，故会存在 bug。

          2、
          this.categoryList 会获取全部 三级分类，数据量较大，循环遍历耗时较长。


          this.goodsCategoryList 是当前视图的数据源（支持分页），
          适合采用 当前视图的数据源，原因有 2 个：

          1、
          因为页面加载完毕，this.goodsCategoryList 一定是有数据的。

          2、
          this.goodsCategoryList 获取的是分页数据源，数据量不太大，循环遍历耗时较短。

          this.getCateIdBySource(loopType, currSource, cateIdLevel2, cateIdLevel3) 方法，
          写了 3 个不同的迭代器进行 双层数组循环，找到符合条件的数据就退出循环，它们的执行效率高低顺序如下：
          for > some > forEach
        */

        /* 
          根据 当前 二级分类 cat_id 找到对应的 一级分类的 cat_id，有 2 种方式：
          
          1、
            以 this.goodsCategoryList 作为数组进行遍历查找 cat_pid。

          2、
            调用服务器接口 this.$http.get(`categories/${goodsCategory.cat_pid}`);
            返回的对象中包含 cat_pid。不推荐，应尽量避免和服务器交互，非常损耗性能，
            在选择三级分类的前提下，每打开一次 编辑商品分类 对话框，就会从服务器取一次数据！
        */

        // 方法 1：
        // this.goodsCategoryList 是当前视图的数据源（支持分页）
        this.getCateIdBySource(
          "for",
          this.goodsCategoryList,
          goodsCategory.cat_pid,
          goodsCategory.cat_id
        );

        /* ------------------------------------------------------------------------------ */

        /* 
        // 方法 2：
        // 如果编辑的是 三级分类，此时传入的对象 goodsCategory 是 三级分类对象

        // 根据 cateId 获取当前二级分类对象
        const res = await this.$http.get(`categories/${goodsCategory.cat_pid}`);
        // console.log(res);

        const {
          data,
          meta: { msg, status },
        } = res.data;

        if (status == 200) {
          if (data.cat_level == 1) {
            // 举例： this.selectedOptions = [1, 3, 6];
            this.selectedOptions = [
              data.cat_pid, // 获取 二级分类的 cat_pid（等同于 一级分类的 cat_id）
              goodsCategory.cat_pid,
              goodsCategory.cat_id,
            ];
          }
        } else {
          // 未获取到 二级分类对象
          // 级联选择器不绑定任何数据（属于bug）
          this.selectedOptions = [];
        } */
      }

      // 显示 编辑商品分类 对话框
      this.dialogFormVisibleEdit = true;
    },
    getCateIdBySource(loopType, currSource, cateIdLevel2, cateIdLevel3) {
      // 寻找 当前 二级分类 cat_id 对应的 一级分类的 cat_id
      if (loopType == "for") {
        // currSource 不为空数组
        if (currSource.length > 0) {
          for (let i = 0, len1 = currSource.length; i < len1; i++) {
            const item1 = currSource[i];

            // 判断是否存在二级分类，不存在会报 undefined 的错误
            // Error in v-on handler: "TypeError: Cannot read property 'length' of undefined"
            if (item1.children) {
              for (let j = 0, len2 = item1.children.length; j < len2; j++) {
                const item2 = item1.children[j];
                // 在 二级分类 中寻找 cat_id 为 cateIdLevel2 的 cat_pid

                if (item2.cat_id == cateIdLevel2) {
                  // 举例： this.selectedOptions = [1, 3, 6];
                  this.selectedOptions = [
                    item2.cat_pid, // 获取 二级分类的 cat_pid（等同于 一级分类的 cat_id）
                    cateIdLevel2,
                    cateIdLevel3,
                  ];

                  /* 
                    符合条件会结束所有循环，
                    包括内层循环 for (let j = 0, len2 = item1.children.length; j < len2; j++)
                    和外层循环 for (let i = 0, len1 = currSource.length; i < len1; i++) 
                  */
                  return;
                }
              }
            }
          }
        }
      } else if (loopType == "some") {
        // currSource 不为空数组
        if (currSource.length > 0) {
          currSource.some((item1) => {
            // 判断是否存在二级分类，不存在会报 undefined 的错误
            // Error in v-on handler: "TypeError: Cannot read property 'some' of undefined"
            if (item1.children) {
              item1.children.some((item2) => {
                // 在 二级分类 中寻找 cat_id 为 cateIdLevel2 的 cat_pid

                if (item2.cat_id == cateIdLevel2) {
                  // 举例： this.selectedOptions = [1, 3, 6];
                  this.selectedOptions = [
                    item2.cat_pid, // 获取 二级分类的 cat_pid（等同于 一级分类的 cat_id）
                    cateIdLevel2,
                    cateIdLevel3,
                  ];

                  // 符合条件会结束当前整个 item1.children.some 循环，
                  // 但会继续外层循环 currSource.some 直至结束
                  return true;
                }
              });
            }
          });
        }
      } else if (loopType == "forEach") {
        // currSource 不为空数组
        if (currSource.length > 0) {
          currSource.forEach((item1) => {
            // 判断是否存在二级分类，不存在会报 undefined 的错误
            // Error in v-on handler: "TypeError: Cannot read property 'forEach' of undefined"
            if (item1.children) {
              item1.children.forEach((item2) => {
                // 在 二级分类 中寻找 cat_id 为 cateIdLevel2 的 cat_pid

                if (item2.cat_id == cateIdLevel2) {
                  // 举例： this.selectedOptions = [1, 3, 6];
                  this.selectedOptions = [
                    item2.cat_pid, // 获取 二级分类的 cat_pid（等同于 一级分类的 cat_id）
                    cateIdLevel2,
                    cateIdLevel3,
                  ];

                  /* 
                    符合条件会结束 item1.children.forEach 循环中的当前 item 的循环，
                    但仍会继续 item1.children.forEach 循环中的下个 item 循环，
                    直至整个外层循环 currSource.forEach 结束 
                  */
                  return;
                }
              });
            }
          });
        }
      }
    },
    // 添加 商品分类（发送请求）
    async addGoodsCategories() {
      // 验证 提交的表单数据
      if (this.validateSubmitForm("add")) {
        // 添加 商品分类（发送请求）
        const res = await this.$http.post(`categories`, this.cateForm);
        // console.log(res);

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
    // 显示 添加商品分类 对话框
    showAddGoodsCategoryDia() {
      // 初始化 级联选择器（显示二级分类）
      this.getGoodsCategories();

      // 清空 请求体表单数据
      this.cateForm = {};

      // 为 级联选择器 解绑选中的数据
      this.selectedOptions = [];

      // 显示 添加商品分类 对话框
      this.dialogFormVisibleAdd = true;
    },
    // 验证 提交的表单数据
    validateSubmitForm(actionType) {
      let inputCateName = "";
      if (this.cateForm.cat_name) {
        inputCateName = this.cateForm.cat_name.trim();
      }
      if (inputCateName == "") {
        this.$message.error("请输入分类名称！");
        return false;
      }

      if (actionType == "add") {
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
      } else if (actionType == "edit") {
        // 编辑状态下，级联选择器不会出现未被选中的情况，至少会被选中一级分类
        if (this.selectedOptions.length == 1) {
          // 如果在 级联选择器 中选择了一级分类，那么会修改 一级分类
          this.currCateId = this.selectedOptions[0];
          this.cateForm = {
            cat_name: inputCateName,
            // cat_pid: 0, // 如果要修改1级分类，则父分类Id应该设置为 "0"
            // cat_level: 0, // "0" 表示一级分类；"1" 表示二级分类；"2" 表示三级分类
          };
        } else if (this.selectedOptions.length == 2) {
          // 如果在 级联选择器 中选择了二级分类，那么会修改 二级分类
          this.currCateId = this.selectedOptions[1];
          this.cateForm = {
            cat_name: inputCateName,
            // cat_pid: this.selectedOptions[0], // 如果要修改2级分类，则父分类Id应该为其上一级cateId
            // cat_level: 1, // "0" 表示一级分类；"1" 表示二级分类；"2" 表示三级分类
          };
        } else if (this.selectedOptions.length == 3) {
          // 如果在 级联选择器 中选择了二级分类，那么会修改 二级分类
          this.currCateId = this.selectedOptions[2];
          this.cateForm = {
            cat_name: inputCateName,
            // cat_pid: this.selectedOptions[0], // 如果要修改2级分类，则父分类Id应该为其上一级cateId
            // cat_level: 1, // "0" 表示一级分类；"1" 表示二级分类；"2" 表示三级分类
          };
        }
      }

      return true;
    },
    // 编辑 商品分类时 触发 @change 事件，主要功能是为 分类名称 文本框设置数据
    changeCategory() {
      let tempCateIdLevel1 = -1;
      let tempCateIdLevel2 = -1;
      let tempCateIdLevel3 = -1;
      let tempCateName = "";
      // 分类名称 文本框中的数据 随着触发 @change 事件而改变
      if (this.selectedOptions.length == 1) {
        // 如果在 级联选择器 中选择了 一级分类
        tempCateIdLevel1 = this.selectedOptions[0];

        // 从 级联选择器 的数据源中遍历寻找 当前 一级分类 下被选中的 cat_id 对应的 cat_name
        // 如果是查找到数据就结束循环，推荐使用 for 循环，forEach 循环无法真正结束循环
        /* this.categoryList.forEach((item) => {
          if (item.cat_id == tempCateIdLevel1) {
            tempCateName = item.cat_name;
            this.cateForm.cat_name = tempCateName;
            return;
          }
        }); */

        for (let i = 0, len = this.categoryList.length; i < len; i++) {
          const item = this.categoryList[i];
          if (item.cat_id == tempCateIdLevel1) {
            tempCateName = item.cat_name;
            this.cateForm.cat_name = tempCateName;
            // 结束循环
            return;
          }
        }
      } else if (this.selectedOptions.length == 2) {
        // 如果在 级联选择器 中选择了 二级分类
        tempCateIdLevel1 = this.selectedOptions[0];
        tempCateIdLevel2 = this.selectedOptions[1];

        // 从 级联选择器 的数据源中遍历寻找 当前 二级分类 下被选中的 cat_id 对应的 cat_name
        /* this.categoryList.forEach((item1) => {
          if (item1.cat_id == tempCateIdLevel1) {
            item1.children.forEach((item2) => {
              if (item2.cat_id == tempCateIdLevel2) {
                tempCateName = item2.cat_name;
                this.cateForm.cat_name = tempCateName;
                return;
              }
            });
          }
        }); */

        for (let i = 0, len1 = this.categoryList.length; i < len1; i++) {
          const item1 = this.categoryList[i];
          if (item1.cat_id == tempCateIdLevel1) {
            // 判断是否存在二级分类，不存在会报 undefined 的错误
            // 此处不会报错，因为条件已经判断 this.selectedOptions.length == 2
            if (item1.children) {
              for (let j = 0, len2 = item1.children.length; j < len2; j++) {
                const item2 = item1.children[j];
                if (item2.cat_id == tempCateIdLevel2) {
                  tempCateName = item2.cat_name;
                  this.cateForm.cat_name = tempCateName;
                  // 结束所有循环
                  return;
                }
              }
            }
          }
        }
      } else if (this.selectedOptions.length == 3) {
        // 如果在 级联选择器 中选择了 二级分类
        tempCateIdLevel1 = this.selectedOptions[0];
        tempCateIdLevel2 = this.selectedOptions[1];
        tempCateIdLevel3 = this.selectedOptions[2];

        // 从 级联选择器 的数据源中遍历寻找 当前 三级分类 下被选中的 cat_id 对应的 cat_name
        /* this.categoryList.forEach((item1) => {
          if (item1.cat_id == tempCateIdLevel1) {
            item1.children.forEach((item2) => {
              if (item2.cat_id == tempCateIdLevel2) {
                item2.children.forEach((item3) => {
                  if (item3.cat_id == tempCateIdLevel3) {
                    tempCateName = item3.cat_name;
                    this.cateForm.cat_name = tempCateName;
                    return;
                  }
                });
              }
            });
          }
        }); */

        for (let i = 0, len1 = this.categoryList.length; i < len1; i++) {
          const item1 = this.categoryList[i];
          if (item1.cat_id == tempCateIdLevel1) {
            // 判断是否存在二级分类，不存在会报 undefined 的错误
            // 此处不会报错，因为条件已经判断 this.selectedOptions.length == 3
            if (item1.children) {
              for (let j = 0, len2 = item1.children.length; j < len2; j++) {
                const item2 = item1.children[j];
                if (item2.cat_id == tempCateIdLevel2) {
                  // 判断是否存在三级分类，不存在会报 undefined 的错误
                  // 此处不会报错，因为条件已经判断 this.selectedOptions.length == 3
                  if (item2.children) {
                    for (
                      let k = 0, len3 = item2.children.length;
                      k < len3;
                      k++
                    ) {
                      const item3 = item2.children[k];
                      if (item3.cat_id == tempCateIdLevel3) {
                        tempCateName = item3.cat_name;
                        this.cateForm.cat_name = tempCateName;
                        // 结束所有循环
                        return;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    // 编辑 商品分类，给 级联选择器 设置数据源
    getFullGoodsCategories() {
      // 获取 三层分类列表
      this.getGoodsCategoriesByLevel(3);
    },
    // 添加 商品分类，给 级联选择器 设置数据源
    getGoodsCategories() {
      // 获取 二层分类列表
      this.getGoodsCategoriesByLevel(2);
    },
    // 公共方法： 给 级联选择器 设置数据源
    async getGoodsCategoriesByLevel(level) {
      // type：1，2，3   分别表示显示一层、二层、三层分类列表
      // 如果不传递，则默认获取所有级别的分类

      // console.time("耗时");

      let res = [];
      if (level == 2) {
        // 获取 二层分类列表
        res = await this.$http.get(`categories?type=2`);
      } else if (level == 3) {
        // 获取 三层分类列表
        res = await this.$http.get(`categories?type=3`);
      }

      // console.log(res);

      const {
        data,
        meta: { msg, status },
      } = res.data;

      if (status == 200) {
        // this.$message.success(msg);
        // 获取商品分类数据列表
        this.categoryList = data;

        // console.timeEnd("耗时");

        // console.log("公共方法 级联选择器的数据源：");
        // console.log(this.categoryList);
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
      // console.log(res);

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