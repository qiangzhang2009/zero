#!/bin/bash

# 知几部署脚本

echo "🚀 开始部署知几AI命理平台..."

# 检查Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "安装Vercel CLI..."
    npm install -g vercel
fi

# 登录Vercel (需要在浏览器中完成)
echo "请在浏览器中完成Vercel登录..."
vercel login

# 部署
echo "开始部署到Vercel..."
vercel --prod

echo "✅ 部署完成！"
echo ""
echo "部署后需要在Vercel后台配置环境变量："
echo "  API_KEY: 你的AI服务API Key"
echo "  BASE_URL: AI服务API地址"
