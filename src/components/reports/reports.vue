<template>
  <!-- 卡片小容器 -->
  <el-card>
    <!-- 使用全局自定义组件：面包屑组件 -->
    <my-breadcrumb level1="数据统计" level2="数据报表"></my-breadcrumb>

    <el-select
      @change="handleChartChange"
      v-model="selectedValue"
      placeholder="请选择"
      class="selectStyle"
    >
      <el-option
        v-for="item in chartList"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      >
      </el-option>
    </el-select>

    <!-- 提供展示 echarts 图表的 div 容器 -->
    <div id="reportDiv" class="report"></div>
  </el-card>
</template>

<script>
// 引入 第三方依赖（插件）数据可视化图表 echarts
var ECharts = require("echarts");

export default {
  data() {
    return {
      chartList: [
        {
          value: "1",
          label: "柱状图(测试demo1)",
        },
        {
          value: "2",
          label: "柱状图(测试demo2)",
        },
        {
          value: "3",
          label: "堆叠区域图(动态数据)",
        },
        {
          value: "4",
          label: "堆叠折线图(动态数据)",
        },
      ],
      selectedValue: "3", // 默认选中 堆叠区域图(动态数据)
    };
  },
  // 当 DOM 加载完毕再执行，否则找不到 div 标签
  mounted() {
    let myChart = this.getEchartObj();
    this.useEchart(myChart, this.selectedValue);
  },
  methods: {
    // 选中值发生变化时触发 @change 事件
    // 回调参数：selectedVal  目前的选中值
    handleChartChange(selectedVal) {
      let myChart = this.getEchartObj();

      // 清空图表内容，清空后实例可用
      myChart.clear();

      // 重新绘制图表内容
      this.useEchart(myChart, selectedVal);
    },
    getEchartObj() {
      var chartDom = document.getElementById("reportDiv");
      var myChart = ECharts.init(chartDom);
      return myChart;
    },
    useEchart(chart, selectedVal) {
      let myChart = this.getEchartObj();
      let option = {};

      // 非异步方法
      if (selectedVal == "1" || selectedVal == "2") {
        if (selectedVal == "1") {
          // 测试 1：
          // 显示柱状图（测试demo1）
          option = this.getOptionForBarChart();
        } else {
          // 测试 2：
          // 显示柱状图（测试demo2）
          option = this.getOptionForBarChart2();
        }

        // 使用指定的配置项和数据显示图表
        myChart.setOption(option);
      }  // 异步方法
      else if (selectedVal == "3" || selectedVal == "4") {
        if (selectedVal == "3") {
          // 测试 3：
          // 显示堆叠区域图

          // this.getOptionForStackedAreaChart() 返回的是异步 Promise 对象
          // 回调函数 then 返回的 res 值就是 Promise 对象的 [[PromiseValue]]
          this.getOptionForStackedAreaChart().then((res) => {
            option = res;

            // 使用指定的配置项和数据显示图表
            myChart.setOption(option);
          });
        } else {
          // 测试 4：
          // 显示堆叠折线图

          // this.getOptionForStackedLineChart() 返回的是异步 Promise 对象
          // 回调函数 then 返回的 res 值就是 Promise 对象的 [[PromiseValue]]
          this.getOptionForStackedLineChart().then((res) => {
            option = res;

            // 使用指定的配置项和数据显示图表
            myChart.setOption(option);
          });
        }
      }
    },
    // 获取 堆叠折线图 option（动态数据配置 + 静态数据配置）
    async getOptionForStackedLineChart() {
      // 调用公共方法：获取图表数据（基于类型统计的堆叠折线图）
      const res = await this.getChartSource(1);

      // 动态数据项（来源于数据库返回的数据）
      const {
        data,
        meta: { msg, status },
      } = res.data;

      let option1 = {};
      let optionObj = {};
      let removedAreaStyleSeriesArr = [];
      if (status == 200) {
        optionObj = data;

        // 重组数组，去除 areaStyle 属性（否则效果和堆叠区域图一样）
        removedAreaStyleSeriesArr = optionObj.series.map((item) => {
          return {
            name: item.name,
            type: item.type,
            stack: item.stack,
            data: item.data,
          };
        });

        option1 = {
          legend: optionObj.legend,
          xAxis: optionObj.xAxis[0],
          yAxis: optionObj.yAxis[0],
          series: removedAreaStyleSeriesArr,
        };
      } else {
        this.$message.error(msg);
      }

      // 静态数据项（设定图表的配置）
      let option2 = {
        title: {
          text: "堆叠折线图",
        },
        tooltip: {
          trigger: "axis",
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
      };

      // ES6 展开运算符  ...数组或对象
      let option = { ...option1, ...option2 };

      return option;
    },
    // 获取 堆叠区域图 option（动态数据配置 + 静态数据配置）
    async getOptionForStackedAreaChart() {
      // 调用公共方法：获取图表数据（基于类型统计的堆叠区域图）
      const res = await this.getChartSource(1);

      //   console.log(res);

      // 动态数据项（来源于数据库返回的数据）
      const {
        data,
        meta: { msg, status },
      } = res.data;

      let option1 = [];
      if (status == 200) {
        option1 = data;
      } else {
        this.$message.error(msg);
      }

      // 静态数据项（设定图表的配置）
      let option2 = {
        title: {
          text: "堆叠区域图",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985",
            },
          },
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
      };

      // ES6 展开运算符  ...数组或对象
      let option = { ...option1, ...option2 };

      return option;
    },
    async getChartSource(type) {
      let res = {};

      // 基于 类型 统计的报表数据
      if (type == 1) {
        // 获取图表数据（基于类型统计，可做 堆叠区域图 或 堆叠折线图）
        res = await this.$http.get(`reports/type/1`); // 类型
        // console.log("type 1");
      } // 基于 时间 统计的报表数据
      else if (type == 2) {
        // 获取图表数据（基于时间统计）
        res = await this.$http.get(`reports/type/2`); // 时间
        // console.log("type 2");
      }
      //   console.log(res);
      return res;
    },
    // 获取 柱状图 option（测试demo2）
    getOptionForBarChart2() {
      let option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        legend: {},
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            data: [
              "2017-12-24",
              "2017-12-25",
              "2017-12-26",
              "2017-12-27",
              "2017-12-28",
              "2017-12-29",
              "2017-12-30",
            ],
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
        series: [
          {
            name: "首页",
            type: "bar",
            emphasis: {
              focus: "series",
            },
            data: [2320, 1332, 3301, 2334, 1390, 3230, 2320],
          },
          {
            name: "分类",
            type: "bar",
            stack: "Ad",
            emphasis: {
              focus: "series",
            },
            data: [2120, 1832, 2101, 3134, 2990, 2530, 2210],
          },
          {
            name: "商品列表",
            type: "bar",
            stack: "Ad",
            emphasis: {
              focus: "series",
            },
            data: [2620, 1982, 2191, 3234, 2290, 3330, 3510],
          },
          {
            name: "商品详情",
            type: "bar",
            stack: "Ad",
            emphasis: {
              focus: "series",
            },
            data: [2150, 2432, 3201, 2154, 3190, 3430, 2410],
          },
        ],
      };

      return option;
    },
    // 获取 柱状图 option（测试demo1）
    getOptionForBarChart() {
      let option = {
        title: {
          text: "柱状图",
        },
        tooltip: {},
        legend: {
          data: ["销量"],
        },
        xAxis: {
          data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
        },
        yAxis: {},
        series: [
          {
            name: "销量",
            type: "bar",
            data: [120, 132, 101, 134, 90, 230],
          },
        ],
      };
      return option;
    },
  },
};
</script>

<style>
.selectStyle {
  margin-top: 20px;
}

.report {
  margin-top: 40px;
  width: 900px;
  height: 700px;
}
</style>