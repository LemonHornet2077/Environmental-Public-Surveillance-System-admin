<template>
    <el-dialog v-model="dialogVisible" title="反馈详情" width="50%" :before-close="handleClose">
        <div v-if="feedbackData" class="feedback-detail">
            <el-descriptions :column="1" border>
                <el-descriptions-item label="反馈ID">{{ feedbackData.id || '-' }}</el-descriptions-item>
                <el-descriptions-item label="监督员姓名">{{
                    feedbackData.supervisor_name || '-'
                }}</el-descriptions-item>
                <el-descriptions-item label="监督员电话">{{
                    feedbackData.tel_id || '-'
                }}</el-descriptions-item>
                <el-descriptions-item label="省份">{{
                    feedbackData.province_name || '-'
                }}</el-descriptions-item>
                <el-descriptions-item label="城市">{{
                    feedbackData.city_name || '-'
                }}</el-descriptions-item>
                <el-descriptions-item label="详细地址">{{
                    feedbackData.address || '-'
                }}</el-descriptions-item>
                <el-descriptions-item label="反馈信息">{{
                    feedbackData.information || '-'
                }}</el-descriptions-item>
                <el-descriptions-item label="预估空气质量等级">{{
                    formatAqiLevel(feedbackData.estimated_grade)
                }}</el-descriptions-item>
                <el-descriptions-item label="提交日期">{{
                    formatDateTime(feedbackData.af_date, feedbackData.af_time)
                }}</el-descriptions-item>
                <el-descriptions-item label="状态">{{
                    formatStatus(feedbackData.state)
                }}</el-descriptions-item>
                <el-descriptions-item label="备注">{{
                    feedbackData.remarks || '-'
                }}</el-descriptions-item>
            </el-descriptions>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button v-if="feedbackData && feedbackData.state === 0" type="primary" @click="showAssignDialog">指派任务</el-button>
                <el-button @click="handleClose">关闭</el-button>
            </span>
        </template>
        
        <!-- 指派任务对话框 -->
        <el-dialog v-model="assignDialogVisible" title="指派任务" width="30%" append-to-body>
            <el-form :model="assignForm" label-width="100px" :rules="assignRules" ref="assignFormRef">
                <el-form-item label="反馈ID" prop="feedback_id">
                    <el-input v-model="assignForm.feedback_id" disabled></el-input>
                </el-form-item>
                <el-form-item label="异地指派" prop="remote_assign">
                    <el-switch v-model="remoteAssign" @change="handleRemoteAssignChange" />
                    <span style="margin-left: 10px; color: #909399; font-size: 12px">
                        {{ remoteAssign ? '允许指派给其他地区的网格员' : '仅指派给当前地区的网格员' }}
                    </span>
                </el-form-item>
                <el-form-item label="选择网格员" prop="grid_member_id">
                    <el-select v-model="assignForm.grid_member_id" placeholder="请选择网格员" filterable>
                        <el-option 
                            v-for="member in displayGridMembers" 
                            :key="member.id" 
                            :label="`${member.real_name} (${member.province_name}-${member.city_name})`" 
                            :value="member.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注" prop="remarks">
                    <el-input v-model="assignForm.remarks" type="textarea" :rows="3" placeholder="请输入备注信息"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="assignDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitAssign" :loading="submitting">确认指派</el-button>
                </span>
            </template>
        </el-dialog>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, reactive, onMounted, computed } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../api/request'
import type { ApiResponse } from '../api/types'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    feedbackData: {
        type: Object,
        default: null,
    },
})

const emit = defineEmits(['update:visible', 'close', 'refresh'])

const dialogVisible = ref(props.visible)
const assignDialogVisible = ref(false)
const submitting = ref(false)
const gridMembers = ref<any[]>([])
const remoteAssign = ref(false) // 是否允许异地指派
const assignFormRef = ref<FormInstance>()

// 根据异地指派开关过滤显示的网格员列表
const displayGridMembers = computed(() => {
    if (remoteAssign.value) {
        // 异地指派开启，显示所有状态为正常(state=0)的网格员
        return gridMembers.value.filter(member => member.state === 0)
    } else {
        // 异地指派关闭，只显示当前地区且状态正常的网格员
        if (!props.feedbackData) return []
        return gridMembers.value.filter(member => 
            member.province_id == props.feedbackData.province_id && 
            member.city_id == props.feedbackData.city_id && 
            member.state === 0
        )
    }
})

// 指派表单数据
const assignForm = reactive({
    feedback_id: '',
    grid_member_id: '',
    remarks: '',
})

// 表单验证规则
const assignRules = {
    grid_member_id: [
        { required: true, message: '请选择网格员', trigger: 'change' },
    ],
}

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

// 监听feedbackData变化，当打开对话框时加载网格员列表
watch(
    () => props.feedbackData,
    (newVal) => {
        if (newVal) {
            // 重置表单
            assignForm.feedback_id = newVal.id
            assignForm.grid_member_id = ''
            assignForm.remarks = ''
        }
    },
    { immediate: true }
)

// 显示指派任务对话框
const showAssignDialog = () => {
    if (!props.feedbackData) return
    
    // 重置表单和异地指派开关
    assignForm.feedback_id = props.feedbackData.id
    assignForm.grid_member_id = ''
    assignForm.remarks = ''
    remoteAssign.value = false
    
    // 显示对话框
    assignDialogVisible.value = true
    
    // 加载所有网格员
    loadGridMembers()
}

// 处理异地指派开关变化
const handleRemoteAssignChange = (value: boolean) => {
    if (value) {
        ElMessage.warning('异地指派已开启，可以选择任意地区的网格员')
    } else {
        // 如果关闭异地指派，且当前选择的网格员不在当前地区，则清空选择
        if (props.feedbackData && assignForm.grid_member_id) {
            const selectedMember = gridMembers.value.find(m => m.id == assignForm.grid_member_id)
            if (selectedMember && 
                (selectedMember.province_id != props.feedbackData.province_id || 
                 selectedMember.city_id != props.feedbackData.city_id)) {
                assignForm.grid_member_id = ''
                ElMessage.info('已清除选择的异地网格员')
            }
        }
    }
}

// 加载网格员列表
const loadGridMembers = async () => {
    try {
        // 参考 MemberManageView.vue 的实现方式
        const res = await request.get('/admin/member/list')
        gridMembers.value = res.data || []
        
        // 检查是否有可用的网格员
        const hasLocalMembers = displayGridMembers.value.length > 0
        
        if (!hasLocalMembers && !remoteAssign.value) {
            ElMessage.warning('该区域暂无可用的网格员，可尝试开启异地指派')
        }
    } catch (error) {
        console.error('获取网格员列表失败:', error)
        ElMessage.error('获取网格员列表失败')
        gridMembers.value = []
    }
}

// 提交指派任务
const submitAssign = async () => {
    if (!assignFormRef.value) return
    
    await assignFormRef.value.validate(async (valid) => {
        if (!valid) return
        
        try {
            submitting.value = true
            const res = await request.post<ApiResponse>('/admin/feedback/assign', {
                feedback_id: assignForm.feedback_id,
                grid_member_id: assignForm.grid_member_id,
                remarks: assignForm.remarks
            })
            
            if (res.data.success) {
                ElMessage.success('任务指派成功')
                assignDialogVisible.value = false
                emit('refresh') // 通知父组件刷新数据
                dialogVisible.value = false // 关闭详情对话框
            } else {
                ElMessage.error(res.data.message || '任务指派失败')
            }
        } catch (error: any) {
            console.error('任务指派失败:', error)
            ElMessage.error(error.response?.data?.message || '任务指派失败')
        } finally {
            submitting.value = false
        }
    })
}

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

// 格式化状态
const formatStatus = (status: number | null | undefined | string) => {
    if (status === null || status === undefined) return '-'
    // 如果是字符串，尝试转换为数字
    const numStatus = typeof status === 'string' ? parseInt(status, 10) : status
    if (isNaN(numStatus)) return '-'
    
    const statusMap: Record<number, string> = {
        0: '未指派',
        1: '已指派',
        2: '已处理',
    }
    return statusMap[numStatus] || `未知(${numStatus})`
}

// 关闭对话框
const handleClose = () => {
    dialogVisible.value = false
}
</script>

<style scoped>
.feedback-detail {
    padding: 20px;
}
</style>
