<template>
  <!-- 卡片小容器 -->
  <el-card class="box-card">
    <!-- 使用全局自定义组件：面包屑组件 -->
    <my-breadcrumb level1="商品管理" level2="商品列表"></my-breadcrumb>

    <!-- 搜索 -->
    <el-row class="searchRow">
      <el-col>
        <el-input
          @clear="loadGoodsList()"
          clearable
          placeholder="请输入内容"
          v-model="query"
          class="input-with-select inputSearch"
        >
          <el-button
            @click="searchGoods()"
            slot="append"
            icon="el-icon-search"
          ></el-button>
        </el-input>
        <el-button type="success" plain @click="redirectToAddGoodsTemp()">
          添加商品
        </el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table :data="goodsList" class="dataTable" border height="800px">
      <!-- type="index"  设置该列的每个单元格的内容是从 1 开始的序号 -->
      <el-table-column type="index" label="#" width="60px"> </el-table-column>
      <el-table-column prop="goods_name" label="商品名称" width="700px">
      </el-table-column>
      <el-table-column prop="goods_price" label="商品价格（元）" width="150px">
      </el-table-column>
      <el-table-column prop="goods_weight" label="商品重量" width="130px">
      </el-table-column>
      <el-table-column label="创建日期" width="180px">
        <!-- {{ add_time | fmtdate }}  无效用法 -->
        <!-- prop="add_time | fmtdate" 无效用法 -->
        <!-- 
            1、如果单元格内显示的内容不是字符串（文本），
              需要给被显示的内容外层包裹一个 template。
            2、template 内部要用数据，设置 slot-scope 属性，
              该属性的值需要使用数据 add_time 的数据源 goodsList。
            3、slot-scope 的值 goodsList 其实就是 el-table 绑定的数据 goodsList，
              goodsList.row 是指数组中的每个对象。
            4、slot-scope 的作用就是传值，会自动去上一级找最外层标签 el-table 
              绑定的数据源 goodsList。slot-scope 的属性可赋任意变量(如：scope)，
              最终找到的数据源会把值传给该变量。
        -->
        <template slot-scope="scope">
          {{ scope.row.add_time | fmtdate }}
        </template>
      </el-table-column>

      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            @click="redirectToEditGoodsTemp(scope.row.goods_id)"
            size="medium"
            :plain="true"
            type="primary"
            icon="el-icon-edit"
            circle
          >
          </el-button>
          <el-button
            @click="showDeleGoodsMsgBox(scope.row.goods_id)"
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
      :page-sizes="[10, 20, 30, 40, 50]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
  </el-card>
</template>
<script>
export default {
  created() {
    this.getGoodsList();
  },
  data() {
    return {
      query: "",
      pagenum: 1,
      pagesize: 10,
      goodsList: [],
      total: -1,
    };
  },
  methods: {
    // 跳转到“编辑商品”模板
    redirectToEditGoodsTemp(goodsId) {
      // console.log(goodsId);

      // 需要与路由模板 index.js 中定义的路由标识 name 保持一致（区分大小写）
      // 不在 index.js 路由页配置参数来接收（url中不显示参数，刷新页面会丢失传递过来的参数）

      // 通过 name 跳转，携带参数
      this.$router.push({
        name: "goodsedit",
        params: {
          goodsId: goodsId,
        },
      });
    },
    // 跳转到“添加商品”模板
    redirectToAddGoodsTemp() {
      // 需要与路由模板 index.js 中定义的路由标识 name 保持一致（区分大小写）
      this.$router.push({ name: "goodsadd" });
    },
    // 显示“删除商品”消息盒子
    showDeleGoodsMsgBox(goodId) {
      this.$confirm("此操作将永久删除该商品, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          // 发送删除商品的请求
          const res = await this.$http.delete(`goods/${goodId}`);
          console.log(res);

          if (res.data.meta.status == 200) {
            this.pagenum = 1;
            // 更新商品列表信息（视图）
            this.getGoodsList();
            // 提示删除商品成功
            this.$message({
              type: "success",
              message: res.data.meta.msg,
            });
          } else {
            // 提示删除商品失败
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
    // 搜索框清空后重新加载全部商品列表信息
    loadGoodsList() {
      this.getGoodsList();
    },
    // 搜索商品
    searchGoods() {
      // 每次查询之前，把页码设置为 1
      this.pagenum = 1;
      this.getGoodsList();
    },
    // 分页
    handleSizeChange(val) {
      // 每页显示条数变化时 触发
      // console.log(`每页 ${val} 条`);
      this.pagesize = val;
      this.pagenum = 1;
      this.getGoodsList();
    },
    handleCurrentChange(val) {
      // 当前页码改变时 触发
      // console.log(`当前页: ${val}`);
      this.pagenum = val;
      this.getGoodsList();
    },
    // 获取商品列表信息（发送请求）
    async getGoodsList() {
      const res = await this.$http.get(
        `goods?query=${this.query}&pagenum=${this.pagenum}&pagesize=${this.pagesize}`
      );
      // console.log(res);

      const {
        data: { total, goods },
        meta: { msg, status },
      } = res.data;

      if (status == 200) {
        // this.$message.success(msg);
        this.goodsList = goods;
        this.total = total;
      } else {
        this.$message.error(msg);
      }
    },
  },
};
</script>
<style>
/* .box-card {
  height: 100%;
} */

.searchRow {
  margin-top: 20px;
}

.inputSearch {
  width: 400px;
}

.dataTable {
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
}
</style>