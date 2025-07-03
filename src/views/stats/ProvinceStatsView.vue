<template>
    <div class="province-stats-container">
        <h2 class="page-title">省分组检查统计</h2>
        
        <el-card class="stats-card">
            <template #header>
                <div class="card-header">
                    <span>各省份AQI超标统计</span>
                    <el-button type="primary" size="small" @click="fetchData" :loading="loading">
                        <el-icon><Refresh /></el-icon> 刷新数据
                    </el-button>
                </div>
            </template>
            
            <div v-if="loading" class="loading-container">
                <el-skeleton :rows="6" animated />
            </div>
            
            <div v-else>
                <el-table :data="provinceStats" border stripe style="width: 100%">
                    <el-table-column prop="province_name" label="省份" width="180" />
                    <el-table-column prop="so2_exceed_count" label="SO2二氧化硫浓度超标数量">
                        <template #default="scope">
                            <span :class="{ 'exceed-warning': scope.row.so2_exceed_count > 0 }">
                                {{ scope.row.so2_exceed_count }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="co_exceed_count" label="CO一氧化碳浓度超标数量">
                        <template #default="scope">
                            <span :class="{ 'exceed-warning': scope.row.co_exceed_count > 0 }">
                                {{ scope.row.co_exceed_count }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="pm25_exceed_count" label="PM2.5悬浮颗粒物浓度超标数量">
                        <template #default="scope">
                            <span :class="{ 'exceed-warning': scope.row.pm25_exceed_count > 0 }">
                                {{ scope.row.pm25_exceed_count }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="aqi_exceed_count" label="AQI浓度等级超标数量">
                        <template #default="scope">
                            <span :class="{ 'exceed-warning': scope.row.aqi_exceed_count > 0 }">
                                {{ scope.row.aqi_exceed_count }}
                            </span>
                        </template>
                    </el-table-column>
                </el-table>
                
                <div class="chart-container" v-if="provinceStats.length > 0">
                    <div ref="chartRef" class="chart"></div>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { Refresh } from '@element-plus/icons-vue'
import request from '@/api/request'

// 定义省份统计数据类型
interface ProvinceStats {
    province_name: string
    province_id: number
    so2_exceed_count: number
    co_exceed_count: number
    pm25_exceed_count: number
    aqi_exceed_count: number
}

const loading = ref(false)
const provinceStats = ref<ProvinceStats[]>([])
const chartRef = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

// 获取省份AQI统计数据
const fetchData = async () => {
    loading.value = true
    try {
        const response = await request.get('/admin/stats/province')
        provinceStats.value = response.data
        nextTick(() => {
            initChart()
        })
        
    } catch (error) {
        console.error('获取省份统计数据失败:', error)
        ElMessage.error('获取省份统计数据失败')
    } finally {
        loading.value = false
    }
}

// 初始化图表
const initChart = () => {
    if (!chartRef.value) return
    
    // 如果图表已经存在，先销毁
    if (chart) {
        chart.dispose()
    }
    
    // 创建图表实例
    chart = echarts.init(chartRef.value)
    
    // 准备图表数据
    const provinces = provinceStats.value.map(item => item.province_name)
    const so2Data = provinceStats.value.map(item => item.so2_exceed_count)
    const coData = provinceStats.value.map(item => item.co_exceed_count)
    const pm25Data = provinceStats.value.map(item => item.pm25_exceed_count)
    const aqiData = provinceStats.value.map(item => item.aqi_exceed_count)
    
    // 设置图表选项
    const option = {
        title: {
            text: '各省份AQI超标统计',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['SO2超标', 'CO超标', 'PM2.5超标', 'AQI超标'],
            top: 30
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: provinces,
            axisLabel: {
                interval: 0,
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: '超标数量'
        },
        series: [
            {
                name: 'SO2超标',
                type: 'bar',
                data: so2Data,
                itemStyle: {
                    color: '#FF9800'
                }
            },
            {
                name: 'CO超标',
                type: 'bar',
                data: coData,
                itemStyle: {
                    color: '#F44336'
                }
            },
            {
                name: 'PM2.5超标',
                type: 'bar',
                data: pm25Data,
                itemStyle: {
                    color: '#9C27B0'
                }
            },
            {
                name: 'AQI超标',
                type: 'bar',
                data: aqiData,
                itemStyle: {
                    color: '#E91E63'
                }
            }
        ]
    }
    
    // 设置图表选项并渲染
    chart.setOption(option)
    
    // 响应窗口大小变化
    window.addEventListener('resize', handleResize)
}

// 处理窗口大小变化
const handleResize = () => {
    chart?.resize()
}

// 组件挂载时获取数据
onMounted(() => {
    fetchData()
})

// 组件卸载时清理事件监听
onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    chart?.dispose()
})
</script>

<style scoped>
.province-stats-container {
    padding: 20px;
}

.page-title {
    margin-bottom: 20px;
    color: #303133;
}

.stats-card {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.loading-container {
    padding: 20px;
}

.chart-container {
    margin-top: 30px;
    width: 100%;
}

.chart {
    width: 100%;
    height: 500px;
}

.exceed-warning {
    color: #F56C6C;
    font-weight: bold;
}
</style>
