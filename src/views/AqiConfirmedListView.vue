<template>
    <div class="aqi-confirmed-list-container">
        <div class="page-header">
            <h2>网格员确认AQI数据列表</h2>
            <el-button type="primary" @click="fetchAqiConfirmedList">刷新数据</el-button>
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
                <el-table-column label="空气质量等级" width="150">
                    <template #default="scope">
                        <span :style="getAqiColorStyle(scope.row.color)">
                            {{ scope.row.chinese_explain }} ({{ scope.row.aqi_explain }})
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="SO₂" width="120">
                    <template #default="scope">
                        {{ scope.row.so2_value }} μg/m³ (级别: {{ scope.row.so2_level }})
                    </template>
                </el-table-column>
                <el-table-column label="CO" width="120">
                    <template #default="scope">
                        {{ scope.row.co_value }} μg/m³ (级别: {{ scope.row.co_level }})
                    </template>
                </el-table-column>
                <el-table-column label="PM2.5" width="120">
                    <template #default="scope">
                        {{ scope.row.spm_value }} μg/m³ (级别: {{ scope.row.spm_level }})
                    </template>
                </el-table-column>
                <el-table-column label="确认时间" width="180">
                    <template #default="scope">
                        {{ formatDateTime(scope.row.confirm_date, scope.row.confirm_time) }}
                    </template>
                </el-table-column>
                <el-table-column prop="grid_member_name" label="网格员" width="120" />
                <el-table-column prop="supervisor_name" label="监督员" width="120" />
                <el-table-column
                    prop="information"
                    label="反馈信息"
                    min-width="200"
                    show-overflow-tooltip
                />
                <el-table-column
                    prop="health_impact"
                    label="健康影响"
                    min-width="200"
                    show-overflow-tooltip
                />
                <el-table-column
                    prop="take_steps"
                    label="建议措施"
                    min-width="200"
                    show-overflow-tooltip
                />
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

// 定义AQI数据类型
interface AqiData {
    id: number
    province_id: number
    city_id: number
    address: string
    so2_value: number
    so2_level: number
    co_value: number
    co_level: number
    spm_value: number
    spm_level: number
    aqi_id: number
    confirm_date: string
    confirm_time: string
    gm_id: number
    fd_id: string
    information: string
    remarks: string
    province_name: string
    city_name: string
    grid_member_name: string
    supervisor_name: string
    chinese_explain: string
    aqi_explain: string
    color: string
    health_impact: string
    take_steps: string
}

// 表格数据
const tableData = ref<AqiData[]>([])
const loading = ref(true)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 获取所有已确认的AQI数据
const fetchAqiConfirmedList = async () => {
    loading.value = true
    try {
        const token = localStorage.getItem('token')
        if (!token) {
            ElMessage.error('未登录或登录已过期')
            return
        }

        const response = await axios.get('http://localhost:3000/api/v1/admin/aqi/confirmed/list', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        if (response.data && response.data.data) {
            tableData.value = response.data.data
            total.value = response.data.data.length
        }
    } catch (error) {
        console.error('获取已确认AQI数据失败:', error)
        ElMessage.error('获取已确认AQI数据失败')
    } finally {
        loading.value = false
    }
}

// 格式化日期时间
const formatDateTime = (date: string, time: string) => {
    if (!date) return '-'
    return `${date} ${time || ''}`
}

// 根据AQI级别获取颜色样式
const getAqiColorStyle = (color: string) => {
    return {
        backgroundColor: color,
        color: '#fff',
        padding: '2px 8px',
        borderRadius: '4px',
    }
}

// 页面加载时获取数据
onMounted(() => {
    fetchAqiConfirmedList()
})
</script>

<style scoped>
.aqi-confirmed-list-container {
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
