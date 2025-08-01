<template>
  <div class="login-container">
    <div class="login-banner">
      <div class="banner-content">
        <img src="/vite.svg" class="logo" alt="logo" />
        <h1 class="title">数字一体化</h1>
        <p class="subtitle">Teaching Integration</p>
      </div>
    </div>
    <div class="login-form">
      <div class="form-container">
        <h2 class="welcome">欢迎登录</h2>
        <a-form :model="form" @submit="handleSubmit" layout="vertical">
          <a-form-item field="username" label="用户名" :rules="[{ required: true, message: '请输入用户名' }]">
            <a-input v-model="form.username" placeholder="请输入用户名" allow-clear>
              <template #prefix>
                <icon-user />
              </template>
            </a-input>
          </a-form-item>
          <a-form-item field="password" label="密码" :rules="[{ required: true, message: '请输入密码' }]">
            <a-input-password v-model="form.password" placeholder="请输入密码" allow-clear>
              <template #prefix>
                <icon-lock />
              </template>
            </a-input-password>
          </a-form-item>
          <div class="form-extra">
            <a-checkbox v-model="form.remember">记住密码</a-checkbox>
            <a-link>忘记密码？</a-link>
          </div>
          <a-button type="primary" html-type="submit" long :loading="loading">登录</a-button>
        </a-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconUser, IconLock } from '@arco-design/web-vue/es/icon'

const router = useRouter()
const loading = ref(false)
const form = reactive({
  username: '',
  password: '',
  remember: false
})

const handleSubmit = async () => {
  loading.value = true
  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    Message.success('登录成功')
    router.push('/home')
  } catch (error) {
    Message.error('登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  width: 100vw;
  height: 100vh;
}

.login-banner {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(163.85deg, #1d2129 0%, #00308f 100%);
}

.banner-content {
  text-align: center;
  color: white;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 24px;
}

.title {
  font-size: 36px;
  font-weight: 500;
  margin: 0 0 8px;
}

.subtitle {
  font-size: 16px;
  opacity: 0.8;
  margin: 0;
}

.login-form {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-1);
}

.form-container {
  width: 360px;
}

.welcome {
  font-size: 24px;
  font-weight: 500;
  margin: 0 0 40px;
  text-align: center;
}

.form-extra {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
</style>