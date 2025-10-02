module.exports = {
  apps: [{
    name: 'jockecorp-api',
    script: 'server.js',         // adapte: dist/server.js si build
    instances: 1,
    autorestart: true,
    watch: false,
    env: { NODE_ENV: 'production' }
  }]
}
