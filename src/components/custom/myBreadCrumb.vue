<template>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <!-- <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item> -->
      <el-breadcrumb-item>首页</el-breadcrumb-item>
      <el-breadcrumb-item>{{level1}}</el-breadcrumb-item>
      <el-breadcrumb-item>{{level2}}</el-breadcrumb-item>
    </el-breadcrumb>
</template>

<script>
export default {
    name: 'my-breadcrumb',
    data() {
        return {
            // level1: '',
            // level2: '' 
        }
    },
    /* 
        props 的值是字符串数组，用法和 data() 一样
        props 中的数据的值来源于使用组件所传递的值
        props 中的数据也是该组件的属性 <child-a :msg='abc'> 
    */
    props: ['level1', 'level2']
}
</script>