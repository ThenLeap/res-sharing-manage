<template>
  <div>
    <!--面包屑区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/document/check">用户管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>待审核文档列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <!--搜索与添加区域-->
      <el-row :gutter="20">
        <el-col :span="9">
          <el-input placeholder="请输入文档标题" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <p>待审核文档列表如下：</p>
        </el-col>
      </el-row>

      <!--数据渲染区域-->
      <el-table :data="userList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="标题" prop="title"></el-table-column>
        <el-table-column label="作者" prop="author"></el-table-column>

        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="进行审核" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini"
                         @click="showEditDialog(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeById(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!--文件预览对话框-->
      <el-dialog
        title="正在审核此文档..."
        :visible.sync="editDialogVisible"
        width="70%">
        <!--1、word、excel、ppt 使用 iframe 简单预览-->
        <div v-if="!isShow" style="width: 100%; height: 100vh">
          <iframe
            :src="iframeSrc"
            width="100%"
            height="100%"
            frameborder="1"
          ></iframe>
        </div>
        <!-- 2、pdf 使用 pdf.js  -->
        <div v-if="isShow" style="width: 100%; height: 60vh">
          <!--<iframe-->
          <!--  :src="iframeSrc"-->
          <!--  width="100%"-->
          <!--  height="100%"-->
          <!--  frameborder="1"-->
          <!--&gt;</iframe>-->
          <object :data="currentDocumentUrl" type="application/pdf" width="100%" height="500px">
            <p>It appears your web browser doesn't support iframes.</p>
          </object>
        </div>
        <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="passDocument">完成审核</el-button>
      </span>
      </el-dialog>


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
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      userList: [],
      total: 0,
      // 已选中的角色Id值
      currentDocumentId: 0,
      isShow: '',
      currentDocumentUrl:'',
      // 修改用户时对话框是否显示
      editDialogVisible: false,
    }
  },
  created () {
    this.getUserList()
  },
  computed: {
    iframeSrc() {
      return 'http://view.officeapps.live.com/op/view.aspx?src=' + this.currentDocumentUrl;
    },
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('/check/document', {
        params: this.queryInfo
      })
      if (res.code !== 200) return this.$message.error('获取文档列表失败！')
      this.userList = res.data[1].list
      this.total = Number(res.data[0].total)
      // console.log(this.userList)
    },
    async showEditDialog (item) {
      this.editDialogVisible = true
      this.currentDocumentUrl = item.documentUrl
      this.currentDocumentId = item.id
      this.isShow = this.judgePdfType(item.documentUrl)
    },
    // 监听pagesize改变的时间
    handleSizeChange (pagesize) {
      this.queryInfo.pagesize = pagesize
      this.getUserList()
    },
    // 监听pagenum改变的事件
    handleCurrentChange (pagenum) {
      this.queryInfo.pagenum = pagenum
      this.getUserList()
    },
    // 根据id删除对应用户信息
    async removeById (id) {
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
      const { data: res } = await this.$http.delete('/check/document/' + id)
      console.log(res)
      if (res.code !== 200) {
        return this.$message.error('删除失败！')
      }
      this.$message.success('删除成功！')
      await this.getUserList()
    },

    async passDocument(){
      const { data: res } = await this.$http.get(`/check/document/${this.currentDocumentId}`)
      if (res.code !== 200) {
        return this.$message.error('审核失败！')
      }
      this.$message.success('审核成功！')
      this.editDialogVisible = false
      await this.getUserList()
    },

    judgePdfType(url)  {
      // 使用正则表达式来匹配URL中的文件名和扩展名
      const regex = /[^\/]+$/
      const match = url.match(regex)
      if (match) {
        // 获取文件名
        const filename = match[0]
        // 用点号分割文件名，取最后一部分作为扩展名
        const extension = filename.split('.').pop().toLowerCase()
        return extension === 'pdf';
      }
    }
  }
}
</script>

<style lang="less" scoped>
.my-pagination {
  margin-top: 15px !important;
  float: left !important;
}
</style>
