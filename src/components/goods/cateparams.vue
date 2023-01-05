<template>
  <!-- 卡片小容器 -->
  <el-card class="box-card">
    <!-- 使用全局自定义组件：面包屑组件 -->
    <my-breadcrumb level1="商品管理" level2="分类参数"></my-breadcrumb>

    <!-- Alert 提示信息 -->
    <el-alert
      title="只允许为第三级分类设置参数"
      type="warning"
      class="alertMsg"
    >
    </el-alert>

    <!-- 表单 -->
    <el-form label-position="left" label-width="80px" class="cateParamsForm">
      <el-form-item label="商品分类">
        <!-- 
        级联选择器 el-cascader：
        options：数据源（一般为数组），键名可通过 Props 属性配置
        v-model：选中项绑定值，数组类型的数据
        props：配置选项（一般为对象，包含 label: "", value: "", children: ""）
        show-all-levels：定义了是否显示完整的路径，将其赋值为 false，则仅显示最后一级
        expand-trigger="hover" 属性被弃用，在 props 中配置 expandTrigger="hover"
        -->
        <el-cascader
          v-model="selectedOptions"
          :options="categoryList"
          :props="defaultProps"
          :show-all-levels="false"
          @change="changeCateParams()"
          clearable
        ></el-cascader>
      </el-form-item>
    </el-form>

    <!-- 选项卡 -->
    <el-tabs v-model="activeTabIdx" type="card" @tab-click="handleTabClick">
      <el-tab-pane label="动态参数" name="1">
        <!-- 添加按钮：设置动态参数 -->
        <el-button @click="showAddDynamicParamsDia()" type="danger" plain
          >设置动态参数</el-button
        >

        <!-- 表格 -->
        <el-table :data="dynamicParamsList" style="width: 100%">
          <el-table-column type="expand" label="#" width="100px">
            <template slot-scope="scope">
              <!-- 
                页面布局如果是行列问题，考虑使用 for 循环嵌套输出 el-tag 。
                el-tag 的 type 属性控制标签颜色：
                type: ''  蓝色
                type: 'success'  绿色
                type: 'info'  灰色
                type: 'warning'  黄色
                type: 'danger'  红色
                -->

              <el-tag
                v-for="(item, i) in scope.row.attr_vals"
                :key="i"
                :disable-transitions="false"
                @close="handleClose(scope.row, item)"
                class="dynamicParamsTag"
                type=""
                closable
              >
                {{ item }}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="inputVisible"
                v-model="inputValue"
                ref="saveTagInput"
                size="medium"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
              >
              </el-input>
              <el-button
                v-else
                class="button-new-tag"
                size="medium"
                @click="showInput"
                >+ New Tag</el-button
              >
            </template>
          </el-table-column>
          <el-table-column label="属性名称" prop="attr_name" width="400px"> </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                @click="showEditDynamicParamsDia(scope.row)"
                size="medium"
                :plain="true"
                type="primary"
                icon="el-icon-edit"
                circle
              >
              </el-button>
              <el-button
                @click="showDeleDynamicParamsMsgBox(scope.row)"
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
      </el-tab-pane>
      <el-tab-pane label="静态参数" name="2">
        <!-- 添加按钮：设置静态属性 -->
        <el-button @click="showAddStaticParamsDia()" type="danger" plain
          >设置静态参数</el-button
        >

        <!-- 表格 -->
        <el-table :data="staticParamsList" style="width: 100%">
          <el-table-column type="index" label="#" width="100px">
          </el-table-column>
          <el-table-column label="属性名称" prop="attr_name" width="400px">
          </el-table-column>
          <el-table-column label="属性值" prop="attr_vals" width="500px">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                @click="showEditStaticParamsDia(scope.row)"
                size="medium"
                :plain="true"
                type="primary"
                icon="el-icon-edit"
                circle
              >
              </el-button>
              <el-button
                @click="showDeleStaticParamsMsgBox(scope.row)"
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
      </el-tab-pane>
    </el-tabs>

    <!-- 对话框 -->
    <!-- 添加动态参数的对话框 -->
    <el-dialog title="添加动态参数" :visible.sync="dialogFormVisibleAdd">
      <el-form :model="tagForm" label-position="top">
        <el-form-item label="参数名称" required label-width="100px">
          <el-input v-model="tagForm.attr_name" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="值" label-width="100px">
          <el-input v-model="tagForm.attr_vals" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleAdd = false">取 消</el-button>
        <el-button type="primary" @click="addDynamicParams()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑动态参数的对话框 -->
    <el-dialog title="编辑动态参数" :visible.sync="dialogFormVisibleEdit">
      <el-form :model="tagForm" label-position="top">
        <el-form-item label="参数名称" required label-width="100px">
          <el-input v-model="tagForm.attr_name" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="值" label-width="100px">
          <el-input v-model="tagForm.attr_vals" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleEdit = false">取 消</el-button>
        <el-button type="primary" @click="editDynamicParams()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 添加静态参数的对话框 -->
    <el-dialog title="添加静态参数" :visible.sync="dialogFormVisibleStaticAdd">
      <el-form :model="tagForm" label-position="top">
        <el-form-item label="属性名称" required label-width="100px">
          <el-input v-model="tagForm.attr_name" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="属性值" label-width="100px">
          <el-input v-model="tagForm.attr_vals" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleStaticAdd = false">取 消</el-button>
        <el-button type="primary" @click="addStaticParams()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑静态参数的对话框 -->
    <el-dialog title="编辑静态参数" :visible.sync="dialogFormVisibleStaticEdit">
      <el-form :model="tagForm" label-position="top">
        <el-form-item label="属性名称" required label-width="100px">
          <el-input v-model="tagForm.attr_name" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="属性值" label-width="100px">
          <el-input v-model="tagForm.attr_vals" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleStaticEdit = false"
          >取 消</el-button
        >
        <el-button type="primary" @click="editStaticParams()">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>  

<script>
export default {
  created() {
    // 初始化级联选择器
    this.getGoodsCategories();
  },
  data() {
    return {
      // 级联选择器的属性
      selectedOptions: [],
      categoryList: [],
      defaultProps: {
        expandTrigger: "hover",
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      // 动态商品参数列表
      dynamicParamsList: [],
      // 静态商品属性列表
      staticParamsList: [],
      activeTabIdx: "1",
      // tag 标签的属性
      inputVisible: false,
      inputValue: "",
      // 添加 或 删除 tag 标签，提交方法时的请求体
      tagForm: {
        attr_name: "",
        attr_sel: "",
        attr_vals: "",
      },
      // 动态参数 对话框的数据
      dialogFormVisibleAdd: false,
      dialogFormVisibleEdit: false,
      // 编辑 动态参数 对话框的数据
      currCatId: -1,
      currAttrId: -1,
      // 静态参数 对话框的数据
      dialogFormVisibleStaticAdd: false,
      dialogFormVisibleStaticEdit: false,
    };
  },
  methods: {
    // 编辑 静态参数 (发送请求)
    editStaticParams() {
      // 验证 提交的表单
      if (this.validateSubmitForm("static")) {
        this.editDynamicOrStaticParams("static");

        // 隐藏 编辑静态参数 对话框
        this.dialogFormVisibleStaticEdit = false;
      }
    },
    // 显示 编辑静态参数 对话框
    showEditStaticParamsDia(staticParams) {
      this.currCatId = staticParams.cat_id;
      this.currAttrId = staticParams.attr_id;

      this.tagForm = {
        attr_name: staticParams.attr_name,
        attr_sel: staticParams.attr_sel,
        attr_vals: staticParams.attr_vals,
      };

      // 显示 编辑静态参数 对话框
      this.dialogFormVisibleStaticEdit = true;
    },
    // 显示 删除静态参数 对话框
    showDeleStaticParamsMsgBox(staticParams) {
      this.deleDynamicOrStaticParams(staticParams, "静态参数");
    },
    // 添加 静态参数 （发送请求）
    addStaticParams() {
      // 验证提交的表单
      if (this.validateSubmitForm("static")) {
        this.addDynamicOrStaticParams("static");

        // 隐藏 添加静态参数 对话框
        this.dialogFormVisibleStaticAdd = false;
      }
    },
    // 显示 添加静态参数 对话框
    showAddStaticParamsDia() {
      if (this.selectedOptions.length != 3) {
        this.$message.warning("请先选择商品的三级分类！");
      } else {
        // 添加 静态参数 前，清空表单请求体
        this.tagForm = {};

        // 显示 添加静态参数 对话框
        this.dialogFormVisibleStaticAdd = true;
      }
    },
    // 点击 tag 标签的 删除图标时触发
    async handleClose(dynamicParams, tag) {
      const attrValList = dynamicParams.attr_vals;
      attrValList.splice(attrValList.indexOf(tag), 1);

      // put 方法，参数请求体
      this.tagForm = {
        attr_name: dynamicParams.attr_name,
        attr_sel: dynamicParams.attr_sel,
        attr_vals: attrValList.join(","), // 把数组转换为字符串
      };

      // 删除 tag （发送请求），以下方式 2 选 1
      // cat_id 可以传入 dynamicParams.cat_id ，也可以传入 this.selectedOptions[2]

      // 方式 1：
      // const res = await this.$http.put(
      //   `categories/${dynamicParams.cat_id}/attributes/${dynamicParams.attr_id}`,
      //   this.tagForm
      // );

      // 方式 2：
      const res = await this.$http.put(
        `categories/${this.selectedOptions[2]}/attributes/${dynamicParams.attr_id}`,
        this.tagForm
      );

      // console.log(res);

      const {
        data,
        meta: { msg, status },
      } = res.data;

      if (status == 200) {
        this.$message.success(msg);
      } else {
        this.$message.error(msg);
      }
    },
    // 点击添加 tag 时触发
    showInput() {
      this.inputVisible = true;
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // tag 标签输入内容后， 回车 或 失去焦点 时触发
    async handleInputConfirm(dynamicParams) {
      // console.log("handleInputConfirm");
      // console.log(dynamicParams);
      let inputValue = this.inputValue.trim();
      if (inputValue) {
        const attrValList = dynamicParams.attr_vals;
        // 如果添加的 tag 在数组中已存在
        if (attrValList.indexOf(inputValue) != -1) {
          this.$message.error("当前分类下的该参数已存在！");
          // return;
        } else {
          attrValList.push(inputValue);

          // put 方法，参数请求体
          this.tagForm = {
            attr_name: dynamicParams.attr_name,
            attr_sel: dynamicParams.attr_sel,
            attr_vals: attrValList.join(","), // 把数组转换为字符串
          };

          // 添加 tag （发送请求），以下方式 2 选 1
          // cat_id 可以传入 dynamicParams.cat_id ，也可以传入 this.selectedOptions[2]

          // 方式 1：
          const res = await this.$http.put(
            `categories/${dynamicParams.cat_id}/attributes/${dynamicParams.attr_id}`,
            this.tagForm
          );

          // 方式 2：
          /* const res = await this.$http.put(
            `categories/${this.selectedOptions[2]}/attributes/${dynamicParams.attr_id}`,
            this.tagForm
          ); */

          // console.log(res);

          const {
            data,
            meta: { msg, status },
          } = res.data;

          if (status == 200) {
            this.$message.success(msg);
          } else {
            this.$message.error(msg);
          }
        }
      }
      this.inputVisible = false;
      this.inputValue = "";
    },
    // 显示 删除动态参数 对话框
    showDeleDynamicParamsMsgBox(dynamicParams) {
      this.deleDynamicOrStaticParams(dynamicParams, "动态参数");
    },
    // 公共方法：删除 动态参数 或 静态参数 (发送请求)，共用一个接口
    async deleDynamicOrStaticParams(attribute, message) {
      // attribute：动态参数对象 或 静态参数对象
      // message: ["动态参数","静态参数"]  参数 2 选 1
      this.$confirm(`此操作将永久删除该分类下${message}, 是否继续?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          // 删除 动态参数 或 静态参数 (发送请求)，共用一个接口
          const res = await this.$http.delete(
            `categories/${attribute.cat_id}/attributes/${attribute.attr_id}`
          );
          // console.log(res);

          if (res.data.meta.status == 200) {
            if (message == "动态参数") {
              // 刷新视图（加载 动态参数）
              this.loadDynamicParams();
            } else if (message == "静态参数") {
              // 刷新视图（加载 静态参数）
              this.loadStaticParams();
            }

            // 提示删除 分类参数 成功
            this.$message({
              type: "success",
              message: res.data.meta.msg,
            });
          } else {
            // 提示删除 分类参数 失败
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
    // 编辑 动态参数 (发送请求)
    editDynamicParams() {
      // 验证 提交的表单
      if (this.validateSubmitForm("dynamic")) {
        this.editDynamicOrStaticParams("dynamic");

        // 隐藏 编辑动态参数 对话框
        this.dialogFormVisibleEdit = false;
      }
    },
    // 公共方法：编辑 动态参数 或 静态参数（发送请求）
    async editDynamicOrStaticParams(sourceType) {
      // 编辑 动态参数 或 静态参数（发送请求），共用一个接口
      const res = await this.$http.put(
        `categories/${this.currCatId}/attributes/${this.currAttrId}`,
        this.tagForm
      );

      // console.log(sourceType);
      // console.log(res);

      const {
        data,
        meta: { msg, status },
      } = res.data;

      if (status == 200) {
        this.$message.success(msg);

        // 修改完成 动态参数 后，清空表单请求体
        this.tagForm = {};

        if (sourceType == "dynamic") {
          // 刷新视图（加载 动态参数）
          this.loadDynamicParams();
        } else if (sourceType == "static") {
          // 刷新视图（加载 静态参数）
          this.loadStaticParams();
        }
      } else {
        this.$message.error(msg);
      }
    },
    // 显示 编辑动态参数 对话框
    async showEditDynamicParamsDia(dynamicParams) {
      this.currCatId = dynamicParams.cat_id;
      this.currAttrId = dynamicParams.attr_id;
      let tempAttrVals = "";
      if (dynamicParams.attr_vals.length != 0) {
        tempAttrVals = dynamicParams.attr_vals.join(","); // 把数组转换为字符串
      }

      this.tagForm = {
        attr_name: dynamicParams.attr_name,
        attr_sel: dynamicParams.attr_sel,
        attr_vals: tempAttrVals,
      };

      // 显示 编辑动态参数 对话框
      this.dialogFormVisibleEdit = true;
    },
    // 添加 动态参数 (发送请求)
    addDynamicParams() {
      // 验证提交的表单
      if (this.validateSubmitForm("dynamic")) {
        this.addDynamicOrStaticParams("dynamic");

        // 隐藏 添加动态参数 对话框
        this.dialogFormVisibleAdd = false;
      }
    },
    // 公共方法：添加 动态参数 或 静态参数 (发送请求)
    async addDynamicOrStaticParams(sourceType) {
      // 添加 动态参数 或 静态参数（发送请求），共用一个接口
      const res = await this.$http.post(
        `categories/${this.selectedOptions[2]}/attributes`,
        this.tagForm
      );

      // console.log(res);

      const {
        data,
        meta: { msg, status },
      } = res.data;

      if (status == 201) {
        this.$message.success(msg);

        // 添加完成 动态参数 或 静态参数 后，清空表单请求体
        this.tagForm = {};

        if (sourceType == "dynamic") {
          // 刷新视图（加载 动态参数）
          this.loadDynamicParams();
        } else if (sourceType == "static") {
          // 刷新视图（加载 静态参数）
          this.loadStaticParams();
        }
      } else {
        this.$message.error(msg);
      }
    },
    // 公共方法：验证表单，无论是添加或编辑 动态参数/静态参数 都适用
    validateSubmitForm(sourceType) {
      let inputAttrName = "";
      let inputAttrVals = "";

      if (this.tagForm.attr_name) {
        inputAttrName = this.tagForm.attr_name.trim();
      }

      if (this.tagForm.attr_vals) {
        inputAttrVals = this.tagForm.attr_vals.trim();
      }

      if (inputAttrName == "") {
        if (sourceType == "dynamic") {
          this.$message.error("请输入参数名称！");
        } else if (sourceType == "static") {
          this.$message.error("请输入属性名称！");
        }
        return false;
      }

      // 重新为 tagForm 中的属性赋值
      this.tagForm.attr_name = inputAttrName;
      if (sourceType == "dynamic") {
        if (inputAttrVals != "" || inputAttrVals.length != 0) {
          // 把 中文逗号 替换成 英文逗号

          // 默认替换 attr_vals 中的第一个中文逗号
          // this.tagForm.attr_vals = inputAttrVals.replace("，", ",");

          // 全局替换 attr_vals 中的所有中文逗号
          this.tagForm.attr_vals = inputAttrVals.replace(/\，/g, ",");
        }

        this.tagForm.attr_sel = "many";
      } else if (sourceType == "static") {
        this.tagForm.attr_vals = inputAttrVals;
        this.tagForm.attr_sel = "only";
      }

      return true;
    },
    // 显示 添加动态参数 对话框
    showAddDynamicParamsDia() {
      if (this.selectedOptions.length != 3) {
        this.$message.warning("请先选择商品的三级分类！");
      } else {
        // 添加 动态参数 前，清空表单请求体
        this.tagForm = {};

        // 显示 添加动态参数 对话框
        this.dialogFormVisibleAdd = true;
      }
    },
    // tab 选项卡 触发 @tab-click 事件
    async handleTabClick(tab) {
      // 回调参数 tab：被选中的 el-tab-pane 标签 (tab 实例)
      // 回调参数 event：被选中的 el-tab-pane 标签对应的事件
      // console.log(tab);
      /* 
        如何判断当前被点击的选项卡是否为 商品参数 选项卡，
        有 2 种方式：
        方式 1：
            this.activeTabIdx == "2"
        方式 2：
            tab.name == "2"
      */
      // 如果 级联选择器 没有选择 三级分类的商品信息
      if (this.selectedOptions.length != 3) {
        this.$message.warning("请先选择商品的三级分类！");
      } else {
        if (tab.name == "1") {
          // 加载 动态参数
          this.loadDynamicParams();
        } else if (tab.name == "2") {
          // 加载 静态参数
          this.loadStaticParams();
        }
      }
    },
    // 级联选择器 触发 @change 事件
    changeCateParams() {
      // 选择了 三级 分类才去获取 动态参数 或 静态参数
      if (this.selectedOptions.length == 3) {
        if (this.activeTabIdx == "1") {
          // 加载 动态参数
          this.loadDynamicParams();
        } else if (this.activeTabIdx == "2") {
          // 加载 静态参数
          this.loadStaticParams();
        }
      }
    },
    // 获取 静态参数 列表
    async loadStaticParams() {
      // 商品分类 ID: 存储在 三级分类参数数组 selectedOptions 中

      const res = await this.$http.get(
        `categories/${this.selectedOptions[2]}/attributes?sel=only`
      );
      // console.log(res);

      const {
        data,
        meta: { msg, status },
      } = res.data;

      if (status == 200) {
        // this.$message.success(msg);
        this.staticParamsList = data;

        // console.log(this.staticParamsList);
      } else {
        this.$message.error(msg);
      }
    },
    // 获取 动态参数 列表
    async loadDynamicParams() {
      // 商品分类 ID: 存储在 三级分类参数数组 selectedOptions 中

      const res = await this.$http.get(
        `categories/${this.selectedOptions[2]}/attributes?sel=many`
      );
      // console.log(res);

      const {
        data,
        meta: { msg, status },
      } = res.data;

      if (status == 200) {
        // this.$message.success(msg);
        this.dynamicParamsList = data;

        // 把 attr_vals 字符串转换为数组
        this.dynamicParamsList.forEach((item) => {
          // 空字符串的长度为 0
          // 空字符串调用 trim() 方法不会报错，返回结果的长度也为 0
          let tempAttrVals = item.attr_vals.trim();

          if (tempAttrVals == "" || tempAttrVals.length == 0) {
            item.attr_vals = [];
          } else {
            item.attr_vals = tempAttrVals.split(",");
          }
        });

        // console.log("this.dynamicParamsList");
        // console.log(this.dynamicParamsList);
      } else {
        this.$message.error(msg);
      }
    },
    // 给 级联选择器 设置数据源
    async getGoodsCategories() {
      // type：1，2，3   分别表示显示一层、二层、三层分类列表
      // 如果不传递，则默认获取所有级别的分类
      const res = await this.$http.get(`categories?type=3`);
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
  },
};
</script>

<style>
.alertMsg {
  margin-top: 20px;
  height: 50px;
}

.alertMsg span {
  line-height: 60px;
}

.cateParamsForm {
  margin-top: 30px;
  height: 70px;
  overflow: auto;
}

.dynamicParamsTag {
  margin: 5px;
}

.el-tag + .el-tag {
  margin-left: 10px;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}

.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>