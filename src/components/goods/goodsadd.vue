<template>
  <!-- 卡片小容器 -->
  <el-card class="box-card">
    <!-- 使用全局自定义组件：面包屑组件 -->
    <my-breadcrumb level1="商品管理" level2="商品列表"></my-breadcrumb>

    <!-- Alert 提示信息 -->
    <el-alert
      class="alertMsg"
      title="添加商品信息"
      type="info"
      center
      show-icon
    >
    </el-alert>

    <!-- 步骤条 el-steps -->
    <el-steps
      :active="1 * activeTabIdx"
      finish-status="success"
      simple
      style="margin-top: 20px"
    >
      <el-step title="基本信息"> </el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品图片"></el-step>
      <el-step title="商品内容"></el-step>
    </el-steps>

    <!-- 表单 -->
    <el-form
      label-position="top"
      label-width="80px"
      class="goodsForm"
      :model="goodsForm"
    >
      <!-- Tabs 选项卡 -->
      <el-tabs
        @tab-click="handleTabClick"
        v-model="activeTabIdx"
        tab-position="left"
      >
        <!-- 基本信息 选项卡 -->
        <el-tab-pane label="基本信息" name="1">
          <el-form-item label="商品名称">
            <el-input v-model="goodsForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格">
            <el-input v-model="goodsForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量">
            <el-input v-model="goodsForm.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量">
            <el-input v-model="goodsForm.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类">
            <!-- 
                级联选择器 el-cascader：
                options：数据源（一般为数组），键名可通过 Props 属性配置
                v-model：选中项绑定值，数组类型的数据
                props：配置选项（一般为对象，包含 label: "", value: "", children: ""）
                expand-trigger="hover" 属性被弃用，在 props 中配置 expandTrigger="hover"
            -->
            {{ selectedOptions }}
            <el-cascader
              v-model="selectedOptions"
              :options="categoryList"
              :props="defaultProps"
              @change="handleChangeCategories()"
              clearable
            ></el-cascader>
            <!-- <el-input v-model="goodsForm.goods_cat"></el-input> -->
          </el-form-item>
        </el-tab-pane>

        <!-- 商品参数 选项卡 -->
        <el-tab-pane label="商品参数" name="2">
          <!-- 在选择了商品分类的级联选择器后，动态商品参数才能被读取出来 -->
          <el-form-item
            :label="item1.attr_name"
            v-for="(item1, i) in dynamicParamsList"
            :key="i"
          >
            <!-- 
                注意：
                需要为 el-checkbox-group 指定 v-model 的值，
                否则会报以下错误信息：
                Error in render: "TypeError: Cannot read property 'length' of undefined"
            -->
            <!-- 复选框组 -->
            <el-checkbox-group v-model="item1.attr_vals">
              <el-checkbox
                v-for="(item2, i) in item1.attr_vals"
                :key="i"
                :label="item2"
                border
              ></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>

        <!-- 商品属性 选项卡 -->
        <el-tab-pane label="商品属性" name="3">
          <!-- 在选择了商品分类的级联选择器后，静态商品属性才能被读取出来 -->
          <el-form-item
            v-for="(item, i) in staticParamsList"
            :key="i"
            :label="item.attr_name"
          >
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>

        <!-- 商品图片 选项卡 -->
        <el-tab-pane label="商品图片" name="4">商品图片</el-tab-pane>

        <!-- 商品内容 选项卡 -->
        <el-tab-pane label="商品内容" name="5">商品内容</el-tab-pane>
      </el-tabs>
    </el-form>
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
      // 绑定 el-tab-pane 控件的 name 属性值
      // 与 el-steps 控件的 :active 属性联动
      activeTabIdx: "1",
      // 添加商品的表单数据
      goodsForm: {
        // this.$http.post(`goods`, this.goodsForm);
        goods_name: "", // 商品名称
        goods_cat: "", // 以','分割的分类列表
        goods_price: "", // 价格
        goods_number: "", // 数量
        goods_weight: "", // 重量
        goods_introduce: "", // 介绍
        pics: "", // 上传的图片临时路径（对象）
        attrs: "", // 商品的参数（数组），包含 '动态参数' 和 '静态属性'
      },
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
    };
  },
  methods: {
    // tab 选项卡被点击时触发
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

      // 如果 商品参数 选项卡被点击
      if (tab.name == "2") {
        // 如果 级联选择器 没有选择 三级分类的商品信息
        if (this.selectedOptions.length != 3) {
          this.$message.warning("请先选择商品的三级分类！");
        } else {
          // 商品分类 ID: 存储在 三级分类参数数组 selectedOptions 中
          // 获取动态 商品参数 列表
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

            // console.log(this.dynamicParamsList);
          } else {
            this.$message.error(msg);
          }
        }
      } // 如果 商品属性 选项卡被点击
      else if (tab.name == "3") {
        // 如果 级联选择器 没有选择 三级分类的商品信息
        if (this.selectedOptions.length != 3) {
          this.$message.warning("请先选择商品的三级分类！");
        } else {
          // 商品分类 ID: 存储在 三级分类参数数组 selectedOptions 中
          // 获取静态 商品属性 列表
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
        }
      }
    },
    // 级联选择器 @change 事件时触发
    handleChangeCategories() {},
    // 获取商品分类数据列表
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
        // 给级联选择器设置数据源
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

.goodsForm {
  margin-top: 30px;
  height: 600px;
  overflow: auto;
}
</style>