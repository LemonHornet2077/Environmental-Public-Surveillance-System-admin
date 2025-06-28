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
                }
            ]
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
