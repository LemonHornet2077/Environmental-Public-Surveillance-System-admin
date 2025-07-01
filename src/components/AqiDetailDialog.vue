<template>
    <el-dialog v-model="dialogVisible" title="AQI详情" width="50%" :before-close="handleClose">
        <div v-if="aqiData" class="aqi-detail">
            <el-descriptions :column="1" border>
                <el-descriptions-item label="确认ID">{{ aqiData.id || '-' }}</el-descriptions-item>
                <el-descriptions-item label="网格员ID">{{ aqiData.gm_id || '-' }}</el-descriptions-item>
                <el-descriptions-item label="网格员姓名">{{ aqiData.grid_member_name || '-' }}</el-descriptions-item>
                <el-descriptions-item label="省份">{{ aqiData.province_name || '-' }}</el-descriptions-item>
                <el-descriptions-item label="城市">{{ aqiData.city_name || '-' }}</el-descriptions-item>
                <el-descriptions-item label="详细地址">{{ aqiData.address || '-' }}</el-descriptions-item>
                <el-descriptions-item label="SO2值">{{ aqiData.so2_value || '-' }}</el-descriptions-item>
                <el-descriptions-item label="SO2等级">{{ formatAqiLevel(aqiData.so2_level) }}</el-descriptions-item>
                <el-descriptions-item label="CO值">{{ aqiData.co_value || '-' }}</el-descriptions-item>
                <el-descriptions-item label="CO等级">{{ formatAqiLevel(aqiData.co_level) }}</el-descriptions-item>
                <el-descriptions-item label="SPM值">{{ aqiData.spm_value || '-' }}</el-descriptions-item>
                <el-descriptions-item label="SPM等级">{{ formatAqiLevel(aqiData.spm_level) }}</el-descriptions-item>
                <el-descriptions-item label="AQI等级说明">{{ aqiData.chinese_explain || '-' }}</el-descriptions-item>
                <el-descriptions-item label="确认日期">{{ formatDateTime(aqiData.confirm_date, aqiData.confirm_time) }}</el-descriptions-item>
                <el-descriptions-item label="备注">{{ aqiData.remarks || '-' }}</el-descriptions-item>
            </el-descriptions>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="handleClose">关闭</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from 'vue'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    aqiData: {
        type: Object,
        default: null,
    },
})

const emit = defineEmits(['update:visible', 'close'])

const dialogVisible = ref(props.visible)

// 监听visible属性变化
watch(
    () => props.visible,
    (newVal) => {
        dialogVisible.value = newVal
    },
)

// 监听对话框状态变化
watch(
    () => dialogVisible.value,
    (newVal) => {
        if (!newVal) {
            emit('update:visible', false)
            emit('close')
        }
    },
)

// 格式化日期时间
const formatDateTime = (date: string, time: string) => {
    if (!date) return '-'
    return `${date} ${time || ''}`
}

// 格式化AQI等级
const formatAqiLevel = (level: number | null | undefined | string) => {
    if (level === null || level === undefined) return '-'
    // 如果是字符串，尝试转换为数字
    const numLevel = typeof level === 'string' ? parseInt(level, 10) : level
    if (isNaN(numLevel)) return '-'
    
    const levels = ['优', '良', '轻度污染', '中度污染', '重度污染', '严重污染']
    return numLevel >= 0 && numLevel < levels.length ? levels[numLevel] : `未知(${numLevel})`
}

// 关闭对话框
const handleClose = () => {
    dialogVisible.value = false
}
</script>

<style scoped>
.aqi-detail {
    padding: 20px;
}
</style>
