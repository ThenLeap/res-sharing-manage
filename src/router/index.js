import Vue from 'vue'
import VueRouter from 'vue-router'
import UserLogin from '../components/UserLogin.vue'
import ManageHome from '../components/ManageHome.vue'
import WelcomeHome from '@/components/WelcomeHome.vue'
import UserList from '@/components/user/UserList.vue'
import CheckDocument from '@/components/check/CheckDocument.vue'
import CheckCourse from '@/components/check/CheckCourse.vue'
import CheckVideo from '@/components/check/CheckVideo.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    component: UserLogin
  },
  {
    path: '/',
    redirect: 'login'
  },
  {
    path: '/home',
    component: ManageHome,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: WelcomeHome
      },
      {
        path: '/user/list',
        component: UserList
      },
      {
        path: '/document/check',
        component: CheckDocument
      },
      {
        path: '/course/check',
        component: CheckCourse
      },
      {
        path: '/video/check',
        component: CheckVideo
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫 实现 页面访问权限
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  //     next()  放行    next('/login')  强制跳转

  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
