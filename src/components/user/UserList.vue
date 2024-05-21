<template>
  <div>
    <!--面包屑区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/user">用户管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <!--搜索与添加区域-->
      <el-row :gutter="20">
        <el-col :span="9">
          <el-input placeholder="请输入姓名" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">注册用户</el-button>
        </el-col>
      </el-row>

      <!--数据渲染区域-->
      <el-table :data="userList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>

        <!--渲染开关-->
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              @change="userStateChange(scope.row)"
              :value="scope.row.status===1?true:false"
              active-color="#13ce66"
              inactive-color="#eaedf1">
            </el-switch>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
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

    <!--添加用户-对话框-->
    <el-dialog
      @close="addDialogClosed"
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
<el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="addForm.confirmPassword"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改用户信息的对话框-->
    <el-dialog
      @close="editDialogClosed"
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="用户名">
          <el-input :value="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户：{{ userInfo.username }}</p>
        <p>当前的角色：{{ userInfo.role_name }}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 自定义校验规则
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }

    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      // const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      const regMobile = /^(13\d|14[5-9]|15[0-3,5-9]|16[6]|17[0-8]|18\d|19[1,8,9])\d{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }

    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      userList: [],
      total: 0,
      // 添加用户时对话框是否显示
      addDialogVisible: false,
      // 修改用户时对话框是否显示
      editDialogVisible: false,
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 已选中的角色Id值
      selectedRoleId: '',
      // 添加用户表单数据
      addForm: {
        username: '',
        password: '',
        confirmPassword: '',
      },
      // 编辑用户表单
      editForm: {
        nickname: '',
        email: '',
        mobile: ''
      },
      // 校验规则
      addFormRules: {
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 10,
            message: '密码的长度在6~10个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '请输入email',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      },
      editFormRules: {
        email: [
          {
            required: true,
            message: '请输入email',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('/sys/user/list', {
        params: this.queryInfo
      })
      if (res.code !== 200) return this.$message.error('获取用户列表失败！')
      this.userList = res.data[1].list
      this.total = Number(res.data[0].total)
      // console.log(this.total)
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
    // 监听switch开关状态，在数据库做出修改
    async userStateChange (userInfo) {
      console.log(userInfo)
      const { data: res } = await this.$http.put(`/sys/user/${userInfo.id}/state/${userInfo.status}`)
      if (res.code !== 200) {
        return this.$message.error('更新用户状态失败！')
      }
      this.$message.success('更新用户状态成功！')
      this.$router.go(0)
    },
    // 重置对话框表单
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        // 表单预校验，防止用户提交不符合规则的数据，减少数据库压力
        if (!valid) return
        // 验证通过
        const { data: res } = await this.$http.post('/sys/register/local', this.addForm)
        if (res.code !== 200) {
          this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功！')
        this.addDialogVisible = false
        await this.getUserList()
      })
    },
    // 修改用户信息时，先展示对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('/sys/user/' + id)
      if (res.code !== 200) {
        return this.$message.error('查询用户信息失败！')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 编辑用户信息
    editUser () {
      this.$refs.editFormRef.validate(async valid => {
        // 表单预校验，防止用户提交不符合规则的数据，减少数据库压力
        if (!valid) return
        // 验证通过
        const { data: res } = await this.$http.put(
          '/sys/user/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        console.log(res)
        if (res.code !== 200) {
          return this.$message.error('修改用户失败！')
        }
        this.$message.success('修改用户成功！')
        this.editDialogVisible = false
        await this.getUserList()
      })
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
      const { data: res } = await this.$http.delete('/sys/user/' + id)
      console.log(res)
      if (res.code !== 200) {
        return this.$message.error('删除失败！')
      }
      this.$message.success('删除成功！')
      await this.getUserList()
    },
    // 展示分配角色的对话框
    async setRole (userInfo) {
      this.userInfo = userInfo

      // 在展示对话框之前，获取所有角色的列表
      const { data: res } = await this.$http.get('roles')
      if (res.code !== 200) {
        return this.$message.error('获取角色列表失败！')
      }

      this.rolesList = res.data

      this.setRoleDialogVisible = true
    },
    // 点击按钮分配角色
    async saveRoleInfo () {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色！')
      }

      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      )

      if (res.code !== 200) {
        return this.$message.error('更新角色失败！')
      }

      this.$message.success('更新角色成功！')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed () {
      this.selectedRoleId = ''
      this.userInfo = {}
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
