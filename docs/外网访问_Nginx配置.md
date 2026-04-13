# 新增 Nginx 配置 - 用于外网访问6个子应用
# 建议使用独立端口如 8080 或 8090

# ========== 方案1: 独立端口方案 ==========
# 在 /etc/nginx/conf.d/ 下创建 subapps-frontend.conf

server {
    listen 8080;  # 独立端口，不影响现有配置
    server_name _;

    # 门户首页
    location / {
        proxy_pass http://100.85.108.21:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 营销域子应用
    location /mkt/ {
        proxy_pass http://100.85.108.21:5177/mkt/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 通用域子应用
    location /admin/ {
        proxy_pass http://100.85.108.21:5182/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 数据资产域
    location /asset/ {
        proxy_pass http://100.85.108.21:5179/asset/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 数据探索域
    location /dex/ {
        proxy_pass http://100.85.108.21:5180/dex/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 数据管理域
    location /dmt/ {
        proxy_pass http://100.85.108.21:5181/dmt/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 数字风险域
    location /risk/ {
        proxy_pass http://100.85.108.21:5176/risk/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}


# ========== 方案2: 子路径方案 (推荐) ==========
# 在现有 server 中添加 /subapps/ 路径

# location /subapps/ {
#     rewrite ^/subapps/(.*)$ /$1 break;
#     proxy_pass http://100.85.108.21:3002;
#     # 或者单独转发各个子应用
# }