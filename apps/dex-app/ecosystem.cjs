module.exports = {
  apps: [{
    name: 'dex-app',
    script: 'npx',
    args: 'vite preview --port 8003 --host',
    cwd: '/Users/wenbo/Documents/project/data_community/apps/dex-app',
    interpreter: 'none',
    autorestart: false,
    watch: false
  }]
}
