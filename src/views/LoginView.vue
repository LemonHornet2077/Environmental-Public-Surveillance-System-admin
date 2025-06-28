<template>
    <div class="login-container">
        <el-card class="login-card">
            <template #header>
                <div class="card-header">
                    <span>环保公众监督系统 - 管理员登录</span>
                </div>
            </template>
            <el-form
                ref="loginFormRef"
                :model="loginForm"
                :rules="loginRules"
                label-width="100px"
                @keyup.enter="handleLogin"
            >
                <el-form-item label="管理员账户" prop="admin_code">
                    <el-input v-model="loginForm.admin_code" placeholder="请输入管理员账户"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input
                        v-model="loginForm.password"
                        type="password"
                        placeholder="请输入密码"
                        show-password
                    ></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleLogin" :loading="loading"
                        >登录</el-button
                    >
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import request from '@/api/request'
import type { LoginResponse } from '@/api/types'

const router = useRouter()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
    admin_code: '',
    password: '',
})

const loginRules = reactive<FormRules>({
    admin_code: [{ required: true, message: '请输入管理员账户', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
})

const handleLogin = async () => {
    if (!loginFormRef.value) return
    await loginFormRef.value.validate(async (valid) => {
        if (valid) {
            loading.value = true
            try {
                const response = await request.post<LoginResponse>('/auth/admin/login', {
                    admin_code: loginForm.admin_code,
                    password: loginForm.password,
                })

                // 由于axios响应拦截器返回的是 response.data，所以需要类型断言
                const data = response as unknown as LoginResponse
                if (data && data.token) {
                    localStorage.setItem('token', data.token)
                    ElMessage.success('登录成功')
                    await router.push('/')
                } else {
                    ElMessage.error(data.message || '登录失败，请检查返回数据')
                }
            } catch (error) {
                // 错误消息已由axios拦截器处理
                console.error('Login failed:', error)
            } finally {
                loading.value = false
            }
        } else {
            ElMessage.error('请填写完整的登录信息')
        }
    })
}
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f2f5;
}

.login-card {
    width: 450px;
}

.card-header {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
}

.el-form-item:last-child {
    margin-bottom: 0;
}

.el-button {
    width: 100%;
}
</style>
