<template>
    <div class="admin-manage-container">
        <h2>管理员管理</h2>
        <div class="admin-actions">
            <el-button type="primary" @click="dialogVisible = true">添加管理员</el-button>
        </div>

        <el-table v-loading="loading" :data="adminList" style="width: 100%; margin-top: 20px">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="admin_code" label="管理员账号" width="150" />
            <el-table-column prop="real_name" label="姓名" width="120" />
            <el-table-column prop="created_at" label="创建时间" :formatter="formatDate" />
            <el-table-column label="操作" width="120">
                <template #default="scope">
                    <el-button
                        type="danger"
                        size="small"
                        @click="handleDelete(scope.row)"
                        :disabled="scope.row.id === currentAdminId"
                    >
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 添加管理员对话框 -->
        <el-dialog v-model="dialogVisible" title="添加管理员" width="500px">
            <el-form
                ref="adminFormRef"
                :model="adminForm"
                :rules="adminRules"
                label-width="100px"
                status-icon
            >
                <el-form-item label="管理员账号" prop="admin_code">
                    <el-input v-model="adminForm.admin_code" placeholder="请输入管理员账号" />
                </el-form-item>
                <el-form-item label="姓名" prop="real_name">
                    <el-input v-model="adminForm.real_name" placeholder="请输入姓名" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input
                        v-model="adminForm.password"
                        type="password"
                        placeholder="请输入密码"
                        show-password
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleAddAdmin" :loading="submitLoading">
                        确认
                    </el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import request from '@/api/request'

// 当前登录的管理员ID
const currentAdminId = ref<number | null>(null)

// 管理员列表数据
const adminList = ref<any[]>([])
const loading = ref(false)

// 添加管理员表单
const adminFormRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)

const adminForm = reactive({
    admin_code: '',
    real_name: '',
    password: '',
})

const adminRules: FormRules = {
    admin_code: [
        { required: true, message: '请输入管理员账号', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
    ],
    real_name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
    ],
}

// 格式化日期
const formatDate = (row: any, column: any) => {
    const date = new Date(row.created_at)
    return date.toLocaleString()
}

// 获取管理员列表
const getAdminList = async () => {
    loading.value = true
    try {
        const res = await request.get('/admin/list')
        adminList.value = res.data || []
        
        // 尝试获取当前登录的管理员ID
        try {
            const userInfo = await request.get('/admin/info') as any
            currentAdminId.value = userInfo.id
        } catch (error) {
            console.error('获取当前管理员信息失败', error)
        }
    } catch (error) {
        ElMessage.error('获取管理员列表失败')
        console.error(error)
    } finally {
        loading.value = false
    }
}

// 添加管理员
const handleAddAdmin = async () => {
    if (!adminFormRef.value) return
    
    await adminFormRef.value.validate(async (valid) => {
        if (valid) {
            submitLoading.value = true
            try {
                await request.post('/admin/add', adminForm)
                ElMessage.success('添加成功')
                dialogVisible.value = false
                // 重置表单
                adminForm.admin_code = ''
                adminForm.real_name = ''
                adminForm.password = ''
                // 刷新列表
                getAdminList()
            } catch (error) {
                console.error('添加管理员失败', error)
            } finally {
                submitLoading.value = false
            }
        }
    })
}

// 删除管理员
const handleDelete = (row: any) => {
    ElMessageBox.confirm(`确认删除管理员 ${row.real_name || row.admin_code}?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            await request.delete(`/admin/delete/${row.id}`)
            ElMessage.success('删除成功')
            getAdminList()
        } catch (error) {
            console.error('删除管理员失败', error)
        }
    }).catch(() => {
        // 取消删除
    })
}

// 页面加载时获取管理员列表
onMounted(() => {
    getAdminList()
})
</script>

<style scoped>
.admin-manage-container {
    padding: 20px;
}

.admin-actions {
    margin-top: 20px;
}
</style>
