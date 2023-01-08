<template>
  <!-- 卡片小容器 -->
  <el-card class="box-card">
    <!-- 使用全局自定义组件：面包屑组件 -->
    <my-breadcrumb level1="订单管理" level2="订单列表"></my-breadcrumb>

    <!-- 搜索 -->
    <el-row class="searchRow">
      <el-col>
        <el-input
          @clear="loadOrderList()"
          clearable
          placeholder="请输入内容"
          v-model="query"
          class="input-with-select inputSearch"
        >
          <el-button
            @click="searchOrders()"
            slot="append"
            icon="el-icon-search"
          ></el-button>
        </el-input>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table :data="orderList" height="700px" border class="ordersTable">
      <el-table-column type="index" label="#" width="100px"> </el-table-column>
      <el-table-column prop="order_number" label="订单编号" width="300px">
      </el-table-column>
      <el-table-column prop="order_price" label="订单价格" width="160px">
      </el-table-column>
      <el-table-column label="是否付款" width="160px">
        <template slot-scope="scope">
          <span v-if="scope.row.pay_status == '0'">未付款</span>
          <span v-if="scope.row.pay_status == '1'">已付款</span>
        </template>
      </el-table-column>
      <el-table-column prop="is_send" label="是否发货" width="160px">
      </el-table-column>
      <el-table-column label="下单时间" width="240px">
        <template slot-scope="scope">
          {{ scope.row.create_time | fmtdate }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            @click="showEditAddressDia(scope.row)"
            size="medium"
            :plain="true"
            type="primary"
            icon="el-icon-edit"
            circle
          >
          </el-button>
          <el-button
            @click="showProgressBox()"
            type="success"
            size="medium"
            icon="el-icon-location"
            plain
            circle
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[5, 10, 15, 20, 30]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>

    <!-- 修改订单地址的对话框 -->
    <el-dialog title="修改订单地址" :visible.sync="dialogFormVisibleEdit">
      <el-form :model="addressForm" label-position="top">
        <el-form-item label="省市区" required label-width="100px">
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
            :options="provinceCityList"
            :props="defaultProps"
            :show-all-levels="false"
            clearable
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" label-width="100px">
          <el-input
            v-model="addressForm.address2"
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleEdit = false">取 消</el-button>
        <el-button type="primary" @click="editAddress()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 物流进度的对话框（时间轴） -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(item, i) in progressInfo"
          :key="i"
          :timestamp="item.time"
        >
          {{ item.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </el-card>
</template>

<script>
// 导入省市区数据 js 文件
import ProvinceCityData from "@/assets/citydata.js";
// .vue 文件 引入 .js 库（swiper.js/zepto.js/iscroll.js/wow.js）

export default {
  created() {
    this.getOrderList();
  },
  data() {
    return {
      orderList: [],
      query: "",
      // 分页
      total: -1,
      pagenum: 1,
      pagesize: 10,
      // 对话框
      dialogFormVisibleEdit: false,
      // 表单数据
      addressForm: {
        address1: [], // 就是 selectedOptions 中存储的省市区数据
        address2: "",
      },
      // 级联选择器的数据
      selectedOptions: [],
      provinceCityList: [],
      defaultProps: {
        expandTrigger: "hover",
        // checkStrictly: true,
        label: "label",
        value: "value",
        children: "children",
      },
      // 物流进度条的数据
      progressVisible: false,
      //物流信息列表
      progressInfo: [],
    };
  },
  methods: {
    // 展示物流进度
    async showProgressBox() {
      /* 
        
        API 提供的接口无法使用，导致 node.js 写的后台服务出错并挂掉
        请求路径：/kuaidi/:id
        请求方法：get
        供测试的物流单号：1106975712662 

      */

      // const res = await this.$http.get("/kuaidi/1106975712662");

      // 此处使用虚拟数据
      // 模拟 获取物流信息成功 的场景
      const res = {
        data: [
          {
            time: "2018-05-10 09:39:00",
            ftime: "2018-05-10 09:39:00",
            context: "已签收,感谢使用顺丰,期待再次为您服务",
            location: "",
          },
          {
            time: "2018-05-10 08:23:00",
            ftime: "2018-05-10 08:23:00",
            context:
              "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
            location: "",
          },
          {
            time: "2018-05-10 07:32:00",
            ftime: "2018-05-10 07:32:00",
            context: "快件到达 [北京海淀育新小区营业点]",
            location: "",
          },
          {
            time: "2018-05-10 02:03:00",
            ftime: "2018-05-10 02:03:00",
            context:
              "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
            location: "",
          },
          {
            time: "2018-05-09 23:05:00",
            ftime: "2018-05-09 23:05:00",
            context: "快件到达 [北京顺义集散中心]",
            location: "",
          },
          {
            time: "2018-05-09 21:21:00",
            ftime: "2018-05-09 21:21:00",
            context: "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
            location: "",
          },
          {
            time: "2018-05-09 13:07:00",
            ftime: "2018-05-09 13:07:00",
            context: "顺丰速运 已收取快件",
            location: "",
          },
          {
            time: "2018-05-09 12:25:03",
            ftime: "2018-05-09 12:25:03",
            context: "卖家发货",
            location: "",
          },
          {
            time: "2018-05-09 12:22:24",
            ftime: "2018-05-09 12:22:24",
            context: "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
            location: "",
          },
          {
            time: "2018-05-08 21:36:04",
            ftime: "2018-05-08 21:36:04",
            context: "商品已经下单",
            location: "",
          },
        ],
        meta: { status: 200, message: "获取物流信息成功！" },
      };

      // 模拟 获取物流信息失败 的场景
      /* const res = {
        data: [],
        meta: { status: 400, message: "获取物流信息失败！" },
      }; */

      const {
        data,
        meta: { status, message },
      } = res;

      if (status != 200) {
        return this.$message.error(message);
      }

      this.progressInfo = data;
      this.progressVisible = true;
    },
    // 修改地址(由于 API 文档并未提供相关接口，功能未实现)
    async editAddress(order) {},
    showEditAddressDia(order) {
      // 加载 级联选择器 的省市区数据
      this.loadProvinceCityData();

      // 显示 修改订单地址 对话框
      this.dialogFormVisibleEdit = true;
    },
    // 加载 级联选择器 的省市区数据
    loadProvinceCityData() {
      this.provinceCityList = ProvinceCityData;
    },
    loadOrderList() {
      this.getOrderList();
    },
    // 搜索订单 (由于查询接口并未实现 query 查询，因此无法根据不同查询条件进行筛选)
    searchOrders() {
      // 每次查询之前，把页码设置为 1
      this.pagenum = 1;
      this.getOrderList();
    },
    // 分页
    handleSizeChange(val) {
      // 每页显示条数变化时 触发
      // console.log(`每页 ${val} 条`);
      this.pagesize = val;
      this.pagenum = 1;
      this.getOrderList();
    },
    handleCurrentChange(val) {
      // 当前页码改变时 触发
      // console.log(`当前页: ${val}`);
      this.pagenum = val;
      this.getOrderList();
    },
    async getOrderList() {
      const res = await this.$http.get(
        `orders?query=${this.query}&pagenum=${this.pagenum}&pagesize=${this.pagesize}`
      );
      // console.log(res);

      // 对象解构赋值
      const {
        data: { total, goods },
        meta: { msg, status },
      } = res.data;

      if (status == 200) {
        this.orderList = goods;
        this.total = total;

        // 提示获取订单列表成功
        // this.$message.success(msg);
      } else {
        // 提示获取订单列表失败
        this.$message.error(msg);
      }
    },
  },
};
</script>
</script>
<style>
.searchRow {
  margin-top: 20px;
}

.inputSearch {
  width: 400px;
}

.ordersTable {
  width: 100%;
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
}
</style>