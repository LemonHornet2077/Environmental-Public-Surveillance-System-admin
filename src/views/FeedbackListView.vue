<template>
    <div class="feedback-list-container">
        <div class="page-header">
            <h2>公众监督数据列表</h2>
            <div class="filter-container">
                <el-select v-model="selectedProvince" placeholder="选择省份" clearable @change="handleProvinceChange">
                    <el-option 
                        v-for="province in provinceList" 
                        :key="province.province_id" 
                        :label="province.province_name" 
                        :value="province.province_id" 
                    />
                </el-select>
                <el-select v-model="selectedCity" placeholder="选择城市" clearable :disabled="!selectedProvince">
                    <el-option 
                        v-for="city in cityList" 
                        :key="city.city_id" 
                        :label="city.city_name" 
                        :value="city.city_id" 
                    />
                </el-select>
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
                <el-button type="success" @click="fetchFeedbackList">刷新数据</el-button>
            </div>
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
                <el-table-column label="操作" width="120">
                    <template #default="scope">
                        <el-button size="small" type="primary" @click="showDetail(scope.row)">查看详情</el-button>
                    </template>
                </el-table-column>
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
    
    <!-- 详情对话框 -->
    <FeedbackDetailDialog
        v-model:visible="detailDialogVisible"
        :feedback-data="currentFeedback"
        @close="closeDetailDialog"
    />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../api/request'
import FeedbackDetailDialog from '../components/FeedbackDetailDialog.vue'

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

// 省市选择器
const provinceList = ref<any[]>([])
const cityList = ref<any[]>([])
const selectedProvince = ref<number | null>(null)
const selectedCity = ref<number | null>(null)

// 详情对话框
const detailDialogVisible = ref(false)
const currentFeedback = ref<any>(null)

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
        // 构建查询参数
        const params: Record<string, number> = {}
        if (selectedProvince.value) {
            params['province_id'] = selectedProvince.value
            if (selectedCity.value) {
                params['city_id'] = selectedCity.value
            }
        }

        const response = await request({
            url: '/admin/feedback/list',
            method: 'get',
            params
        })

        if (response && response.data) {
            tableData.value = response.data
            total.value = response.data.length
        }
    } catch (error) {
        console.error('获取反馈数据失败:', error)
        ElMessage.error('获取反馈数据失败')
    } finally {
        loading.value = false
    }
}

// 获取省份列表
const fetchProvinces = async () => {
    try {
        const response = await request({
            url: '/admin/location/provinces',
            method: 'get'
        })

        if (response && response.data) {
            provinceList.value = response.data
        }
    } catch (error) {
        console.error('获取省份列表失败:', error)
    }
}

// 获取城市列表
const fetchCities = async (provinceId: number) => {
    try {
        const response = await request({
            url: `/admin/location/cities/${provinceId}`,
            method: 'get'
        })

        if (response && response.data) {
            cityList.value = response.data
        }
    } catch (error) {
        console.error('获取城市列表失败:', error)
    }
}

// 处理省份选择变化
const handleProvinceChange = (value: number | null) => {
    selectedCity.value = null
    cityList.value = []
    
    if (value) {
        fetchCities(value)
    }
}

// 处理查询按钮点击
const handleSearch = () => {
    currentPage.value = 1 // 重置到第一页
    fetchFeedbackList()
}

// 处理重置按钮点击
const handleReset = () => {
    selectedProvince.value = null
    selectedCity.value = null
    cityList.value = []
    currentPage.value = 1
    fetchFeedbackList()
}

// 显示详情对话框
const showDetail = (row: any) => {
    currentFeedback.value = row
    detailDialogVisible.value = true
}

// 关闭详情对话框
const closeDetailDialog = () => {
    detailDialogVisible.value = false
    currentFeedback.value = null
}

// 页面加载时获取数据
onMounted(() => {
    fetchProvinces()
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
