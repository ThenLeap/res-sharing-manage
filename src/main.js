import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 导入全局样式表
import './assets/css/global.css'

// 导入字体图标
import './assets/fonts/iconfont.css'

// 导入axios
import axios from 'axios'

import TreeTable from 'vue-table-with-tree-grid'

// 关闭生产提示
Vue.config.productionTip = false
// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8866/admin/api'
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers['Auth-Token'] = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})
Vue.prototype.$http = axios
Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
