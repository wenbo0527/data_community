export default {
  apps: [{
    name: 'dfd-app',
    script: './node_modules/.bin/vite',
    args: '--port 5185 --host',
    cwd: '/Users/wenbo/Documents/project/data_community/apps/dfd-app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'development'
    }
  }]
}
