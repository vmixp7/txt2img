#!/bin/bash
set -e  # 遇到錯誤立即停止

# ===============================
# 顏色設定
# ===============================
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🚀 開始部署 txt2img..."

# ===============================
# 自動切換到專案根目錄
# ===============================
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

echo "📂 切換到專案根目錄: $PROJECT_ROOT"
cd "$PROJECT_ROOT"

# ===============================
# 建立與更新 Docker 容器
# ===============================
echo "🐳 Docker compose build & up ..."
if ! docker-compose up -d --build; then
    echo -e "${RED}Docker 建置失敗${NC}"
    exit 1
fi

# ===============================
# 建立 Docker Network
# ===============================
echo "🌐 設定 Docker Network ..."
docker network create txt2img-net 2>/dev/null || echo "網路已存在"

# ===============================
# 連接容器到網路
# ===============================
echo "🔗 連接容器到 txt2img-net ..."

docker network connect txt2img-net txt2img-app 2>/dev/null || \
    echo "txt2img-app 已在網路中"

docker network connect txt2img-net nginx 2>/dev/null || \
    echo "nginx 已在網路中"

# ===============================
# 檢查容器狀態
# ===============================
echo "🩺 檢查容器狀態..."

docker ps | grep txt2img-app || echo -e "${RED}⚠️ txt2img-app 未啟動！${NC}"
docker ps | grep nginx || echo -e "${RED}⚠️ nginx 未啟動！${NC}"

echo -e "${GREEN}✨ 部署完成！${NC}"
