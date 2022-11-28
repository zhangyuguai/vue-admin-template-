<template>
  <el-main>
    <!-- 查询条件 -->
    <el-form
      :model="searchModel"
      ref="searchForm"
      label-width="80px"
      :inline="true"
      size="small"
    >
      <el-form-item>
        <el-input v-model="searchModel.roleName" placeholder="请输入角色名称"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
        <el-button icon="el-icon-refresh-right" @click="restTable">重置</el-button>
        <el-button type="success" icon="el-icon-plus" @click="openAddWindow">新增</el-button>
      </el-form-item>
    </el-form>
    <!-- 数据表格 -->
    <el-table
      :data="roleList"
      :height="tableHeight"
      border
      stripe
      style="width: 100%; margin-bottom: 10px"
    >
      <el-table-column
        prop="id"
        label="角色编号"
        width="100"
        align="center"
      ></el-table-column>
      <el-table-column prop="roleCode" label="角色编码"></el-table-column>
      <el-table-column prop="roleName" label="角色名称"></el-table-column>
      <el-table-column prop="remark" label="角色备注"></el-table-column>
      <el-table-column label="操作" align="center" width="290">
        <template slot-scope="scope">
          <el-button
            icon="el-icon-edit"
            type="primary"
            size="small"
            @click="handleEdit(scope.row)"
          >编辑
          </el-button
          >
          <el-button
            icon="el-icon-delete"
            type="danger"
            size="small"
            @click="handleDelete(scope.row)"
          >删除
          </el-button
          >
          <el-button
            icon="el-icon-setting"
            type="primary"
            size="small"
            @click="assignRole(scope.row)"
          >分配权限
          </el-button
          >
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
      :page-size="10"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
    <!-- 添加和修改角色窗口 -->
    <system-dialog
      :title="roleDialog.title"
      :visible="roleDialog.visible"
      :width="roleDialog.width"
      :height="roleDialog.height"
      @onClose="onClose"
      @onConfirm="onConfirm"
    >
      <div slot="content">
        <el-form
          :model="role"
          ref="roleForm"
          :rules="rules"
          label-width="80px"
          :inline="false"
          size="small"
        >
          <el-form-item label="角色编码" prop="roleCode">
            <el-input v-model="role.roleCode"></el-input>
          </el-form-item>
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="role.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input type="textarea" v-model="role.remark" :rows="5"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </system-dialog>

    <!--分配权限窗口-->
    <system-dialog
      :title="assignDialog.title"
      :visible="assignDialog.visible"
      :width="assignDialog.width"
      :height="assignDialog.height"
      @onClose="onAssignClose"
      @onConfirm="onAssignConfirm"
    >
      <div slot="content">
        <el-tree
          ref="assignTree"
          :data="assignTreeData"
          node-key="id"
          :props="defaultProps"
          empty-text="暂无数据"
          :default-checked-keys="defaultChecked"
          :show-checkbox="true"
          :highlight-current="true"
          default-expand-all
        ></el-tree>

      </div>
    </system-dialog>
  </el-main>
</template>

<script>
import { addRole, deleteRole, getPermissionTree, getRoleList, saveRolePermissions, updateRole } from '@/api/role'
import SystemDialog from '@/components/System/SystemDialog'

export default {
  name: 'roleList',
  components: {
    SystemDialog
  },
  data() {
    return {
      searchModel: {
        roleName: '',
        pageNo: 1,
        pageSize: 10,
        userId: this.$store.getters.userId
      },//搜索表单
      roleList: [],//数据表格
      tableHeight: 0,
      pageNo: 1,//页码
      total: 0,
      rules: {
        roleCode: [{ required: true, trigger: 'blur', message: '请输入角色编码' }],
        roleName: [{ required: true, trigger: 'blur', message: '请输入角色名称' }]
      },
      //添加和修改角色窗口属性
      roleDialog: {
        title: '',
        visible: false,
        height: 230,
        width: 500
      },
      //分配权限窗口属性
      assignDialog: {
        title: '',
        visible: false,
        height: 230,
        width: 500
      },
      //角色对象
      role: {
        id: '',
        roleCode: '',
        roleName: '',
        remark: '',
        createUser: this.$store.getters.userId
      },
      //权限树
      assignTreeData: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      roleId: '', //角色ID
      defaultChecked: [],
      //默认选中的节点
      checkedList: []
    }
  },
  methods: {
    /**
     * 打开添加窗口
     */
    openAddWindow() {
      //清空表单数据
      this.$resetForm('roleForm', this.role)
      this.roleDialog.title = '新增角色'//设置窗口标题
      this.roleDialog.visible = true//显示窗口
    },
    /**
     * 窗口取消事件
     */
    onClose() {
      this.roleDialog.visible = false
    },

    /**
     * 窗口确认事件
     */
    onConfirm() {
      //表单验证
      this.$refs.roleForm.validate(async(valid) => {
        let result = null
        if (valid) {
          if (this.role.id === '') {
            //添加
            result = await addRole(this.role)
          } else {
            //修改
            result = await updateRole(this.role)
          }
          const { code, msg } = result.data
          if (code === 200) {
            this.$message.success(msg)
            //刷新列表
            await this.search()
            //关闭弹窗
            this.roleDialog.visible = false
          }
        }
      })
    },
    /**
     * 获取表格数据
     */ async search() {
      let result = await getRoleList(this.searchModel)
      const { code, data } = result.data
      if (code === 200) {
        this.roleList = data.records
        this.total = data.total
      }
    },
    /**
     * 重置
     */
    restTable() {
      this.searchModel.roleName = ''
      //默认查询第一页10条数据
      this.searchModel.pageSize = 10
      this.searchModel.pageNo = 1
      this.search()
    },
    /**
     * 当前页码改变
     * @param page
     */
    handleCurrentChange(page) {

      this.searchModel.pageNo = page
      this.search()
    },

    /**
     * 页数量改变
     * @param pageSize
     */
    handleSizeChange(pageSize) {
      this.searchModel.pageSize = pageSize
      this.search()
    },
    /**
     * 编辑
     * @param row
     */
    handleEdit(row) {
      this.$objCopy(row, this.role)//将当前编辑的数据复制到role对象中
      //设置窗口标题
      this.roleDialog.title = '编辑角色'
      //显示编辑角色窗口
      this.roleDialog.visible = true
    },
    /**
     * 删除
     * @param row
     */ async handleDelete(row) {
      let result = await deleteRole(row.id)
      const { code, msg } = result.data
      if (code === 200) {
        this.$message.success(msg)
        //刷新列表
        await this.search()
      }
    },
    /**
     * 分配权限
     * @param row
     */
    assignRole(row) {
      this.roleId = row.id
      this.assignDialog.title = `为【${row.roleName}】分配权限`//设置标题
      //显示窗口
      this.assignDialog.visible = true
      //构造查询树参数
      let params = {
        userId: this.searchModel.userId,
        roleId: row.id
      }
      this.getAssignPermissionTree(params)

    },
    //关闭权限窗口
    onAssignClose() {
      this.assignDialog.visible = false
    },
    //确认权限窗口
    async onAssignConfirm() {
      //选中的权限
      let permissionList = this.$refs.assignTree.getCheckedNodes(false, true)
      permissionList = permissionList.map(item => {
        return item.id
      })
      //构造参数
      let params = {
        roleId: this.roleId,
        permissionList: permissionList
      }
      let result = await saveRolePermissions(params)
      const { code, msg } = result.data
      if (code === 200) {
        this.$message.success(msg);
      }
      //关闭弹窗
      this.assignDialog.visible = false;
    },
    /**
     * 获取分配权限菜单树
     * @param params
     */
    async getAssignPermissionTree(params) {
      let result = await getPermissionTree(params)
      const { code, msg, data } = result.data
      if (code === 200) {
        const { checkedIds, permissionList } = data
        //获取当前登录用户拥有的所有权限
        this.assignTreeData = permissionList
        //获取当前被分配的角色已经拥有的权限信息
        this.checkedList = checkedIds
        //将回调延迟到下次DOM更新循环之后执行,在修改数据之后立即使用它,然后等待DOM更新。
        this.$nextTick(() => {
          //获取树菜单的节点数据
          let nodes = this.$refs.assignTree.children
          //设置子节点
          this.setChild(nodes, this.checkedList)
        })

      }
    },
    /**
     * 设置子节点
     */
    setChild(childNodes, checkList) {
      debugger;
      //判断是否存在子节点
      if (childNodes && childNodes.length > 0) {
        //循环所有权限
        for (let i = 0; i < childNodes.length; i++) {
          //根据 data 或者 key 拿到 Tree 组件中的 node
          let node = this.$refs.assignTree.getNode(childNodes[i])
          //判断是否已经拥有对应的角色数据
          if (checkList && checkList.length > 0) {
            //循环遍历已有的权限集合
            for (let j = 0; j < checkList.length; j++) {
              //找到已经存在的菜单权限节点
              if (checkList[j] === childNodes[i].id) {
                  this.$refs.assignTree.setChecked(node, true)
                  break
              }
            }
          }
          if (childNodes[i].children) {
            this.setChild(childNodes[i].children, checkList)
          }
        }
      }
    }
  },
    created() {
      this.search()
    }
    ,
    mounted() {
      this.$nextTick(() => {
        this.tableHeight = window.innerHeight - 220
      })
    }
}
</script>

<style scoped>

</style>
