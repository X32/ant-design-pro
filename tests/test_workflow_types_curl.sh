#!/bin/bash
# 工作流类型选项 API 测试脚本 (curl 版本)
# 使用方法: bash test/test_workflow_types_curl.sh

set -e  # 遇到错误立即退出

# ============================================
# 配置
# ============================================
BASE_URL="http://localhost:9002"
AUTH_API="${BASE_URL}/api/auth"
WORKFLOW_API="${BASE_URL}/api/workflowtypes"

# 测试用户凭证
TEST_USER="test_user@example.com"
TEST_PASSWORD="secure_password_123"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================
# 函数定义
# ============================================

print_header() {
    echo ""
    echo "============================================================"
    echo "$1"
    echo "============================================================"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# ============================================
# 步骤1: 获取认证 Token
# ============================================

print_header "步骤1: 获取认证 Token"

print_info "尝试登录: POST ${AUTH_API}/login"

LOGIN_RESPONSE=$(curl -s -X POST "${AUTH_API}/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${TEST_USER}\",\"password\":\"${TEST_PASSWORD}\"}")

echo "登录响应: ${LOGIN_RESPONSE}"

# 尝试提取 token (支持多种可能的 JSON 结构)
TOKEN=$(echo "${LOGIN_RESPONSE}" | python3 -c "
import sys, json
data = json.load(sys.stdin)
token = (data.get('data', {}).get('token') or 
         data.get('data', {}).get('access_token') or
         data.get('token') or
         data.get('access_token'))
print(token if token else '')
" 2>/dev/null || echo "")

if [ -z "$TOKEN" ]; then
    print_error "登录失败或未找到 token"
    echo "完整响应: ${LOGIN_RESPONSE}"
    exit 1
fi

print_success "Token 获取成功: ${TOKEN:0:30}..."
echo ""

# ============================================
# 步骤2: 测试获取工作流类型选项列表
# ============================================

print_header "步骤2: 测试获取工作流类型选项列表"

REQUEST_URL="${WORKFLOW_API}/?only_active=True&page=1&page_size=10"

print_info "请求 URL: GET ${REQUEST_URL}"
print_info "请求头:"
echo "  Content-Type: application/json"
echo "  Authorization: Bearer ${TOKEN:0:30}..."
echo ""

# 发送请求
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${REQUEST_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}")

# 分离 HTTP 状态码和响应体
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP 状态码: ${HTTP_CODE}"
echo ""

if [ "$HTTP_CODE" -eq 200 ]; then
    print_success "请求成功 (200 OK)"
    echo ""
    echo "响应内容 (格式化):"
    echo "${RESPONSE_BODY}" | python3 -m json.tool 2>/dev/null || echo "${RESPONSE_BODY}"
    
    # 统计返回的数量
    TOTAL=$(echo "${RESPONSE_BODY}" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data.get('total', 0))
" 2>/dev/null || echo "0")
    
    echo ""
    print_info "返回记录总数: ${TOTAL}"
else
    print_error "请求失败 (HTTP ${HTTP_CODE})"
    echo "响应内容:"
    echo "${RESPONSE_BODY}"
fi

# ============================================
# 步骤3: 测试其他参数组合
# ============================================

print_header "步骤3: 测试不同参数组合"

# 测试1: 获取包含已删除的记录
print_info "测试1: 获取所有记录 (包含已删除)"
REQUEST_URL_ALL="${WORKFLOW_API}/?only_active=False&page=1&page_size=20"
echo "URL: ${REQUEST_URL_ALL}"

RESPONSE_ALL=$(curl -s -w "\n%{http_code}" -X GET "${REQUEST_URL_ALL}" \
  -H "Authorization: Bearer ${TOKEN}")
HTTP_CODE_ALL=$(echo "$RESPONSE_ALL" | tail -n1)

if [ "$HTTP_CODE_ALL" -eq 200 ]; then
    print_success "测试1通过 (HTTP ${HTTP_CODE_ALL})"
    TOTAL_ALL=$(echo "$RESPONSE_ALL" | sed '$d' | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data.get('total', 0))
" 2>/dev/null || echo "0")
    print_info "返回记录总数: ${TOTAL_ALL}"
else
    print_error "测试1失败 (HTTP ${HTTP_CODE_ALL})"
fi

echo ""

# 测试2: 第2页数据
print_info "测试2: 获取第2页数据"
REQUEST_URL_PAGE2="${WORKFLOW_API}/?only_active=True&page=2&page_size=5"
echo "URL: ${REQUEST_URL_PAGE2}"

RESPONSE_PAGE2=$(curl -s -w "\n%{http_code}" -X GET "${REQUEST_URL_PAGE2}" \
  -H "Authorization: Bearer ${TOKEN}")
HTTP_CODE_PAGE2=$(echo "$RESPONSE_PAGE2" | tail -n1)

if [ "$HTTP_CODE_PAGE2" -eq 200 ]; then
    print_success "测试2通过 (HTTP ${HTTP_CODE_PAGE2})"
else
    print_error "测试2失败 (HTTP ${HTTP_CODE_PAGE2})"
fi

echo ""
print_header "✅ 所有测试完成"
