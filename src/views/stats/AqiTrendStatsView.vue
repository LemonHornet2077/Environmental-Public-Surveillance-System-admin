<template>
    <div class="aqi-trend-stats-container">
        <h2>AQI指数趋势统计</h2>

        <div class="filter-container">
            <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
                <el-radio-button label="12months">过去12个月</el-radio-button>
                <el-radio-button label="all">全部历史数据</el-radio-button>
            </el-radio-group>
        </div>

        <el-card class="stats-card" shadow="hover">
            <div v-if="loading" class="loading-container">
                <el-skeleton :rows="6" animated />
            </div>
            <div v-else-if="error" class="error-container">
                <el-alert title="数据加载失败" type="error" :description="error" show-icon />
            </div>
            <div v-else>
                <!-- 数据表格 -->
                <el-table :data="statsData" style="width: 100%" border stripe>
                    <el-table-column prop="month" label="月份" width="180" />
                    <el-table-column prop="exceed_count" label="超标数量" />
                </el-table>

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

const loading = ref(true)
const error = ref(null)
const statsData = ref([])
const chartContainer = ref(null)
const timeRange = ref('12months') // 默认显示过去12个月的数据
let chart = null

// 获取AQI指数趋势统计数据
const fetchAqiTrendStats = async () => {
    loading.value = true
    error.value = null

    try {
        const response = await request.get(`/admin/stats/aqi-trend?timeRange=${timeRange.value}`)
        if (response.success) {
            // 按月份排序
            statsData.value = response.data.sort((a, b) => {
                return new Date(a.month) - new Date(b.month)
            })
            nextTick(() => {
                initChart()
            })
        } else {
            error.value = response.message || '获取数据失败'
        }
    } catch (err) {
        console.error('获取AQI指数趋势统计数据失败:', err)
        error.value = err.message || '网络错误，请稍后重试'
    } finally {
        loading.value = false
    }
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
    const months = statsData.value.map((item) => item.month)
    const exceedCounts = statsData.value.map((item) => item.exceed_count)

    // 设置图表选项
    const option = {
        title: {
            text: timeRange.value === '12months' ? '过去12个月AQI超标趋势' : 'AQI超标历史趋势',
            left: 'center',
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
            },
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: months,
            axisLabel: {
                rotate: 45,
            },
        },
        yAxis: {
            type: 'value',
            name: '超标数量',
        },
        series: [
            {
                name: '超标数量',
                type: 'line',
                data: exceedCounts,
                markPoint: {
                    data: [
                        { type: 'max', name: '最大值' },
                        { type: 'min', name: '最小值' },
                    ],
                },
                markLine: {
                    data: [{ type: 'average', name: '平均值' }],
                },
                itemStyle: {
                    color: '#ff4949',
                },
                lineStyle: {
                    width: 3,
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            {
                                offset: 0,
                                color: 'rgba(255, 73, 73, 0.8)',
                            },
                            {
                                offset: 1,
                                color: 'rgba(255, 73, 73, 0.1)',
                            },
                        ],
                    },
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

// 处理时间范围变化
const handleTimeRangeChange = () => {
    fetchAqiTrendStats()
}

// 组件挂载时获取数据
onMounted(() => {
    fetchAqiTrendStats()
})
</script>

<style scoped>
.aqi-trend-stats-container {
    padding: 20px;
}

.filter-container {
    margin-bottom: 20px;
}

.stats-card {
    margin-top: 20px;
}

.chart-container {
    height: 400px;
    margin-top: 30px;
}

.loading-container,
.error-container {
    padding: 20px;
}
</style>
