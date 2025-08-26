<template>
  <a-drawer
    :visible="visible"
    title="App信息"
    width="600px"
    placement="right"
    @close="handleClose"
  >
    <div class="app-info-content">
      <!-- Tab切换 -->
      <a-tabs v-model:active-key="activeTab" class="info-tabs">
        <!-- APP信息Tab -->
        <a-tab-pane key="apps" title="APP信息">
          <div v-if="appList.length > 0">
            <!-- APP列表 -->
            <div class="app-list">
              <div 
                v-for="app in paginatedApps" 
                :key="app.id" 
                class="app-item"
              >
                <div class="app-header">
                  <icon-apps :size="20" />
                  <span class="app-name">{{ getAppName(app.packageName) }}</span>
                  <a-tag :color="getAppStatusColor(app.status)">{{ app.status }}</a-tag>
                </div>
                
                <!-- 设备信息 -->
                <div class="info-section">
                  <h5 class="section-subtitle">
                    <icon-mobile :size="14" />
                    设备信息
                  </h5>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="label">设备名称:</span>
                      <span class="value">{{ app.deviceName || '未知设备' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">设备品牌:</span>
                      <span class="value">{{ app.brand || '未知品牌' }}</span>
                    </div>
                  </div>
                </div>

                <!-- WIFI信息 -->
                <div class="info-section">
                  <h5 class="section-subtitle">
                    <icon-wifi :size="14" />
                    WIFI信息
                  </h5>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="label">WIFI名称:</span>
                      <span class="value">{{ app.ssid || '未连接' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">BSSID:</span>
                      <span class="value">{{ app.bssid || '未知' }}</span>
                    </div>
                  </div>
                </div>

                <!-- 位置信息 -->
                <div class="info-section">
                  <h5 class="section-subtitle">
                    <icon-location :size="14" />
                    位置信息
                  </h5>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="label">经度:</span>
                      <span class="value">{{ app.lon || '未知' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">纬度:</span>
                      <span class="value">{{ app.lat || '未知' }}</span>
                    </div>
                    <div class="info-item full-width">
                      <span class="label">家庭地址:</span>
                      <span class="value">{{ app.homeAddress || '未知地址' }}</span>
                    </div>
                    <div class="info-item full-width">
                      <span class="label">GPS地址:</span>
                      <span class="value">{{ app.gpsAddress || '未知地址' }}</span>
                    </div>
                  </div>
                </div>

                <!-- 应用信息 -->
                <div class="info-section">
                  <h5 class="section-subtitle">
                    <icon-code :size="14" />
                    应用信息
                  </h5>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="label">版本号:</span>
                      <span class="value">{{ app.versionName || '未知版本' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">包名:</span>
                      <span class="value">{{ app.packageName || '未知' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">首次安装:</span>
                      <span class="value">{{ formatDate(app.firstInstallTime) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="label">最近更新:</span>
                      <span class="value">{{ formatDate(app.lastUpdateTime) }}</span>
                    </div>
                  </div>
                </div>

                <!-- 备注信息 -->
                <div class="info-section" v-if="app.extraParams">
                  <h5 class="section-subtitle">
                    <icon-user :size="14" />
                    备注信息
                  </h5>
                  <div class="info-grid">
                    <div class="info-item" v-if="app.extraParams.name">
                      <span class="label">姓名:</span>
                      <span class="value">{{ app.extraParams.name }}</span>
                    </div>
                    <div class="info-item" v-if="app.extraParams.phone">
                      <span class="label">号码:</span>
                      <span class="value">{{ app.extraParams.phone }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- APP信息分页 -->
            <div class="pagination-wrapper">
              <a-pagination
                v-model:current="appPagination.current"
                :total="appList.length"
                :page-size="appPagination.pageSize"
                :show-total="true"
                :show-jumper="true"
                size="small"
                @change="handleAppPageChange"
              />
            </div>
          </div>
          
          <!-- APP信息空状态 -->
          <div v-else class="empty-state">
            <icon-apps :size="48" style="color: #c9cdd4;" />
            <h3>暂无APP信息</h3>
            <p>该产品暂未提供APP相关信息</p>
          </div>
        </a-tab-pane>
        
        <!-- 通讯录Tab -->
        <a-tab-pane key="contacts" title="通讯录">
          <div v-if="contactList.length > 0">
            <!-- 通讯录列表 -->
            <div class="contact-list">
              <div 
                v-for="contact in paginatedContacts" 
                :key="contact.id" 
                class="contact-item"
              >
                <div class="contact-header">
                  <icon-user :size="20" />
                  <span class="contact-name">{{ contact.name || '未知联系人' }}</span>
                  <a-tag v-if="contact.relationship" color="blue">{{ contact.relationship }}</a-tag>
                </div>
                
                <div class="contact-info">
                  <div class="info-item">
                    <span class="label">手机号:</span>
                    <span class="value">{{ contact.phone || '未知' }}</span>
                  </div>
                  <div class="info-item" v-if="contact.email">
                    <span class="label">邮箱:</span>
                    <span class="value">{{ contact.email }}</span>
                  </div>
                  <div class="info-item" v-if="contact.address">
                    <span class="label">地址:</span>
                    <span class="value">{{ contact.address }}</span>
                  </div>
                  <div class="info-item" v-if="contact.lastContactTime">
                    <span class="label">最后联系:</span>
                    <span class="value">{{ formatDate(contact.lastContactTime) }}</span>
                  </div>
                  <div class="info-item" v-if="contact.contactFrequency">
                    <span class="label">联系频次:</span>
                    <span class="value">{{ contact.contactFrequency }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 通讯录分页 -->
            <div class="pagination-wrapper">
              <a-pagination
                v-model:current="contactPagination.current"
                :total="contactList.length"
                :page-size="contactPagination.pageSize"
                :show-total="true"
                :show-jumper="true"
                size="small"
                @change="handleContactPageChange"
              />
            </div>
          </div>
          
          <!-- 通讯录空状态 -->
          <div v-else class="empty-state">
            <icon-user :size="48" style="color: #c9cdd4;" />
            <h3>暂无通讯录信息</h3>
            <p>该产品暂未提供通讯录相关信息</p>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </a-drawer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  IconMobile, 
  IconWifi, 
  IconLocation, 
  IconApps, 
  IconUser,
  IconCode,
  IconExclamationCircle 
} from '@arco-design/web-vue/es/icon'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  appInfo: {
    type: Object,
    default: null
  }
})

// 响应式数据
const activeTab = ref('apps')

// APP信息分页
const appPagination = ref({
  current: 1,
  pageSize: 3,
  total: 0
})

// 通讯录分页
const contactPagination = ref({
  current: 1,
  pageSize: 5,
  total: 0
})

// Mock数据
const appList = ref([
  {
    id: 1,
    packageName: 'com.sudai.app',
    deviceName: 'iPhone 13 Pro',
    brand: 'Apple',
    ssid: 'Home_WiFi_5G',
    bssid: '00:11:22:33:44:55',
    lon: '116.397128',
    lat: '39.916527',
    homeAddress: '北京市朝阳区建国门外大街1号',
    gpsAddress: '北京市朝阳区建国门外大街1号国贸大厦',
    versionName: '3.2.1',
    firstInstallTime: '2024-01-15T10:30:00Z',
    lastUpdateTime: '2024-01-20T14:20:00Z',
    status: '正常',
    extraParams: {
      name: '张三',
      phone: '13800138000'
    }
  },
  {
    id: 2,
    packageName: 'com.tencent.mm',
    deviceName: 'Xiaomi 13',
    brand: 'Xiaomi',
    ssid: 'Office_WiFi',
    bssid: '00:22:33:44:55:66',
    lon: '116.407395',
    lat: '39.904211',
    homeAddress: '北京市西城区西长安街1号',
    gpsAddress: '北京市西城区西长安街1号天安门广场',
    versionName: '8.0.32',
    firstInstallTime: '2023-12-01T09:15:00Z',
    lastUpdateTime: '2024-01-18T16:45:00Z',
    status: '正常'
  },
  {
    id: 3,
    packageName: 'com.ant.alipay',
    deviceName: 'Samsung Galaxy S23',
    brand: 'Samsung',
    ssid: 'Public_WiFi',
    bssid: '00:33:44:55:66:77',
    lon: '121.473701',
    lat: '31.230416',
    homeAddress: '上海市浦东新区陆家嘴环路1000号',
    gpsAddress: '上海市浦东新区陆家嘴环路1000号恒生银行大厦',
    versionName: '10.3.20',
    firstInstallTime: '2023-11-20T11:00:00Z',
    lastUpdateTime: '2024-01-22T13:30:00Z',
    status: '异常'
  },
  {
    id: 4,
    packageName: 'com.jd.jdmobile',
    deviceName: 'Huawei P50 Pro',
    brand: 'Huawei',
    ssid: 'Home_2.4G',
    bssid: '00:44:55:66:77:88',
    lon: '116.383331',
    lat: '39.911146',
    homeAddress: '北京市东城区王府井大街138号',
    gpsAddress: '北京市东城区王府井大街138号北京APM',
    versionName: '11.4.2',
    firstInstallTime: '2024-01-05T15:20:00Z',
    lastUpdateTime: '2024-01-25T10:10:00Z',
    status: '正常'
  }
])

const contactList = ref([
  {
    id: 1,
    name: '李四',
    phone: '13900139000',
    email: 'lisi@example.com',
    relationship: '朋友',
    address: '北京市海淀区中关村大街1号',
    lastContactTime: '2024-01-20T14:30:00Z',
    contactFrequency: '经常'
  },
  {
    id: 2,
    name: '王五',
    phone: '13700137000',
    relationship: '同事',
    address: '北京市朝阳区三里屯路19号',
    lastContactTime: '2024-01-18T09:15:00Z',
    contactFrequency: '偶尔'
  },
  {
    id: 3,
    name: '赵六',
    phone: '13600136000',
    email: 'zhaoliu@example.com',
    relationship: '家人',
    lastContactTime: '2024-01-22T20:00:00Z',
    contactFrequency: '每天'
  },
  {
    id: 4,
    name: '钱七',
    phone: '13500135000',
    relationship: '客户',
    address: '上海市黄浦区南京东路100号',
    lastContactTime: '2024-01-15T16:45:00Z',
    contactFrequency: '很少'
  },
  {
    id: 5,
    name: '孙八',
    phone: '13400134000',
    email: 'sunba@example.com',
    relationship: '朋友',
    lastContactTime: '2024-01-19T12:20:00Z',
    contactFrequency: '经常'
  },
  {
    id: 6,
    name: '周九',
    phone: '13300133000',
    relationship: '同学',
    address: '广州市天河区天河路208号',
    lastContactTime: '2024-01-21T18:30:00Z',
    contactFrequency: '偶尔'
  }
])

// 计算属性
const paginatedApps = computed(() => {
  const start = (appPagination.value.current - 1) * appPagination.value.pageSize
  const end = start + appPagination.value.pageSize
  return appList.value.slice(start, end)
})

const paginatedContacts = computed(() => {
  const start = (contactPagination.value.current - 1) * contactPagination.value.pageSize
  const end = start + contactPagination.value.pageSize
  return contactList.value.slice(start, end)
})

// Emits
const emit = defineEmits(['close'])

// 方法
const handleClose = () => {
  emit('close')
}

const getAppName = (packageName) => {
  if (!packageName) return '未知应用'
  
  const appNameMap = {
    'com.sudai.app': 'Su贷',
    'com.ant.alipay': '支付宝',
    'com.jd.jdmobile': '京东金融',
    'com.tencent.mm': '微信'
  }
  
  return appNameMap[packageName] || packageName
}

const getAppStatusColor = (status) => {
  const colorMap = {
    '正常': 'green',
    '异常': 'red',
    '未知': 'gray'
  }
  return colorMap[status] || 'gray'
}

// 分页处理方法
const handleAppPageChange = (page) => {
  appPagination.value.current = page
}

const handleContactPageChange = (page) => {
  contactPagination.value.current = page
}

const formatDate = (dateString) => {
  if (!dateString) return '未知时间'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch (error) {
    return dateString
  }
}
</script>

<style scoped>
.app-info-content {
  padding: 0;
}

.info-tabs {
  height: 100%;
}

.app-list,
.contact-list {
  max-height: 500px;
  overflow-y: auto;
}

.app-item,
.contact-item {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.app-header,
.contact-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.app-name,
.contact-name {
  font-weight: 600;
  color: #1d2129;
  flex: 1;
}

.contact-info {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.info-section {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e8e8e8;
}

.info-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-subtitle {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #4e5969;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}



.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 8px 0;
}

.info-item.full-width {
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width .value {
  word-break: break-all;
}

.label {
  color: #86909c;
  font-size: 14px;
  min-width: 80px;
  flex-shrink: 0;
}

.value {
  color: #1d2129;
  font-size: 14px;
  font-weight: 500;
  text-align: right;
  flex: 1;
}

.info-item.full-width .value {
  text-align: left;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #86909c;
  text-align: center;
}

.empty-state h3 {
  margin: 16px 0 8px 0;
  color: #4e5969;
}

.empty-state p {
  margin: 0;
  color: #86909c;
}
</style>