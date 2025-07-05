<template>
    <div class="dashboard-container">
        <div class="dashboard-header">
            <h1>环境公共监测系统 - 数据可视化大屏</h1>
            <div class="refresh-info">
                <el-tag type="info">数据自动刷新中</el-tag>
                <span class="refresh-time">{{ currentTime }}</span>
            </div>
        </div>

        <div class="dashboard-container-inner">
            <div class="dashboard-layout">
                <!-- 左侧图表 -->
                <div class="dashboard-side left-side">
                    <!-- 省分组AQI统计 -->
                    <el-card class="dashboard-card province-stats">
                        <template #header>
                            <div class="card-header">
                                <span>各省份AQI超标统计</span>
                            </div>
                        </template>
                        <div v-if="loading.province" class="loading-container">
                            <el-skeleton :rows="3" animated />
                        </div>
                        <div v-else class="chart-container" ref="provinceChartRef"></div>
                    </el-card>

                    <!-- AQI指数分布统计 -->
                    <el-card class="dashboard-card aqi-level-stats">
                        <template #header>
                            <div class="card-header">
                                <span>AQI空气质量指数级别分布</span>
                            </div>
                        </template>
                        <div v-if="loading.level" class="loading-container">
                            <el-skeleton :rows="3" animated />
                        </div>
                        <div v-else class="chart-container" ref="levelChartRef"></div>
                    </el-card>

                    <!-- SO2二氧化硫浓度超标统计 -->
                    <el-card class="dashboard-card so2-stats">
                        <template #header>
                            <div class="card-header">
                                <span>SO2二氧化硫浓度超标统计</span>
                            </div>
                        </template>
                        <div v-if="loading.province" class="loading-container">
                            <el-skeleton :rows="3" animated />
                        </div>
                        <div v-else class="chart-container" ref="so2ChartRef"></div>
                    </el-card>
                </div>

                <!-- 中间地图 -->
                <div class="dashboard-center">
                    <!-- 中国地图 - AQI超标情况 -->
                    <el-card class="dashboard-card china-map">
                        <template #header>
                            <div class="card-header">
                                <span>全国各省份AQI超标情况分布图</span>
                                <el-tooltip content="颜色越深表示AQI超标数量越多" placement="top">
                                    <el-icon><InfoFilled /></el-icon>
                                </el-tooltip>
                            </div>
                        </template>
                        <div v-if="loading.province" class="loading-container">
                            <el-skeleton :rows="3" animated />
                        </div>
                        <div v-else class="chart-container" ref="mapChartRef"></div>
                    </el-card>
                </div>

                <!-- 右侧图表 -->
                <div class="dashboard-side right-side">
                    <!-- AQI指数趋势统计 -->
                    <el-card class="dashboard-card aqi-trend-stats">
                        <template #header>
                            <div class="card-header">
                                <span>AQI空气质量指数超标趋势</span>
                            </div>
                        </template>
                        <div v-if="loading.trend" class="loading-container">
                            <el-skeleton :rows="3" animated />
                        </div>
                        <div v-else class="chart-container" ref="trendChartRef"></div>
                    </el-card>

                    <!-- 检测数量实时统计 -->
                    <el-card class="dashboard-card realtime-stats">
                        <template #header>
                            <div class="card-header">
                                <span>空气质量检测数量实时统计</span>
                            </div>
                        </template>
                        <div v-if="loading.realtime" class="loading-container">
                            <el-skeleton :rows="3" animated />
                        </div>
                        <div v-else class="realtime-data">
                            <div class="data-card total">
                                <div class="data-value">{{ realtimeStats.totalCount }}</div>
                                <div class="data-label">总检测数量</div>
                            </div>
                            <div class="data-card good">
                                <div class="data-value">{{ realtimeStats.goodCount }}</div>
                                <div class="data-label">良好检测数量</div>
                                <div class="data-percent">{{ realtimeStats.goodPercent }}%</div>
                            </div>
                            <div class="data-card exceed">
                                <div class="data-value">{{ realtimeStats.exceedingCount }}</div>
                                <div class="data-label">超标检测数量</div>
                                <div class="data-percent">{{ realtimeStats.exceedPercent }}%</div>
                            </div>
                        </div>
                    </el-card>

                    <!-- PM2.5浓度超标统计 -->
                    <el-card class="dashboard-card pm25-stats">
                        <template #header>
                            <div class="card-header">
                                <span>PM2.5浓度超标统计</span>
                            </div>
                        </template>
                        <div v-if="loading.province" class="loading-container">
                            <el-skeleton :rows="3" animated />
                        </div>
                        <div v-else class="chart-container" ref="pm25ChartRef"></div>
                    </el-card>

                    <!-- CO一氧化碳浓度超标统计 -->
                    <el-card class="dashboard-card co-stats">
                        <template #header>
                            <div class="card-header">
                                <span>CO一氧化碳浓度超标统计</span>
                            </div>
                        </template>
                        <div v-if="loading.province" class="loading-container">
                            <el-skeleton :rows="3" animated />
                        </div>
                        <div v-else class="chart-container" ref="coChartRef"></div>
                    </el-card>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, onActivated, nextTick } from 'vue'
import request from '@/api/request'
import * as echarts from 'echarts'
import dayjs from 'dayjs'
import { InfoFilled } from '@element-plus/icons-vue'

// 定义响应式数据
const currentTime = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
const loading = ref({
    province: true,
    level: true,
    trend: true,
    realtime: true,
})

// 图表引用
const mapChartRef = ref(null)
const provinceChartRef = ref(null)
const levelChartRef = ref(null)
const trendChartRef = ref(null)
const so2ChartRef = ref(null)
const pm25ChartRef = ref(null)
const coChartRef = ref(null)

// 图表实例
let mapChart = null
let provinceChart = null
let levelChart = null
let trendChart = null
let so2Chart = null
let pm25Chart = null
let coChart = null

// 数据存储
const provinceStats = ref([])
const levelStats = ref([])
const trendStats = ref([])
const realtimeStats = ref({
    totalCount: 0,
    goodCount: 0,
    exceedingCount: 0,
    goodPercent: 0,
    exceedPercent: 0,
})

// 定时器
let refreshTimer = null

// 获取省分组统计数据
const fetchProvinceStats = async () => {
    try {
        const response = await request.get('/admin/stats/province')
        console.log('省份统计数据响应:', response)
        if (response.success) {
            provinceStats.value = response.data
            console.log('省份统计数据:', provinceStats.value)
            nextTick(() => {
                initChinaMap()
                initProvinceChart()
                initSO2Chart()
                initPM25Chart()
                initCOChart()
            })
        } else {
            console.error('获取省份统计数据失败:', response.message)
        }
    } catch (error) {
        console.error('获取省份统计数据失败:', error)
    } finally {
        loading.value.province = false
    }
}

// 获取AQI指数分布统计
const fetchLevelStats = async () => {
    try {
        const response = await request.get('/admin/stats/aqi-level')
        console.log('AQI指数分布统计响应:', response)
        if (response.success) {
            // 确保所有AQI等级都存在，并使用中文名称
            const aqiLevelMap = {
                1: '优',
                2: '良',
                3: '轻度污染',
                4: '中度污染',
                5: '重度污染',
                6: '严重污染',
            }

            const processedData = []

            // 创建一个包含所有等级的完整数据集
            for (let i = 1; i <= 6; i++) {
                // 查找后端返回的对应等级数据
                const existingData = response.data.find((item) => item.level_value === i)

                if (existingData) {
                    // 确保使用映射表中的中文名称
                    processedData.push({
                        ...existingData,
                        level: aqiLevelMap[i] || existingData.level,
                    })
                } else {
                    // 如果不存在该等级，添加默认数据
                    processedData.push({
                        level: aqiLevelMap[i],
                        level_value: i,
                        count: 0,
                    })
                }
            }

            // 按等级值排序
            levelStats.value = processedData.sort((a, b) => a.level_value - b.level_value)

            nextTick(() => {
                initLevelChart()
            })
        }
    } catch (error) {
        console.error('获取AQI指数分布统计数据失败:', error)
    } finally {
        loading.value.level = false
    }
}

// 获取AQI指数趋势统计
const fetchTrendStats = async () => {
    try {
        const response = await request.get('/admin/stats/aqi-trend')
        console.log('AQI指数趋势统计响应:', response)
        if (response.success) {
            // 按月份排序
            trendStats.value = response.data.sort((a, b) => {
                return new Date(a.month) - new Date(b.month)
            })
            nextTick(() => {
                initTrendChart()
            })
        }
    } catch (error) {
        console.error('获取AQI指数趋势统计数据失败:', error)
    } finally {
        loading.value.trend = false
    }
}

// 获取实时统计数据
const fetchRealtimeStats = async () => {
    try {
        const response = await request.get('/admin/stats/aqi-realtime')
        console.log('实时统计数据响应:', response)
        if (response.success) {
            const data = response.data
            realtimeStats.value = {
                ...data,
                goodPercent:
                    data.totalCount > 0 ? Math.round((data.goodCount / data.totalCount) * 100) : 0,
                exceedPercent:
                    data.totalCount > 0
                        ? Math.round((data.exceedingCount / data.totalCount) * 100)
                        : 0,
            }
        }
    } catch (error) {
        console.error('获取空气质量检测数量实时统计数据失败:', error)
    } finally {
        loading.value.realtime = false
    }
}

// 初始化中国地图
const initChinaMap = async () => {
    console.log('初始化中国地图, ref:', mapChartRef.value, '数据:', provinceStats.value)
    if (!mapChartRef.value) {
        console.error('地图容器引用不存在')
        return
    }

    if (mapChart) {
        mapChart.dispose()
    }

    mapChart = echarts.init(mapChartRef.value)

    try {
        // 动态加载中国地图JSON数据
        const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
        const chinaGeoJson = await response.json()
        
        // 注册地图
        echarts.registerMap('china', chinaGeoJson)
        
        // 准备地图数据
        const mapData = provinceStats.value.map(item => ({
            name: item.province_name,
            value: item.aqi_exceed_count,
            provinceId: item.province_id,
            so2Count: item.so2_exceed_count,
            coCount: item.co_exceed_count,
            pm25Count: item.pm25_exceed_count
        }))

        // 计算最大值用于颜色映射
        const maxValue = Math.max(...mapData.map(item => item.value), 1)

        const option = {
            title: {
                text: '全国AQI超标分布',
                left: 'center',
                top: '10px',
                textStyle: {
                    fontSize: 16,
                    color: '#333'
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    if (params.data) {
                        return `
                            <div style="padding: 8px;">
                                <div style="font-weight: bold; margin-bottom: 5px;">${params.data.name}</div>
                                <div>AQI超标: <span style="color: #E91E63; font-weight: bold;">${params.data.value}</span> 次</div>
                                <div>SO2超标: <span style="color: #FF9800;">${params.data.so2Count}</span> 次</div>
                                <div>PM2.5超标: <span style="color: #9C27B0;">${params.data.pm25Count}</span> 次</div>
                                <div>CO超标: <span style="color: #607D8B;">${params.data.coCount}</span> 次</div>
                            </div>
                        `
                    } else {
                        return `${params.name}<br/>暂无数据`
                    }
                }
            },
            visualMap: {
                min: 0,
                max: maxValue,
                left: '20px',
                bottom: '20px',
                text: ['高', '低'],
                calculable: true,
                inRange: {
                    color: ['#e6f3ff', '#cce7ff', '#99d6ff', '#66c2ff', '#33adff', '#0099ff', '#0066cc']
                },
                textStyle: {
                    color: '#333',
                    fontSize: 12
                },
                itemWidth: 15,
                itemHeight: 120
            },
            series: [
                {
                    name: 'AQI超标数量',
                    type: 'map',
                    map: 'china',
                    roam: true,
                    scaleLimit: {
                        min: 0.8,
                        max: 2
                    },
                    zoom: 1.1,
                    center: [104, 37.5],
                    data: mapData,
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1,
                        areaColor: '#f0f0f0'
                    },
                    emphasis: {
                        itemStyle: {
                            areaColor: '#ffa500',
                            borderWidth: 2,
                            borderColor: '#fff'
                        },
                        label: {
                            show: true,
                            color: '#fff',
                            fontSize: 12
                        }
                    },
                    label: {
                        show: false,
                        color: '#333',
                        fontSize: 10
                    }
                }
            ]
        }

        mapChart.setOption(option)
        
    } catch (error) {
        console.error('地图数据加载失败:', error)
        // 显示错误提示
        mapChart.setOption({
            title: {
                text: '地图数据加载失败',
                subtext: '请检查网络连接',
                left: 'center',
                top: 'center',
                textStyle: {
                    fontSize: 16,
                    color: '#999'
                },
                subtextStyle: {
                    fontSize: 12,
                    color: '#ccc'
                }
            }
        })
    }
}

// 初始化省份AQI超标统计图表
const initProvinceChart = () => {
    console.log('初始化省份图表, ref:', provinceChartRef.value, '数据:', provinceStats.value)
    if (!provinceChartRef.value) {
        console.error('省份图表容器引用不存在')
        return
    }

    if (provinceChart) {
        provinceChart.dispose()
    }

    provinceChart = echarts.init(provinceChartRef.value)

    const provinces = provinceStats.value.map((item) => item.province_name)
    const aqiData = provinceStats.value.map((item) => item.aqi_exceed_count)

    const option = {
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
            data: provinces,
            axisLabel: {
                interval: 0,
                rotate: 45,
                fontSize: 10,
            },
        },
        yAxis: {
            type: 'value',
            name: '超标数量',
        },
        series: [
            {
                name: 'AQI超标',
                type: 'bar',
                data: aqiData,
                itemStyle: {
                    color: '#E91E63',
                },
            },
        ],
    }

    provinceChart.setOption(option)
}

// 初始化SO2超标统计图表
const initSO2Chart = () => {
    if (!so2ChartRef.value) return

    if (so2Chart) {
        so2Chart.dispose()
    }

    so2Chart = echarts.init(so2ChartRef.value)

    const provinces = provinceStats.value.map((item) => item.province_name)
    const so2Data = provinceStats.value.map((item) => item.so2_exceed_count)

    const option = {
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
            data: provinces,
            axisLabel: {
                interval: 0,
                rotate: 45,
                fontSize: 10,
            },
        },
        yAxis: {
            type: 'value',
            name: '超标数量',
        },
        series: [
            {
                name: 'SO2超标',
                type: 'bar',
                data: so2Data,
                itemStyle: {
                    color: '#FF9800',
                },
            },
        ],
    }

    so2Chart.setOption(option)
}

// 初始化PM2.5超标统计图表
const initPM25Chart = () => {
    if (!pm25ChartRef.value) return

    if (pm25Chart) {
        pm25Chart.dispose()
    }

    pm25Chart = echarts.init(pm25ChartRef.value)

    const provinces = provinceStats.value.map((item) => item.province_name)
    const pm25Data = provinceStats.value.map((item) => item.pm25_exceed_count)

    const option = {
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
            data: provinces,
            axisLabel: {
                interval: 0,
                rotate: 45,
                fontSize: 10,
            },
        },
        yAxis: {
            type: 'value',
            name: '超标数量',
        },
        series: [
            {
                name: 'PM2.5超标',
                type: 'bar',
                data: pm25Data,
                itemStyle: {
                    color: '#9C27B0',
                },
            },
        ],
    }

    pm25Chart.setOption(option)
}

// 初始化CO超标统计图表
const initCOChart = () => {
    if (!coChartRef.value) return

    if (coChart) {
        coChart.dispose()
    }

    coChart = echarts.init(coChartRef.value)

    const provinces = provinceStats.value.map((item) => item.province_name)
    const coData = provinceStats.value.map((item) => item.co_exceed_count)

    const option = {
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
            data: provinces,
            axisLabel: {
                interval: 0,
                rotate: 45,
                fontSize: 10,
            },
        },
        yAxis: {
            type: 'value',
            name: '超标数量',
        },
        series: [
            {
                name: 'CO超标',
                type: 'bar',
                data: coData,
                itemStyle: {
                    color: '#F44336',
                },
            },
        ],
    }

    coChart.setOption(option)
}

// 初始化AQI指数分布统计图表
const initLevelChart = () => {
    if (!levelChartRef.value) return

    if (levelChart) {
        levelChart.dispose()
    }

    levelChart = echarts.init(levelChartRef.value)

    const levels = levelStats.value.map((item) => item.level)
    const counts = levelStats.value.map((item) => item.count)

    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)',
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            data: levels,
            textStyle: {
                fontSize: 10,
            },
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
                    formatter: '{b}: {c}',
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '12',
                        fontWeight: 'bold',
                    },
                },
                data: levelStats.value.map((item) => ({
                    name: item.level,
                    value: item.count,
                })),
            },
        ],
    }

    levelChart.setOption(option)
}

// 初始化AQI指数趋势统计图表
const initTrendChart = () => {
    if (!trendChartRef.value) return

    if (trendChart) {
        trendChart.dispose()
    }

    trendChart = echarts.init(trendChartRef.value)

    const months = trendStats.value.map((item) => item.month)
    const exceedCounts = trendStats.value.map((item) => item.exceed_count)

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line',
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
                fontSize: 10,
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
                itemStyle: {
                    color: '#ff4949',
                },
                lineStyle: {
                    width: 2,
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

    trendChart.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
    mapChart?.resize()
    provinceChart?.resize()
    levelChart?.resize()
    trendChart?.resize()
    so2Chart?.resize()
    pm25Chart?.resize()
    coChart?.resize()
}

// 刷新所有数据
const refreshAllData = () => {
    currentTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
    fetchProvinceStats()
    fetchLevelStats()
    fetchTrendStats()
    fetchRealtimeStats()
}

// 组件挂载时获取数据
onMounted(() => {
    // 初始加载数据
    refreshAllData()

    // 设置定时刷新
    refreshTimer = setInterval(refreshAllData, 50000) 

    // 添加窗口大小变化监听
    window.addEventListener('resize', handleResize)
})

// 当组件被激活时刷新数据（适用于使用keep-alive的情况）
onActivated(() => {
    // 每次进入页面时刷新数据
    refreshAllData()
})

// 组件卸载时清理资源
onUnmounted(() => {
    // 清除定时器
    if (refreshTimer) {
        clearInterval(refreshTimer)
    }

    // 移除事件监听
    window.removeEventListener('resize', handleResize)

    // 销毁图表实例
    mapChart?.dispose()
    provinceChart?.dispose()
    levelChart?.dispose()
    trendChart?.dispose()
    so2Chart?.dispose()
    pm25Chart?.dispose()
    coChart?.dispose()
})
</script>

<style scoped>
.dashboard-container {
    padding: 20px;
    background-color: #f0f2f5;
    min-height: 100vh;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.dashboard-header h1 {
    margin: 0;
    color: #303133;
    font-size: 24px;
}

.refresh-info {
    display: flex;
    align-items: center;
}

.refresh-time {
    margin-left: 10px;
    color: #606266;
}

/* 三列布局样式 */
.dashboard-layout {
    display: flex;
    gap: 20px;
    height: calc(100vh - 100px);
}

.dashboard-side {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow-y: auto;
    max-height: 100%;
    padding-right: 5px; /* 为滚动条预留空间 */
}

.dashboard-center {
    flex: 2;
    max-height: 100%;
    overflow-y: auto;
    padding-right: 5px; /* 为滚动条预留空间 */
}

/* 中国地图卡片特殊样式 */
.dashboard-card.china-map {
    height: 100%;
    margin-bottom: 0;
}

.dashboard-card {
    margin-bottom: 0;
    min-height: 350px;
    display: flex;
    flex-direction: column;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
}

.loading-container {
    padding: 20px;
    height: 100%;
    display: flex;
    align-items: center;
}

.chart-container {
    flex: 1;
    width: 100%;
    min-height: 280px;
    overflow: auto; /* 添加滚动条 */
}

/* 中国地图图表容器特殊样式 */
.china-map .chart-container {
    flex: 1;
    min-height: 430px;
    overflow: auto; /* 添加滚动条 */
}

.realtime-data {
    display: flex;
    justify-content: space-around;
    align-items: center;
    min-height: 280px;
    flex: 1;
    overflow: auto; /* 添加滚动条 */
}

.data-card {
    text-align: center;
    padding: 20px;
    border-radius: 8px;
    width: 30%;
    height: 80%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.data-card.total {
    background-color: #409eff;
    color: white;
}

.data-card.good {
    background-color: #67c23a;
    color: white;
}

.data-card.exceed {
    background-color: #f56c6c;
    color: white;
}

.data-value {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 10px;
}

.data-label {
    font-size: 16px;
    margin-bottom: 10px;
}

.data-percent {
    font-size: 20px;
    font-weight: bold;
}

/* Element Plus行间距 */
.mt-20 {
    margin-top: 20px;
}

/* 响应式布局 */
@media (max-width: 1400px) {
    .dashboard-layout {
        flex-direction: column;
        height: auto;
    }
    
    .dashboard-side, .dashboard-center {
        flex: none;
        width: 100%;
        max-height: none;
        overflow: visible;
    }
    
    .dashboard-card.china-map {
        min-height: 500px;
    }
    
    .chart-container {
        overflow: auto;
    }
}
</style>
