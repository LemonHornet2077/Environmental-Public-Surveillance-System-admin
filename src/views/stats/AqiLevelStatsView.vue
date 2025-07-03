<template>
    <div class="aqi-level-stats-container">
        <h2>AQI指数分布统计</h2>

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
                    <el-table-column prop="level" label="AQI等级" width="180" />
                    <el-table-column prop="level_value" label="等级值" width="180" />
                    <el-table-column prop="count" label="检测数量" />
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
let chart = null

// AQI等级映射表
const aqiLevelMap = {
  1: '优',
  2: '良',
  3: '轻度污染',
  4: '中度污染',
  5: '重度污染',
  6: '严重污染'
}

// 获取AQI指数分布统计数据
const fetchAqiLevelStats = async () => {
    loading.value = true
    error.value = null

    try {
        const response = await request.get('/admin/stats/aqi-level')
        if (response.success) {
            // 确保所有AQI等级都存在，并使用中文名称
            const processedData = [];
            
            // 创建一个包含所有等级的完整数据集
            for (let i = 1; i <= 6; i++) {
                // 查找后端返回的对应等级数据
                const existingData = response.data.find(item => item.level_value === i);
                
                if (existingData) {
                    // 确保使用映射表中的中文名称
                    processedData.push({
                        ...existingData,
                        level: aqiLevelMap[i] || existingData.level
                    });
                } else {
                    // 如果不存在该等级，添加默认数据
                    processedData.push({
                        level: aqiLevelMap[i],
                        level_value: i,
                        count: 0
                    });
                }
            }
            
            // 按等级值排序
            statsData.value = processedData.sort((a, b) => a.level_value - b.level_value);
            
            nextTick(() => {
                initChart()
            })
        } else {
            error.value = response.message || '获取数据失败'
        }
    } catch (err) {
        console.error('获取AQI指数分布统计数据失败:', err)
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
    const levels = statsData.value.map((item) => item.level)
    const counts = statsData.value.map((item) => item.count)

    // 设置图表选项
    const option = {
        title: {
            text: 'AQI指数分布统计',
            left: 'center',
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: levels,
        },
        series: [
            {
                name: 'AQI分布',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2,
                },
                label: {
                    show: true,
                    formatter: '{b}: {c} ({d}%)',
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold',
                    },
                },
                labelLine: {
                    show: true,
                },
                data: statsData.value.map((item) => ({
                    name: item.level,
                    value: item.count,
                })),
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
    fetchAqiLevelStats()
})
</script>

<style scoped>
.aqi-level-stats-container {
    padding: 20px;
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
