/**
 * API 响应的通用类型定义
 */

// 通用API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

// 登录响应数据
export interface LoginResponse {
  message: string
  token: string
}