<template>
  <el-main>
    <el-button type="success" icon="el-icon-plus" @click="openAddWindow">新增</el-button>
    <!--  数据表格  -->
    <el-table
      style="margin-top: 10px"
      :height="tableHeight"
      :data="menuList"
      row-key="id"
      default-expand-all
      :tree-props="{ children: 'children' }"
      :border="true"
      stripe
    >

      <el-table-column prop="label" label="菜单名称"></el-table-column>
      <el-table-column prop="type" label="菜单类型">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.type === 0" size="normal">目录</el-tag>
          <el-tag type="success" v-else-if="scope.row.type === 1" size="normal">
            菜单
          </el-tag>
          <el-tag type="warning" v-else-if="scope.row.type === 2" size="normal">
            按钮
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="icon" label="图标">
        <template slot-scope="scope">
          <i :class="scope.row.icon" v-if="scope.row.icon.includes('el-icon')"></i>
          <svg-icon v-else :icon-class="scope.row.icon"></svg-icon>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="路由名称"></el-table-column>
      <el-table-column prop="path" label="路由地址"></el-table-column>
      <el-table-column prop="url" label="组件路径"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="handleEdit(scope.row)"
          >编辑
          </el-button>
          <el-button
            size="mini"
            icon="el-icon-delete"
            type="danger"
            @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--  新增弹出框  -->
    <system-dialog
      :title="menuDialog.title"
      :height="menuDialog.height"
      :width="menuDialog.width"
      :visible="menuDialog.visible"
      @onClose="onClose"
      @onConfirm="onConfirm"
    >
      <div slot="content">
        <el-form ref="menuForm" :model="menu" label-width="80px" :inline="true" size="small" :rules="rules">
          <el-col :span="24">
            <el-form-item label="菜单类型" prop="type">
              <el-radio-group v-model="menu.type">
                <el-radio :label="0">目录</el-radio>
                <el-radio :label="1">菜单</el-radio>
                <el-radio :label="2">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-form-item label="所属菜单" prop="parentName">
            <el-input v-model="menu.parentName" :readonly="true" @click.native="selectPatentMenu"></el-input>
          </el-form-item>
          <el-form-item label="菜单名称" size="small" prop="label">
            <el-input v-model="menu.label"></el-input>
          </el-form-item>
          <el-form-item label="路由名称" size="small" prop="name" v-if="menu.type==1">
            <el-input v-model="menu.name"></el-input>
          </el-form-item>
          <el-form-item label="路由地址" size="small" prop="path" v-if="menu.type!=2">
            <el-input v-model="menu.path"></el-input>
          </el-form-item>
          <el-form-item label="组件路径" size="small" prop="url" v-if="menu.type==1">
            <el-input v-model="menu.url"></el-input>
          </el-form-item>
          <el-form-item label="权限字段" size="small" prop="code">
            <el-input v-model="menu.code"></el-input>
          </el-form-item>
          <el-form-item label="菜单序号" size="small">
            <el-input v-model="menu.orderNum"></el-input>
          </el-form-item>
          <el-form-item label="菜单图标" size="small">
            <MyIcon @selectIcon="setIcon" ref="child"></MyIcon>
          </el-form-item>
        </el-form>
      </div>
    </system-dialog>

    <!--  选择所属菜单  -->
    <system-dialog
      :title="parentDialog.title"
      :height="parentDialog.height"
      :width="parentDialog.width"
      :visible="parentDialog.visible"
      @onClose="onParentClose"
      @onConfirm="onParentConfirm"
    >
      <div slot="content">
        <el-tree
          ref="parentArr"
          :data="parentTree"
          node-key="id"
          :default-expand-all="true"
          :highlight-current="true"
          :expand-on-click-node="false"
          :props="defaultProps"
          @node-click="handleNodeClick"
        >
          <div class="customer-tree-node" slot-scope="{ node, data }">
            <span v-if="data.children.length === 0">
              <i class="el-icon-document"></i>
            </span>
            <span v-else @click="openBtn(data)">
          <svg-icon v-if="data.open" icon-class="sub-s"/>
          <svg-icon v-else icon-class="add-s"/>
          </span>
            <span style="margin-left: 5px">{{ node.label }}</span>
          </div>
        </el-tree>
      </div>
    </system-dialog>
  </el-main>
</template>

<script>
import { add, checkPermission, delPermission, getMenuList, getParent, updateMenu } from '@/api/menu'
//导入对话框组件
import SystemDialog from '@/components/System/SystemDialog'
import MyIcon from '@/components/iconSelect/MyIcon'


export default {
  name: 'menuList',
  components: {
    SystemDialog,
    MyIcon
  },
  data() {
    return {
      menuList: [],
      tableHeight: 0,
      //添加菜单弹出框
      menuDialog: {
        title: '',
        height: 270,
        width: 630,
        visible: false
      },
      parentTree: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      //菜单属性
      menu: {
        id: '',
        type: '',
        parentId: '',
        parentName: '',
        label: '',
        icon: '',
        name: '',
        path: '',
        url: '',
        code: '',
        orderNum: ''
      },
      rules: {
        type: [{ required: true, trigger: 'change', message: '请选择菜单类型' }],
        parentName: [{ required: true, trigger: 'change', message: '请选择所属菜单' }],
        label: [{ required: true, trigger: 'blur', message: '请输入菜单名称' }],
        name: [{ required: true, trigger: 'blur', message: '请输入路由名称' }],
        path: [{ required: true, trigger: 'blur', message: '请输入路由路径' }],
        url: [{ required: true, trigger: 'blur', message: '请输入组件路径' }],
        code: [{ required: true, trigger: 'blur', message: '请输入权限字段' }]
      },
      //所属菜单窗口
      parentDialog: {
        title: '',
        height: 270,
        width: 630,
        visible: false
      },

    }
  },
  methods: {
    async search() {
      let result = await getMenuList()
      const { code, data } = result.data
      if (code === 200) {
        this.menuList = data

      }
    },
    /**
     * 打开新增窗口
     */
    openAddWindow() {
      //清空表单数据
      this.$resetForm('menuForm', this.menu)
      this.menuDialog.title = '新增菜单'
      this.menuDialog.visible = true
      this.$nextTick(()=>{
        this.$refs.child.userChooseIcon="";//清空菜单图标
      })
    },
    /**
     * 取消
     */
    onClose() {
      this.menuDialog.visible = false
    },
    /**
     * 确认按钮
     */
    onConfirm() {
      //表单验证
      this.$refs.menuForm.validate(async valid => {
        let result=null
        if (valid){
          //判断是新增还是修改
          if (this.menu.id === "") {
            //新增
            result= await add(this.menu);

          }else {
            //修改
            result= await updateMenu(this.menu)
          }
          const {code,msg}=result.data;
          if (code === 200) {
            this.$message.success(msg);
            //关闭窗口
            this.menuDialog.visible=false;
            //刷新
            await this.search();
          }
        }
      })
    },
    /**
     * 取消选择父级菜单
     */
    onParentClose() {
      this.parentDialog.visible = false
      this.menu.parentId = ''
      this.menu.parentName = ''
    },
    //获取父级菜单
    async selectPatentMenu() {
      //打开父级菜单窗口
      this.parentDialog.visible = true
      let result = await getParent()
      const { code, data } = result.data
      if (code === 200) {
        this.parentTree = data
      }
    },
    /**
     * 选择父级菜单确认
     */
    onParentConfirm() {
      this.parentDialog.visible = false
    },
    //选择所属部门事件
    handleNodeClick(data) {
      //所属父级菜单ID
      this.menu.parentId = data.id
      //所属父级菜单名称
      this.menu.parentName = data.label
    },
    openBtn(data) {
      //修改折叠展开状态
      data.open = !data.open
      this.$refs.parentArr.store.nodesMap[data.id].expanded = !data.open
    },
    /**
     * 给icon绑定的点击事件
     * @param icon
     */
    setIcon(icon) {
      this.menu.icon = icon;
    },
    /**
     * 编辑
     * @param row
     */
    handleEdit(row){
      //数据回显
      this.$objCopy(row,this.menu);
      //回显图标选择器
      this.$nextTick(()=>{
        this.$refs.child.userChooseIcon=row.icon;
      })
      this.menuDialog.title="编辑菜单";
      //显示编辑部门窗口
      this.menuDialog.visible = true;
    },
    /**
     * 删除菜单
     * @param row
     */
    async handleDelete(row) {
      //检查部门是否可删除
      let result =await checkPermission(row.id);
      const { success,msg} = result.data
      if(!success){
        //提示不可删除原因
        this.$message.warning(msg)
      }else{
        let confirm=await this.$myconfirm("是否确认删除?",'warning');
        //如果点击确认按钮
        if(confirm){
          //删除菜单
          delPermission(row.id).then(
            res=>{
              const {code,msg}=res.data
              if (code === 200) {
                this.$message.success(msg);
                //刷新
                this.search()
              }
            }
          )
        }
      }
    },

  },
//初始化时调用
  created() {
    //调用查询菜单列表的方法
    this.search()
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 180
    })
  }
}
</script>


<style lang="scss" scoped>
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

</style>
