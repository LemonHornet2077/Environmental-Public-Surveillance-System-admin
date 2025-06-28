<template>
    <div class="supervisor-manage-container">
        <h2>公众监督员管理</h2>

        <el-table v-loading="loading" :data="supervisorList" style="width: 100%; margin-top: 20px">
            <el-table-column prop="tel_id" label="手机号" width="150" />
            <el-table-column prop="real_name" label="姓名" width="120" />
            <el-table-column prop="birthday" label="出生日期" width="120" />
            <el-table-column prop="sex" label="性别" width="80">
                <template #default="scope">
                    {{ scope.row.sex === 0 ? '女' : '男' }}
                </template>
            </el-table-column>
            <el-table-column prop="remarks" label="备注" />
            <el-table-column prop="created_at" label="注册时间" :formatter="formatDate" />
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
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/api/request'

// 监督员列表数据
const supervisorList = ref<any[]>([])
const loading = ref(false)

// 格式化日期
const formatDate = (row: any, column: any) => {
    const date = new Date(row.created_at)
    return date.toLocaleString()
}

// 获取监督员列表
const getSupervisorList = async () => {
    loading.value = true
    try {
        const res = await request.get('/admin/supervisor/list')
        supervisorList.value = res.data || []
    } catch (error) {
        ElMessage.error('获取公众监督员列表失败')
        console.error(error)
    } finally {
        loading.value = false
    }
}

// 删除监督员
const handleDelete = (row: any) => {
    ElMessageBox.confirm(`确认删除公众监督员 ${row.real_name || row.tel_id}?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            await request.delete(`/admin/supervisor/delete/${row.tel_id}`)
            ElMessage.success('删除成功')
            getSupervisorList()
        } catch (error) {
            console.error('删除公众监督员失败', error)
        }
    }).catch(() => {
        // 取消删除
    })
}

// 页面加载时获取监督员列表
onMounted(() => {
    getSupervisorList()
})
</script>

<style scoped>
.supervisor-manage-container {
    padding: 20px;
}
</style>
