#!/bin/bash

# 宝塔面板快速部署脚本
# 使用方法: chmod +x bt-deploy.sh && ./bt-deploy.sh

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Ant Design Pro 宝塔部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查 Node 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}[错误]${NC} Node.js 版本必须 >= 20.0.0"
    echo "当前版本: $(node -v)"
    exit 1
fi
echo -e "${GREEN}[✓]${NC} Node.js 版本检查通过: $(node -v)"

# 清理旧的构建
echo -e "${YELLOW}[1/4]${NC} 清理旧的构建文件..."
rm -rf dist

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[2/4]${NC} 安装依赖..."
    npm install
else
    echo -e "${GREEN}[✓]${NC} 依赖已存在"
fi

# 构建项目
echo -e "${YELLOW}[3/4]${NC} 构建项目..."
npm run build

# 检查构建结果
if [ ! -d "dist" ]; then
    echo -e "${RED}[错误]${NC} 构建失败，dist 目录不存在"
    exit 1
fi

echo -e "${GREEN}[✓]${NC} 构建成功！"
BUILD_SIZE=$(du -sh dist | cut -f1)
echo "    构建大小: $BUILD_SIZE"

# 上传到服务器
echo ""
echo -e "${YELLOW}[4/4]${NC} 准备上传到服务器..."
echo ""
echo "请选择上传方式:"
echo "  1) 手动上传（稍后通过 FTP 或宝塔面板上传）"
echo "  2) SSH 自动上传（需要配置服务器信息）"
echo ""
read -p "请选择 [1-2]: " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}  构建完成！${NC}"
        echo -e "${GREEN}========================================${NC}"
        echo ""
        echo "构建文件位于: ./dist"
        echo "构建大小: $BUILD_SIZE"
        echo ""
        echo "请通过以下方式上传到服务器："
        echo ""
        echo "方式一：宝塔面板"
        echo "  1. 登录宝塔面板"
        echo "  2. 文件管理 → 进入网站目录"
        echo "  3. 上传 dist 文件夹中的所有文件"
        echo ""
        echo "方式二：FTP 工具"
        echo "  1. 使用 FileZilla 等 FTP 工具连接服务器"
        echo "  2. 将 dist 文件夹中的文件上传到网站根目录"
        echo ""
        ;;
    2)
        echo ""
        echo "请输入服务器信息："
        read -p "服务器 IP 或域名: " SERVER_HOST
        read -p "SSH 用户名 (默认 root): " SERVER_USER
        SERVER_USER=${SERVER_USER:-root}
        read -p "网站根目录 (默认 /www/wwwroot/myapp): " SERVER_PATH
        SERVER_PATH=${SERVER_PATH:-/www/wwwroot/myapp}
        
        echo ""
        echo "开始上传..."
        
        # 检查是否安装了 rsync
        if command -v rsync &> /dev/null; then
            rsync -avz --delete dist/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/
        else
            scp -r dist/* ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/
        fi
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}[✓]${NC} 上传成功！"
            
            # 询问是否重启 Nginx
            echo ""
            read -p "是否重载 Nginx 配置？(y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                ssh ${SERVER_USER}@${SERVER_HOST} "nginx -s reload"
                echo -e "${GREEN}[✓]${NC} Nginx 配置已重载"
            fi
            
            echo ""
            echo -e "${GREEN}========================================${NC}"
            echo -e "${GREEN}  部署完成！${NC}"
            echo -e "${GREEN}========================================${NC}"
            echo ""
            echo "网站地址: http://${SERVER_HOST}"
            echo "部署目录: ${SERVER_PATH}"
            echo ""
        else
            echo -e "${RED}[错误]${NC} 上传失败"
            echo ""
            echo "可能的原因："
            echo "  1. SSH 密钥未配置"
            echo "  2. 服务器信息不正确"
            echo "  3. 目录权限不足"
            echo ""
            echo "请使用方式一（手动上传）或配置 SSH 密钥"
            exit 1
        fi
        ;;
    *)
        echo -e "${RED}[错误]${NC} 无效的选择"
        exit 1
        ;;
esac

echo ""
echo "提示："
echo "  1. 如果修改了 API 地址，请检查 src/config/apiConfig.ts"
echo "  2. 部署后记得清除浏览器缓存（Ctrl+F5）"
echo "  3. 如果遇到 404，请检查 Nginx 配置"
echo ""
