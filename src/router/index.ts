import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: { requiresAuth: true }, // 标记需要认证
            children: [
                {
                    path: 'admin-manage',
                    name: 'admin-manage',
                    component: () => import('../views/AdminManageView.vue'),
                    meta: { requiresAuth: true, title: '管理员管理' }
                },
                {
                    path: 'member-manage',
                    name: 'member-manage',
                    component: () => import('../views/MemberManageView.vue'),
                    meta: { requiresAuth: true, title: '网格员管理' }
                },
                {
                    path: 'supervisor-manage',
                    name: 'supervisor-manage',
                    component: () => import('../views/SupervisorManageView.vue'),
                    meta: { requiresAuth: true, title: '公众监督员管理' }
                },
                {
                    path: 'feedback-list',
                    name: 'feedback-list',
                    component: () => import('../views/FeedbackListView.vue'),
                    meta: { requiresAuth: true, title: '公众监督数据列表' }
                },
                {
                    path: 'aqi-confirmed-list',
                    name: 'aqi-confirmed-list',
                    component: () => import('../views/AqiConfirmedListView.vue'),
                    meta: { requiresAuth: true, title: '网格员确认AQI数据列表' }
                },
                {
                    path: 'stats-province',
                    name: 'stats-province',
                    component: () => import('../views/stats/ProvinceStatsView.vue'),
                    meta: { requiresAuth: true, title: '省分组检查统计' }
                },
                {
                    path: 'stats-aqi-level',
                    name: 'stats-aqi-level',
                    component: () => import('../views/stats/AqiLevelStatsView.vue'),
                    meta: { requiresAuth: true, title: 'AQI指数分布统计' }
                },
                {
                    path: 'stats-aqi-trend',
                    name: 'stats-aqi-trend',
                    component: () => import('../views/stats/AqiTrendStatsView.vue'),
                    meta: { requiresAuth: true, title: 'AQI指数趋势统计' }
                },
                {
                    path: 'stats-aqi-realtime',
                    name: 'stats-aqi-realtime',
                    component: () => import('../views/stats/AqiRealtimeStatsView.vue'),
                    meta: { requiresAuth: true, title: '空气质量检测数量实时统计' }
                }
            ]
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('../views/dashboard/DashboardView.vue'),
            meta: { requiresAuth: true, title: '数据可视化大屏' }
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue'),
        },
    ],
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('token')

    if (to.meta.requiresAuth && !isAuthenticated) {
        // 如果目标路由需要认证但用户未登录，则重定向到登录页
        next({ name: 'login' })
    } else {
        // 否则，正常导航
        next()
    }
})

export default router
