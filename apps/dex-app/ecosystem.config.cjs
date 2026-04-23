module.exports = {
  apps: [{
    name: 'dex-app',
    script: '/opt/homebrew/bin/serve',
    args: '-l 8003 -s',
    cwd: '/Users/wenbo/Documents/project/data_community/apps/dex-app/dist',
    interpreter: 'none',
    autorestart: false,
    watch: false,
    env: {
      NODE_ENV: 'production'
    }
  }]
}
