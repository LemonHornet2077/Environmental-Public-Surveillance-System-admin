import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const service = axios.create({
    baseURL: 'http://localhost:3000/api/v1', // 后端 API 基础 URL
    timeout: 5000, // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        // 在发送请求之前做些什么，比如添加 token
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        // 对请求错误做些什么
        console.log(error) // for debug
        return Promise.reject(error)
    },
)

// 响应拦截器
service.interceptors.response.use(
    (response) => {
        // 对响应数据做点什么
        const res = response.data
        // 后端约定的成功响应不一定需要特殊处理，直接返回数据即可
        return res
    },
    (error) => {
        // 对响应错误做点什么
        console.error('err' + error) // for debug
        ElMessage({
            message: error.response?.data?.error || error.message || 'Error',
            type: 'error',
            duration: 5 * 1000,
        })
        return Promise.reject(error)
    },
)

export default service