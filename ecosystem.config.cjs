module.exports = {
  apps: [{
    name: 'cc-switch',
    script: 'server.js',
    env: {
      NODE_ENV: 'production',
    },
    // Restart if memory exceeds 200MB
    max_memory_restart: '200M',
    // Auto-restart on crash
    autorestart: true,
    // Log settings
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    merge_logs: true,
  }],
};
