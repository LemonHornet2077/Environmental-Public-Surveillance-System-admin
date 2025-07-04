<template>
    <div class="home-container">
        <el-container>
            <el-header>
                <div class="header-content">
                    <h1>环保公众监督系统 - 管理面板</h1>
                    <el-button type="danger" @click="handleLogout">退出登录</el-button>
                </div>
            </el-header>
            <el-container>
                <el-aside width="250px">
                    <el-menu
                        :default-active="activeMenu"
                        class="el-menu-vertical"
                        background-color="#545c64"
                        text-color="#fff"
                        active-text-color="#ffd04b"
                    >
                        <template v-for="(item, index) in menuItems" :key="index">
                            <!-- 没有子菜单的菜单项 -->
                            <el-menu-item 
                                v-if="!item.children" 
                                :index="item.path?.substring(1) || ''"
                                @click="handleMenuClick(item.path || '')"
                            >
                                <i v-if="item.icon" :class="item.icon"></i>
                                <span>{{ item.title }}</span>
                            </el-menu-item>
                            
                            <!-- 有子菜单的菜单项 -->
                            <el-sub-menu 
                                v-else 
                                :index="'submenu-' + index"
                            >
                                <template #title>
                                    <i v-if="item.icon" :class="item.icon"></i>
                                    <span>{{ item.title }}</span>
                                </template>
                                <el-menu-item 
                                    v-for="(subItem, subIndex) in item.children" 
                                    :key="subIndex"
                                    :index="subItem.path?.substring(1) || ''"
                                    @click="handleMenuClick(subItem.path || '')"
                                >
                                    <span>{{ subItem.title }}</span>
                                </el-menu-item>
                            </el-sub-menu>
                        </template>
                    </el-menu>
                </el-aside>
                <el-main>
                    <router-view></router-view>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 定义菜单项类型
interface MenuItem {
    path?: string;
    title: string;
    icon?: string;
    children?: MenuItem[];
}

// 当前选中的菜单
// 如果没有选中任何菜单，默认选中第一个
// 如果有选中的菜单，则使用当前路由的路径作为选中的菜单
const activeMenu = ref('admin-manage')

// 导航菜单项
const menuItems = [
    { path: '/dashboard', title: '数据可视化大屏', icon: 'el-icon-monitor' }, // 独立路由，不是子路由
    { path: '/admin-manage', title: '管理员管理', icon: 'el-icon-user' },
    { path: '/member-manage', title: '网格员管理', icon: 'el-icon-s-custom' },
    { path: '/supervisor-manage', title: '公众监督员管理', icon: 'el-icon-s-check' },
    { 
        title: '公众监督数据管理', 
        icon: 'el-icon-data-line',
        children: [
            { path: '/feedback-list', title: '公众监督数据列表' },
            { path: '/aqi-confirmed-list', title: '网格员确认AQI数据列表' }
        ]
    },
    { 
        title: '统计数据管理', 
        icon: 'el-icon-s-data',
        children: [
            { path: '/stats-province', title: '省分组检查统计' },
            { path: '/stats-aqi-level', title: 'AQI指数分布统计' },
            { path: '/stats-aqi-trend', title: 'AQI指数趋势统计' },
            { path: '/stats-aqi-realtime', title: '空气质量检测数量实时统计' }
        ]
    },
]

// 处理退出登录
const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
}

// 处理菜单点击
const handleMenuClick = (path: string) => {
    if (path) {
        router.push(path)
    }
}

// 页面加载时，根据当前路由设置活动菜单
onMounted(() => {
    const currentPath = route.path
    if (currentPath === '/') {
        // 如果是根路径，默认跳转到第一个菜单
        router.push('/admin-manage')
    } else {
        // 否则设置当前路径为活动菜单
        activeMenu.value = currentPath.substring(1) // 去掉前面的斜杠
    }
})
</script>

<style scoped>
.home-container {
    height: 100vh;
    width: 100%;
}

.el-header {
    background-color: #409EFF;
    color: #fff;
    padding: 0 20px;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
}

.el-aside {
    background-color: #545c64;
    color: #fff;
}

.el-menu-vertical {
    border-right: none;
}

.el-main {
    padding: 0;
    background-color: #f0f2f5;
}
</style>
