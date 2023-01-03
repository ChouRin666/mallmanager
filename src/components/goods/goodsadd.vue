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
            <el-cascader
              v-model="selectedOptions"
              :options="categoryList"
              :props="defaultProps"
              @change="handleChangeCategories()"
              clearable
            ></el-cascader>
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
            <el-checkbox-group
              @change="chkGroupChange(item1)"
              v-model="item1.attr_vals"
            >
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
        <el-tab-pane label="商品图片" name="4">
          <el-form-item>
            <!-- 
                此处上传图片的 action 需要填写全路径，
                因为并不是通过调用 axios 向服务器发送请求。

                不能像之前进行数据的 CRUD 操作时，发送 axios 请求时只写后半部分的请求路径，
                因为已经在封装好的 $http 方法中设置了 axios 的 baseURL。

                headers：设置上传的请求头部
                要想上传成功，需要设置 header，以便发送的请求携带 token 令牌。
            -->

            <!-- 上传图片 el-upload  -->
            <el-upload
              class="upload-demo"
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :headers="headers"
              :on-preview="handlePicPreview"
              :on-remove="handlePicRemove"
              :on-success="handlePicSuccess"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </el-upload>
          </el-form-item>
        </el-tab-pane>

        <!-- 商品内容 选项卡 -->
        <el-tab-pane label="商品内容" name="5">
          <el-form-item>
            <quill-editor
              v-model="goodsForm.goods_introduce"
              data-placeholder="请输入商品内容......"
            >
            </quill-editor>
            <!-- <quill-editor
              v-model="content"
              ref="myQuillEditor"
              :options="editorOption"
              @blur="onEditorBlur($event)"
              @focus="onEditorFocus($event)"
              @ready="onEditorReady($event)"
            >
            </quill-editor> -->
          </el-form-item>
          <el-form-item>
            <el-button @click="addGoods()" type="primary" plain
              >添加商品</el-button
            >
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </el-card>
</template>

<script>
// 引入 第三方插件 富文本编辑器 vue-quill-editor 所需的样式
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

// 引入 第三方插件 富文本编辑器 vue-quill-editor 的包文件
import { quillEditor } from "vue-quill-editor";

export default {
  components: {
    quillEditor, // 局部挂载 第三方插件 富文本编辑器 vue-quill-editor 的组件
  },
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
        pics: [], // 上传的图片数组，包含临时图片路径（对象）
        attrs: [], // 商品的参数（数组），包含 '动态参数' 和 '静态属性'
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
      // 设置上传图片的请求头部，须携带 token 令牌
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    };
  },
  methods: {
    // 添加商品（发送请求）
    async addGoods() {
      /*     
        goodsForm 中待处理属性

        1、goods_cat
          以','分割的分类列表：
          把级联选择器 selectedOptions 的数组值转为为以','分割的字符串，格式如下：
          goods_cat: "1,3,6"
       
        2、pics
          上传的图片数组，包含临时图片路径（对象），格式如下：
          pics: [
            { "pic": "/tmp_uploads/30f08d52c551ecb447277eae232304b8" }
          ]  
          已在 handlePicSuccess 和 handlePicRemove 事件中处理好 goodsForm.pics 数组。

        3、attrs
          商品的参数（数组），包含 '动态参数' 和 '静态属性'，格式如下：
          attrs: [
            {
              "attr_id":15,
              "attr_value":"ddd"
            },
            {
              "attr_id":15,
              "attr_value":"eee"
            }
          ]
      */
      this.goodsForm.goods_cat = this.selectedOptions.join(",");

      const tempArr = [];
      // 存储 静态属性 的值到 goodsForm.attrs 数组
      this.staticParamsList.forEach((item) => {
        tempArr.push({
          attr_id: item.attr_id,
          attr_value: item.attr_vals,
        });
      });

      // 在 Checkbox-group 触发 @change 事件时，
      // 已向 goodsForm.attrs 数组设置了 动态参数 的值
      this.goodsForm.attrs = [...this.goodsForm.attrs, ...tempArr];

      // 返回 Promise 对象
      const res = await this.$http.post(`goods`, this.goodsForm);

      // console.log(res);

      const {
        data,
        meta: { msg, status },
      } = res.data;

      if (status == 201) {
        this.$message.success(msg);

        // 跳转到 商品列表 页面
        // 需要与路由模板 index.js 中定义的路由标识 name 保持一致（区分大小写）
        this.$router.push({ name: "goods" });
      } else {
        this.$message.error(msg);
      }
    },
    // 当 Checkbox-group 绑定值变化时触发的 @change 事件
    chkGroupChange(chkGroup) {
      // console.log(chkGroup);

      /* 
        attrs
        商品的参数（数组），包含 '动态参数' 和 '静态属性'，格式如下：
        attrs: [
          {
            "attr_id":15,
            "attr_value":"ddd"
          },
          {
            "attr_id":15,
            "attr_value":"eee"
          }
        ] 
      */

      /* 

      // 存储 动态参数 的值到 goodsForm.attrs 数组，方式 1：
      // 使用 2 个临时数组 tempAttrVals1 和 tempAttrVals2 。 

      // 触发 @change 事件的 Checkbox-group
      // 把当前 Checkbox-group 选中的值存储到临时数组 tempAttrVals1 中
      const tempAttrVals1 = [];
      chkGroup.attr_vals.forEach((item) => {
        tempAttrVals1.push({
          attr_id: chkGroup.attr_id,
          attr_value: item,
        });
      });

      // 没有触发 @change 事件的 Checkbox-group
      // 把 goodsForm.attrs 数组中其他 Checkbox-group 的值
      // 存储到临时数组 tempAttrVals2 中（不属于 chkGroup.attr_id 的值）
      const tempAttrVals2 = [];
      this.goodsForm.attrs.forEach((item) => {
        if (item.attr_id != chkGroup.attr_id) {
          tempAttrVals2.push({
            attr_id: item.attr_id,
            attr_value: item.attr_value,
          });
        }
      });

      // 清空 goodsForm.attrs 数组的所有值
      this.goodsForm.attrs = [];

      // 把所有 Checkbox-group 选中的最新值传递给 goodsForm.attrs 数组

      // 拼接数组，方式 1：使用 concat() 方法
      // this.goodsForm.attrs = tempAttrVals1.concat(tempAttrVals2);

      // 拼接数组，方式 2：使用 ES 7 提供的展开运算符 [...数组或对象, ...数组或对象]
      this.goodsForm.attrs = [...tempAttrVals1, ...tempAttrVals2]; 
      
      */

      /* ----------------------------------------------------------------- */

      // 存储 动态参数 的值到 goodsForm.attrs 数组，方式 2：
      // 使用 1 个临时数组 tempAttrVals 。

      // 触发 @change 事件的 Checkbox-group
      // 把当前 Checkbox-group 选中的值存储到临时数组 tempAttrVals 中
      const tempAttrVals = [];
      chkGroup.attr_vals.forEach((item) => {
        tempAttrVals.push({
          attr_id: chkGroup.attr_id,
          attr_value: item,
        });
      });

      // 没有触发 @change 事件的 Checkbox-group
      // 把 goodsForm.attrs 数组中其他 Checkbox-group 的值
      // 存储到临时数组 tempAttrVals 中（不属于 chkGroup.attr_id 的值）
      this.goodsForm.attrs.forEach((item) => {
        if (item.attr_id != chkGroup.attr_id) {
          tempAttrVals.push({
            attr_id: item.attr_id,
            attr_value: item.attr_value,
          });
        }
      });

      // 清空 goodsForm.attrs 数组的所有值
      this.goodsForm.attrs = [];

      // 把所有 Checkbox-group 选中的最新值传递给 goodsForm.attrs 数组
      this.goodsForm.attrs = tempAttrVals;

      // console.log(this.goodsForm.attrs);
    },
    // 处理上传图片时的 preview 事件
    handlePicPreview(file) {
      // console.log("预览");
      // console.log(file);
    },
    // 处理上传图片时的 remove 事件
    handlePicRemove(file, fileList) {
      // console.log("移除");
      // console.log(file);

      /* 
        goodsForm.pics 数组的格式如下：
        [{ pic: tmp_path1 }, { pic: tmp_path2 }, { pic: tmp_path3 }]

        回调参数 file 返回的 file.response.data.tmp_path 值如下：
        tmp_path: "tmp_uploads/91c463719071f83e50e207ece780be37.jpeg";

        找到待删除图片在数组中的索引
        方式 1：
          使用 for 循环迭代器遍历数组 goodsForm.pics，
          匹配 tmp_path 一致的值，记录其在数组中的索引。

        方式 2：
          使用 findIndex() 方法遍历数组 goodsForm.pics，
          匹配 tmp_path 一致的值，返回符合条件元素在数组中的索引。
      */

      /* 
        方式 1：
        使用 for 循环，找到待删除图片在数组中的索引 
      */

      /* 
        // 待删除图片的临时路径
        const delTmpPath = file.response.data.tmp_path;

        let delIdx = -1;

        for (
          let i = 0, arrLength = this.goodsForm.pics.length;
          i < arrLength;
          i++
        ) {
          if (this.goodsForm.pics[i].pic == delTmpPath) {
            delIdx = i;
          }
        }
        
        this.goodsForm.pics.splice(delIdx, 1);
      */

      /* 
        方式 2：
        使用 findIndex() 方法，找到待删除图片在数组中的索引 
      */

      // 待删除图片的临时路径
      const delTmpPath = file.response.data.tmp_path;

      // findIndex 遍历 数组，把符合条件的元素的索引进行返回
      let delIdx = this.goodsForm.pics.findIndex((item) => {
        return item.pic == delTmpPath;
      });

      this.goodsForm.pics.splice(delIdx, 1);
    },
    // 处理上传图片时的 success 事件
    handlePicSuccess(response, file, fileList) {
      // console.log("成功");
      // console.log(file);

      /* 
        回调参数 file 返回的 file.response.data.tmp_path 值如下：
        tmp_path: "tmp_uploads/91c463719071f83e50e207ece780be37.jpeg";
      */

      // 向 goodsForm.pics 数组中添加临时图片路径（对象）
      this.goodsForm.pics.push({ pic: file.response.data.tmp_path });
    },
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

/* 富文本编辑器自带样式名 */
.ql-editor {
  min-height: 300px;
}
</style>