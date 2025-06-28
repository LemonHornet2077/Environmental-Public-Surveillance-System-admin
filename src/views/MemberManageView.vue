<template>
    <div class="member-manage-container">
        <h2>网格员管理</h2>
        <div class="member-actions">
            <el-button type="primary" @click="dialogVisible = true">添加网格员</el-button>
        </div>

        <el-table v-loading="loading" :data="memberList" style="width: 100%; margin-top: 20px">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="member_code" label="网格员账号" width="150" />
            <el-table-column prop="real_name" label="姓名" width="120" />
            <el-table-column prop="grid_id" label="网格ID" width="100" />
            <el-table-column prop="created_at" label="创建时间" :formatter="formatDate" />
            <el-table-column label="操作" width="120">
                <template #default="scope">
                    <el-button
                        type="danger"
                        size="small"
                        @click="handleDelete(scope.row)"
                    >
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 添加网格员对话框 -->
        <el-dialog v-model="dialogVisible" title="添加网格员" width="500px">
            <el-form
                ref="memberFormRef"
                :model="memberForm"
                :rules="memberRules"
                label-width="100px"
                status-icon
            >
                <el-form-item label="网格员账号" prop="member_code">
                    <el-input v-model="memberForm.member_code" placeholder="请输入网格员账号" />
                </el-form-item>
                <el-form-item label="姓名" prop="real_name">
                    <el-input v-model="memberForm.real_name" placeholder="请输入姓名" />
                </el-form-item>
                <el-form-item label="网格ID" prop="grid_id">
                    <el-input v-model.number="memberForm.grid_id" placeholder="请输入网格ID" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input
                        v-model="memberForm.password"
                        type="password"
                        placeholder="请输入密码"
                        show-password
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleAddMember" :loading="submitLoading">
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

// 网格员列表数据
const memberList = ref<any[]>([])
const loading = ref(false)

// 添加网格员表单
const memberFormRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)

const memberForm = reactive({
    member_code: '',
    real_name: '',
    grid_id: null as number | null,
    password: '',
})

const memberRules: FormRules = {
    member_code: [
        { required: true, message: '请输入网格员账号', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
    ],
    real_name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
    grid_id: [
        { required: true, message: '请输入网格ID', trigger: 'blur' },
        { type: 'number', message: '网格ID必须为数字', trigger: 'blur' }
    ],
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

// 获取网格员列表
const getMemberList = async () => {
    loading.value = true
    try {
        const res = await request.get('/admin/member/list')
        memberList.value = res.data || []
    } catch (error) {
        ElMessage.error('获取网格员列表失败')
        console.error(error)
    } finally {
        loading.value = false
    }
}

// 添加网格员
const handleAddMember = async () => {
    if (!memberFormRef.value) return
    
    await memberFormRef.value.validate(async (valid) => {
        if (valid) {
            submitLoading.value = true
            try {
                await request.post('/admin/member/add', memberForm)
                ElMessage.success('添加成功')
                dialogVisible.value = false
                // 重置表单
                memberForm.member_code = ''
                memberForm.real_name = ''
                memberForm.grid_id = null
                memberForm.password = ''
                // 刷新列表
                getMemberList()
            } catch (error) {
                console.error('添加网格员失败', error)
            } finally {
                submitLoading.value = false
            }
        }
    })
}

// 删除网格员
const handleDelete = (row: any) => {
    ElMessageBox.confirm(`确认删除网格员 ${row.real_name || row.member_code}?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            await request.delete(`/admin/member/delete/${row.id}`)
            ElMessage.success('删除成功')
            getMemberList()
        } catch (error) {
            console.error('删除网格员失败', error)
        }
    }).catch(() => {
        // 取消删除
    })
}

// 页面加载时获取网格员列表
onMounted(() => {
    getMemberList()
})
</script>

<style scoped>
.member-manage-container {
    padding: 20px;
}

.member-actions {
    margin-top: 20px;
}
</style>
