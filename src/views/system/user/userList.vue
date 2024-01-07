<template>
  <el-container :style="{ height: containerHeight + 'px' }">
    <!-- 右侧用户数据 -->
    <!-- 表格数据 -->
    <el-main>
      <el-form ref="searchForm" :model="searchModel" label-width="80px" size="small" :inline="true">
        <el-form-item>
          <el-input v-model="searchModel.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="searchModel.realName" placeholder="请输入真实姓名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="searchModel.phone" placeholder="请输入电话"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button icon="el-icon-search" type="primary"
                     @click="search()"
          >查询
          </el-button>
          <el-button icon="el-icon-delete" @click="resetValue()">重置</el-button>
          <el-button icon="el-icon-plus" size="small" type="success"
                     @click="openAddWindow()"
                     v-if="hasPermission('sys:user:add')"
          >新增
          </el-button>
        </el-form-item>
      </el-form>
      <!-- 用户表格数据 -->

      <el-table
        :height="tableHeight"
        :data="userList"
        border
        stripe
        style="width: 100%; margin-bottom: 10px"
      > <el-table-column
        label="序号"
        width="70"
        align="center"
      >
        <template slot-scope="scope">
          {{ (pageNo - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="realName" label="姓名"></el-table-column>
        <el-table-column prop="phone" label="电话"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column align="center" width="290" label="操作">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" type="primary"
                       size="mini" @click="handleEdit(scope.row)"

            >编辑
            </el-button>
            <el-button icon="el-icon-delete" type="danger"
                       size="mini" @click="handleDelete(scope.row)"

            >删除
            </el-button>
            <el-button icon="el-icon-setting" type="primary"
                       size="mini" @click="assignRole(scope.row)"
                       v-if="hasPermission('sys:user:add')"
            >分配角色
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页工具栏 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pageNo"
        :page-sizes="[10, 20, 30, 40, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!-- 添加和编辑用户窗口 -->
      <system-dialog
        :title="userDialog.title"
        :height="userDialog.height"
        :width="userDialog.width"
        :visible="userDialog.visible"
        @onClose="onUserClose"
        @onConfirm="onUserConfirm"
      >
        <div slot="content">
          <el-form
            :model="user"
            ref="userForm"
            :rules="rules"
            label-width="80px"
            :inline="true"
            size="small"
          >
            <el-form-item prop="username" label="用户名">
              <el-input v-model="user.username"></el-input>
            </el-form-item>
            <el-form-item prop="password" v-if="user.id === ''" label="密码">
              <el-input type="password" v-model="user.password"></el-input>
            </el-form-item>
            <el-form-item prop="realName" label="姓名">
              <el-input v-model="user.realName"></el-input>
            </el-form-item>
            <el-form-item prop="phone" label="电话">
              <el-input v-model="user.phone"></el-input>
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="user.nickName"></el-input>
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="user.email"></el-input>
            </el-form-item>
            <el-form-item prop="gender" label="性别">
              <el-radio-group v-model="user.gender">
                <el-radio :label="0">男</el-radio>
                <el-radio :label="1">女</el-radio>
              </el-radio-group>
            </el-form-item>
            <br>
            <!-- 用户头像 -->
            <el-form-item label="头像">
              <el-upload
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
                class="avatar-uploader"
                :data="uploadHeader"
                action="/api/eduOss/fileOss?module=avatar"
              >
                <img v-if="user.avatar" :src="user.avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon"/>
              </el-upload>
            </el-form-item>
          </el-form>
        </div>
      </system-dialog>
      <!-- 分配角色窗口 -->
      <system-dialog
        :title="assignDialog.title"
        :height="assignDialog.height"
        :width="assignDialog.width"
        :visible="assignDialog.visible"
        @onClose="onAssignClose"
        @onConfirm="onAssignConfirm"
      >
        <div slot="content">
          <!-- 分配角色数据列表 -->
          <el-table
            ref="assignRoleTable"
            :data="assignRoleList"
            border
            stripe
            :height="assignHeight"
            style="width: 100%; margin-bottom: 10px"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              width="55"
              align="center"
            ></el-table-column>
            <el-table-column prop="roleCode" label="角色编码"/>
            <el-table-column prop="roleName" label="角色名称"/>
            <el-table-column prop="remark" label="角色备注"/>
          </el-table>
          <!-- 分页工具栏 -->
          <el-pagination
            @size-change="assignSizeChange"
            @current-change="assignCurrentChange"
            :current-page.sync="roleVo.pageNo"
            :page-sizes="[10, 20, 30, 40, 50]"
            :page-size="roleVo.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="roleVo.total"
            background
          >
          </el-pagination>
        </div>
      </system-dialog>
    </el-main>
  </el-container>

</template>

<script>
import {
  addUser,
  deleteUser,
  getAssignRoleList,
  getRoleIdByUserId,
  getUserList,
  saveUserRole,
  updateUser
} from '@/api/user'
import systemDialog from '@/components/System/SystemDialog'
//导入token
import { getToken } from '@/utils/auth'
import objCopy from '@/utils/objCopy'
import hasPermission from '@/permission/index'


export default {
  name: 'userList',
  components: {
    systemDialog
  },
  data() {
    //自定义验证规则
    let validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入手机号码'))
        //使用正则表达式进行验证手机号码
      } else if (!/^1[3456789]\d{9}$/.test(value)) {
        callback(new Error('手机号格式不正确'))
      } else {
        callback()
      }
    }

    return {
      //上传需要携带的数据
      uploadHeader: { 'token': getToken() },
      containerHeight: 0,
      //部门列表
      deptList: [],
      defaultProps: {
        children: 'children',
        label: 'departmentName'
      },
      //查询表单
      searchModel: {
        username: '',
        realName: '',
        phone: '',
        departmentId: '',
        pageNo: 1,
        pageSize: 10
      },
      //表格高度
      tableHeight: 0,
      //用户表格数据
      userList: [],
      //分页----------
      total: 0,
      pageNo: 1,
      pageSize: 10,
      //新增修改弹窗----------
      userDialog: {
        title: '',
        height: 410,
        width: 610,
        visible: false
      },
      //所属部门弹窗----------
      departmentDialog: {
        height: 400,
        title: '所属部门',
        visible: false,//是否显示
        width: 300
      },
      //
      departmentTreeData: [],
      //新增修改用户表单数据
      user: {
        id: '',
        email: '',
        realName: '',
        phone: '',
        nickName: '',
        password: '',
        username: '',
        gender: '',
        avatar: ''
      },
      //新增修改表单验证规则
      rules: {
        realName: [{ required: true, trigger: 'blur', message: '请填写姓名' }],
        phone: [{ trigger: 'blur', validator: validatePhone }],
        username: [{ required: true, trigger: 'blur', message: '请填写登录名' }],
        password: [{ required: true, trigger: 'blur', message: '请填写登录密码' }],
        gender: [{ required: true, trigger: 'change', message: '请选择性别' }]
      },
      //分配角色窗口属性
      assignDialog: {
        title: '',
        visible: false,
        width: 800,
        height: 410
      },
      //角色对象
      roleVo: {
        pageNo: 1,
        pageSize: 10,
        userId: '',
        total: 0
      },
      assignRoleList: [], //角色列表
      assignHeight: 0, //分配角色表格高度
      selectedIds: [], //被选中的角色id
      selectedUserId: '' //被分配角色的用户ID
    }
  },
  methods: {
    /**
     * 查询用户数据列表
     */ async search() {
      console.log(2222222222)
      debugger;
      let result = await getUserList(this.searchModel)
      console.log(result.data)
      const { success, data } = result.data
      if (success) {
        //表格数据
        // console.log(data)
        this.userList = data.records
        // console.log(data.records)
        this.total = data.total
      }
    },

    /**
     * 打开新增修改窗口
     */
    openAddWindow() {

      //清除数据
      this.$resetForm('userForm', this.user)
      this.userDialog.title = '新增用户'
      this.userDialog.visible = true
    },
    /**
     * 重置搜素
     * @returns {Promise<void>}
     */
    resetValue() {
      this.searchModel.phone = ''
      this.searchModel.pageNo = 1
      this.searchModel.pageSize = 10
      this.searchModel.realName = ''
      this.searchModel.username = ''
      this.searchModel.departmentId = ''
      this.search()
    },
    /**
     * 左侧树节点点击事件
     */
    handleNodeClick(data) {
      this.searchModel.departmentId = data.id
      this.search()
    },
    //加减号图标点击事件
    openBtn(data) {
      //修改折叠展开状态
      data.open = !data.open
      this.$refs.leftTree.store.nodesMap[data.id].expanded = !data.open
    },
    /**
     * 编辑
     */
    handleEdit(row) {
      //数据回显
      objCopy(row, this.user)
      this.userDialog.visible = true
    },

    /**
     * 删除
     */ async handleDelete(row) {
      let confirm = await this.$myconfirm('确定要删除该数据吗?')
      if (confirm) {
        let result = await deleteUser(row.id)
        const { success, msg } = result.data
        if (success) {
          //提示消息
          this.$message.success(msg)
          //刷新
          await this.search()
        } else {
          this.$message.error(msg)
        }
      }
    },
    /**
     * 分配角色
     * @param row
     */ async assignRole(row) {
      //清空选中角色数组
      this.selectedIds=[];
      this.assignDialog.title = `给【${row.realName}】分配角色`
      this.assignDialog.visible = true
      //获取当前登录用户的所有角色
      await this.getAssignRoleList();
      //获取当前分配角色已拥有的角色
      await this.getUserAssignRoleIds(row.id);
      this.selectedUserId=row.id
      console.log(this.selectedIds,this.assignRoleList)
      this.selectedIds.forEach((key) => {
        this.assignRoleList.forEach((item) => {
          console.log(5555555555)
          //当被选中角色id和当前遍历到的角色id相同
          if (key === item.id) {
            //勾选
            this.$refs.assignRoleTable.toggleRowSelection(item, true);
          }
        })
      })
    },
    /**
     * 获取当前登录用户的所有角色信息
     * @returns {Promise<void>}
     */
    async getAssignRoleList(pageNo = 1, pageSize = 10) {
      //构造查询参数
      this.roleVo.userId=this.$store.getters.userId;
      this.roleVo.pageNo=pageNo;
      this.roleVo.pageSize=pageSize;
      let result = await getAssignRoleList(this.roleVo);
      console.log(result.data)
      const {success,data} = result.data;
      if (success) {
        this.assignRoleList=data.records;
        this.roleVo.total=data.total;
      }
    },

    /**
     * 获取用户已拥有的角色id
     * @param userId
     */
    async getUserAssignRoleIds(userId){
      let result=await getRoleIdByUserId(userId);
      console.log("角色",result.data)
      const {success,data}=result.data;
      if (success) {
        //赋值被选中的角色id
        this.selectedIds=data;
      }
    },
    handleCurrentChange(pageNo) {
      this.pageNo = pageNo
      this.searchModel.pageNo = pageNo
      this.search()
    },
    handleSizeChange(pageSize) {
      this.pageSize = pageSize
      this.searchModel.pageSize = pageSize
      this.search()
    },
    /**
     * 取消新增修改弹窗
     */
    onUserClose() {
      this.userDialog.visible = false
    },

    /**
     * 确认弹窗
     */
    onUserConfirm() {
      this.$refs.userForm.validate(async valid => {
        let result
        if (valid) {
          //验证成功
          if (this.user.id === '') {
            //新增
            result = await addUser(this.user)
          } else {
            //todo 修改
            result = await updateUser(this.user)
          }
          const { success, msg } = result.data
          if (success) {
            this.$message.success(msg)
            //刷新列表
            await this.search()
          } else {
            this.$message.error(msg)
          }
          //关闭窗口
          this.userDialog.visible = false
        }
      })
    },
    /**
     * 上传成功回调
     * @param res
     * @param file
     */
    handleAvatarSuccess(res, file) {
      this.user.avatar = res.data.url
      // 强制重新渲染
      this.$forceUpdate()
    },
    /**
     * 上传校验
     * @param file
     * @returns {boolean}
     */
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    /* 分配角色取消事件
    */
    onAssignClose() {
      //隐藏窗口
      this.assignDialog.visible = false
    },
    /**
     * 分配角色确认事件
     */ async onAssignConfirm() {
      let confirm=true;
      if (this.selectedIds.length===0){
        confirm = await this.$myconfirm('当前用户还未分配角色,是否继续?', 'warning')
      }
      let params={
        userId: this.selectedUserId,
        roleIds: this.selectedIds
      }
      if (confirm) {
        let result=await saveUserRole(params);
        console.log("確認",result.data)
        const {msg,success}=result.data
        if (success) {

          this.$message.success(msg)
        }else {
          this.$message.error(msg);
        }
        //隐藏窗口
        this.assignDialog.visible = false
      }
    },
    /**
     * 当每页数量发生变化时触发该事件
     */
    assignSizeChange(size) {
      this.roleVo.pageSize = size //将每页显示的数量交给成员变量
      this.getAssignRoleList(this.roleVo.pageNo, size)
    },
    /**
     * 当页码发生变化时触发该事件
     * @param page
     */
    assignCurrentChange(page) {
      this.roleVo.pageNo = page
      //调用查询方法
      this.getAssignRoleList(page, this.roleVo.pageSize)
    },
    /**
     * 当点击多选框时触发该事件
     */
    handleSelectionChange(rows) {
      let roleIds = []
      //循环遍历选中的角色ID
      for (let i = 0; i < rows.length; i++) {
        //将当前选中的角色ID放到数组中
        roleIds.push(rows[i].id)
      }
      //将选中的角色ID交给成员变量
      this.selectedIds = roleIds
      // this.selectedIds = rows.map(item => item.id);//等同于上述代码
    }
  },
  created() {
    this.search()
  },
  mounted() {
    this.$nextTick(() => {
      //内容高度
      this.containerHeight = window.innerHeight - 85
      //表格高度
      this.tableHeight = window.innerHeight - 220
      //角色表格高度
      this.assignHeight = window.innerHeight - 350

    })
  }
}
</script>
<style lang="scss">
::v-deep .el-tree {
  .el-tree-node {
    position: relative;
    padding-left: 10px;
  }

  .el-tree-node__children {
    padding-left: 20px;
  }

  .el-tree-node :last-child:before {
    height: 40px;
  }

  .el-tree > .el-tree-node:before {
    border-left: none;
  }

  .el-tree > .el-tree-node:after {
    border-top: none;
  }

  .el-tree-node:before,
  .el-tree-node:after {
    content: "";
    left: -4px;
    position: absolute;
    right: auto;
    border-width: 1px;
  }

  .tree :first-child .el-tree-node:before {
    border-left: none;
  }

  .el-tree-node:before {
    border-left: 1px dotted #d9d9d9;
    bottom: 0px;
    height: 100%;
    top: -25px;
    width: 1px;
  }

  .el-tree-node:after {
    border-top: 1px dotted #d9d9d9;
    height: 20px;
    top: 14px;
    width: 24px;
  }

  .el-tree-node__expand-icon.is-leaf {
    width: 8px;
  }

  .el-tree-node__content > .el-tree-node__expand-icon {
    display: none;
  }

  .el-tree-node__content {
    line-height: 30px;
    height: 30px;
    padding-left: 10px !important;
  }
}

::v-deep .el-tree > div {
  &::before {
    display: none;
  }

  &::after {
    display: none;
  }
}

//用户头像
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9 !important;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader .avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar-uploader img {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
