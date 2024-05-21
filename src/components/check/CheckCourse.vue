<template>
  <div>
    <!--面包屑区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/course/check">课程管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>待审核课程列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <!--搜索与添加区域-->
      <el-row :gutter="20">
        <el-col :span="9">
          <el-input placeholder="请输入课程名" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <p>待审核课程列表如下：</p>
        </el-col>
      </el-row>

      <!--数据渲染区域-->
      <el-table :data="userList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="课程名" prop="courseName"></el-table-column>
        <el-table-column label="讲师" prop="lecturer"></el-table-column>
        <el-table-column label="大学" prop="college"></el-table-column>
        <el-table-column label="称号" prop="sign"></el-table-column>

        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="进行审核" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini"
                         @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--分页导航区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        class="my-pagination">
      </el-pagination>
    </el-card>

  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      userList: [],
      total: 0,
      // 已选中的角色Id值
      selectedRoleId: '',
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const {data: res} = await this.$http.get('/check/course', {
        params: this.queryInfo
      })
      if (res.code !== 200) return this.$message.error('获取课程列表失败！')
      this.userList = res.data[1].list
      this.total = Number(res.data[0].total)
      // console.log(this.userList)
    },
    // 监听pagesize改变的时间
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getUserList()
    },
    // 监听pagenum改变的事件
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getUserList()
    },
    // 监听switch开关状态，在数据库做出修改
    async userStateChange(userInfo) {
      console.log(userInfo)
      const {data: res} = await this.$http.put(`/sys/user/${userInfo.id}/state/${userInfo.status}`)
      if (res.code !== 200) {
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
      this.$router.go(0)
    },
    // 根据id删除对应用户信息
    async removeById(id) {
      // 弹框询问是否删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户确认删除，则返回值为字符串confirm
      // 如果用户取消了删除，则返回值为字符串cancel
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除！')
      }
      const {data: res} = await this.$http.delete('/check/course/' + id)
      console.log(res)
      if (res.code !== 200) {
        return this.$message.error('删除失败！')
      }
      this.$message.success('删除成功！')
      await this.getUserList()
    },
  }
}
</script>

<style lang="less" scoped>
.my-pagination {
  margin-top: 15px !important;
  float: left !important;
}
</style>
