<template>
    <div class="feedback-list-container">
        <div class="page-header">
            <h2>公众监督数据列表</h2>
            <el-button type="primary" @click="fetchFeedbackList">刷新数据</el-button>
        </div>

        <el-card class="table-card">
            <el-table
                v-loading="loading"
                :data="tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize)"
                border
                style="width: 100%"
                max-height="700"
            >
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="supervisor_name" label="监督员" width="120" />
                <el-table-column prop="tel_id" label="联系电话" width="120" />
                <el-table-column label="地区" width="200">
                    <template #default="scope">
                        {{ scope.row.province_name }} {{ scope.row.city_name }}
                    </template>
                </el-table-column>
                <el-table-column
                    prop="address"
                    label="详细地址"
                    min-width="200"
                    show-overflow-tooltip
                />
                <el-table-column
                    prop="information"
                    label="反馈信息"
                    min-width="300"
                    show-overflow-tooltip
                />
                <el-table-column prop="estimated_grade" label="预估等级" width="100" />
                <el-table-column label="反馈时间" width="180">
                    <template #default="scope">
                        {{ formatDateTime(scope.row.af_date, scope.row.af_time) }}
                    </template>
                </el-table-column>
                <el-table-column label="指派网格员" width="120">
                    <template #default="scope">
                        {{ scope.row.grid_member_name || '未指派' }}
                    </template>
                </el-table-column>
                <el-table-column label="指派时间" width="180">
                    <template #default="scope">
                        {{
                            formatDateTime(scope.row.assign_date, scope.row.assign_time) || '未指派'
                        }}
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="100">
                    <template #default="scope">
                        <el-tag :type="stateTagType(scope.row.state)">
                            {{ stateMap[scope.row.state as keyof typeof stateMap] }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="remarks"
                    label="备注"
                    min-width="150"
                    show-overflow-tooltip
                />
            </el-table>

            <div class="pagination-container">
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total"
                    @size-change="currentPage = 1"
                />
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 定义反馈数据类型
interface Feedback {
    id: number
    tel_id: string
    province_id: number
    city_id: number
    address: string
    information: string
    estimated_grade: number
    af_date: string
    af_time: string
    gm_id: number
    assign_date: string
    assign_time: string
    state: number
    remarks: string
    province_name: string
    city_name: string
    supervisor_name: string
    grid_member_name: string
}

// 表格数据
const tableData = ref<Feedback[]>([])
const loading = ref(true)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 状态映射
const stateMap = {
    0: '未指派',
    1: '已指派',
    2: '已确认',
}

// 状态标签类型
const stateTagType = (state: number) => {
    switch (state) {
        case 0:
            return 'info'
        case 1:
            return 'warning'
        case 2:
            return 'success'
        default:
            return 'info'
    }
}

// 格式化日期时间
const formatDateTime = (date: string, time: string) => {
    if (!date) return '-'
    return `${date} ${time || ''}`
}

// 获取所有反馈数据
const fetchFeedbackList = async () => {
    loading.value = true
    try {
        const token = localStorage.getItem('token')
        if (!token) {
            ElMessage.error('未登录或登录已过期')
            return
        }

        const response = await axios.get('http://localhost:3000/api/v1/admin/feedback/list', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (response.data && response.data.data) {
            tableData.value = response.data.data
            total.value = response.data.data.length
        }
    } catch (error) {
        console.error('获取反馈数据失败:', error)
        ElMessage.error('获取反馈数据失败')
    } finally {
        loading.value = false
    }
}

// 页面加载时获取数据
onMounted(() => {
    fetchFeedbackList()
})
</script>

<style scoped>
.feedback-list-container {
    padding: 20px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.table-card {
    margin-bottom: 20px;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
</style>
