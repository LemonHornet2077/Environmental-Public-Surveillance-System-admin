<template>
    <div class="aqi-realtime-stats-container">
        <h2>空气质量检测数量实时统计</h2>

        <el-card class="stats-card" shadow="hover">
            <div v-if="loading" class="loading-container">
                <el-skeleton :rows="3" animated />
            </div>
            <div v-else-if="error" class="error-container">
                <el-alert title="数据加载失败" type="error" :description="error" show-icon />
            </div>
            <div v-else>
                <!-- 数据卡片 -->
                <div class="stats-cards-container">
                    <el-card class="stat-item total-card">
                        <template #header>
                            <div class="card-header">
                                <span>总检测数量</span>
                                <el-button @click="refreshData" text>
                                    <el-icon><Refresh /></el-icon>
                                </el-button>
                            </div>
                        </template>
                        <div class="stat-value">{{ statsData.total_count }}</div>
                    </el-card>

                    <el-card class="stat-item good-card">
                        <template #header>
                            <div class="card-header">
                                <span>良好检测数量 (AQI ≤ 100)</span>
                            </div>
                        </template>
                        <div class="stat-value">{{ statsData.good_count }}</div>
                        <div class="stat-percentage">
                            {{ calculatePercentage(statsData.good_count, statsData.total_count) }}%
                        </div>
                    </el-card>

                    <el-card class="stat-item exceeding-card">
                        <template #header>
                            <div class="card-header">
                                <span>超标检测数量 (AQI > 100)</span>
                            </div>
                        </template>
                        <div class="stat-value">{{ statsData.exceeding_count }}</div>
                        <div class="stat-percentage">
                            {{
                                calculatePercentage(
                                    statsData.exceeding_count,
                                    statsData.total_count,
                                )
                            }}%
                        </div>
                    </el-card>
                </div>

                <!-- 图表 -->
                <div class="chart-container" ref="chartContainer"></div>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import request from '@/api/request'
import * as echarts from 'echarts'
import { Refresh } from '@element-plus/icons-vue'

const loading = ref(true)
const error = ref(null)
const statsData = ref({
    total_count: 0,
    good_count: 0,
    exceeding_count: 0,
})
const chartContainer = ref(null)
let chart = null

// 计算百分比
const calculatePercentage = (value, total) => {
    if (!total) return 0
    return ((value / total) * 100).toFixed(2)
}

// 获取空气质量检测数量实时统计数据
const fetchAqiRealtimeStats = async () => {
    loading.value = true
    error.value = null

    try {
        const response = await request.get('/admin/stats/aqi-realtime')
        if (response.success) {
            statsData.value = response.data
            nextTick(() => {
                initChart()
            })
        } else {
            error.value = response.message || '获取数据失败'
        }
    } catch (err) {
        console.error('获取空气质量检测数量实时统计数据失败:', err)
        error.value = err.message || '网络错误，请稍后重试'
    } finally {
        loading.value = false
    }
}

// 刷新数据
const refreshData = () => {
    fetchAqiRealtimeStats()
}

// 初始化图表
const initChart = () => {
    if (!chartContainer.value) return

    // 销毁旧图表
    if (chart) {
        chart.dispose()
    }

    // 创建新图表
    chart = echarts.init(chartContainer.value)

    // 准备图表数据
    const data = [
        { name: '良好检测 (AQI ≤ 100)', value: statsData.value.good_count },
        { name: '超标检测 (AQI > 100)', value: statsData.value.exceeding_count },
    ]

    // 设置图表选项
    const option = {
        title: {
            text: '空气质量检测分布',
            left: 'center',
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        legend: {
            orient: 'horizontal',
            bottom: 'bottom',
        },
        series: [
            {
                name: '检测数量',
                type: 'pie',
                radius: '50%',
                data: data,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)',
                    },
                },
                itemStyle: {
                    color: function (params) {
                        const colorList = ['#67C23A', '#F56C6C']
                        return colorList[params.dataIndex]
                    },
                },
                label: {
                    formatter: '{b}: {c} ({d}%)',
                },
            },
        ],
    }

    // 设置图表
    chart.setOption(option)

    // 响应窗口大小变化
    window.addEventListener('resize', () => {
        chart && chart.resize()
    })
}

// 组件挂载时获取数据
onMounted(() => {
    fetchAqiRealtimeStats()
})
</script>

<style scoped>
.aqi-realtime-stats-container {
    padding: 20px;
}

.stats-card {
    margin-top: 20px;
}

.stats-cards-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;
    flex-wrap: wrap;
}

.stat-item {
    width: 30%;
    min-width: 250px;
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.stat-value {
    font-size: 36px;
    font-weight: bold;
    text-align: center;
    margin: 10px 0;
}

.stat-percentage {
    text-align: center;
    font-size: 16px;
    color: #606266;
}

.total-card .stat-value {
    color: #409eff;
}

.good-card .stat-value {
    color: #67c23a;
}

.exceeding-card .stat-value {
    color: #f56c6c;
}

.chart-container {
    height: 400px;
    margin-top: 30px;
}

.loading-container,
.error-container {
    padding: 20px;
}

@media (max-width: 768px) {
    .stats-cards-container {
        flex-direction: column;
    }

    .stat-item {
        width: 100%;
        margin-bottom: 15px;
    }
}
</style>
