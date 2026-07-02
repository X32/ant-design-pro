#!/usr/bin/env bash
#
# 生成浏览器可信的本地 HTTPS 证书（mkcert），用于 H5 开发调试。
#
# 用途：解决录音权限（getUserMedia）需要安全上下文的问题，
#       允许手机/平板等局域网设备通过 https://<本机IP>:8001 访问开发服务器。
#
# 使用：
#   1. ./scripts/setup-https.sh           # 生成证书
#   2. ./scripts/setup-https.sh --trust   # 生成并把 rootCA 路径打印出来，方便拷到手机
#
# 前置依赖：mkcert（脚本会检测并提示安装命令）
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERT_DIR="$ROOT_DIR/https"
CERT_FILE="$CERT_DIR/cert.pem"
KEY_FILE="$CERT_DIR/cert.key"

# ---------- 颜色 ----------
c_info=$'\033[36m'
c_ok=$'\033[32m'
c_err=$'\033[31m'
c_rst=$'\033[0m'

info() { printf "%s[INFO]%s %s\n" "$c_info" "$c_rst" "$1"; }
ok()   { printf "%s[ OK ]%s %s\n" "$c_ok"  "$c_rst" "$1"; }
err()  { printf "%s[FAIL]%s %s\n" "$c_err" "$c_rst" "$1" >&2; }

# ---------- 1. 检查 mkcert ----------
if ! command -v mkcert >/dev/null 2>&1; then
  err "未检测到 mkcert。请先安装："
  cat <<'EOF'

  # Ubuntu / Debian
  sudo apt install libnss3-tools
  curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
  chmod +x mkcert-v*-linux-amd64
  sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert

  # macOS
  brew install mkcert
  brew install nss   # Firefox 需要

  # Windows (Chocolatey)
  choco install mkcert

EOF
  exit 1
fi

info "检测到 mkcert：$(mkcert -version 2>/dev/null || echo 'unknown')"

# ---------- 2. 安装本地 CA ----------
# 把 mkcert 的根证书装到系统/浏览器信任库。
# 已经装过会跳过（不会重复），所以幂等。
if [[ "${SKIP_INSTALL_CA:-0}" != "1" ]]; then
  info "安装本地 CA 到系统/浏览器信任库（首次执行需要 sudo）"
  if ! mkcert -install; then
    err "mkcert -install 失败。可设置 SKIP_INSTALL_CA=1 跳过此步骤后手动信任。"
    exit 1
  fi
fi

# ---------- 3. 收集主机名/IP ----------
# mkcert 一次签发覆盖所有 SAN，以后换 IP 重跑脚本即可。
HOSTS=("localhost" "127.0.0.1" "::1")

# 收集本机所有非 docker 的 IPv4 地址
while IFS= read -r ip; do
  [[ -z "$ip" ]] && continue
  # 排除 docker / 容器网段
  case "$ip" in
    172.1[6-9].*|172.2[0-9].*|172.3[0-1].*) continue ;;  # docker bridge
    198.18.*) continue ;;                                # 一些虚拟网卡
  esac
  HOSTS+=("$ip")
done < <(ip -4 addr show 2>/dev/null \
        | grep -oP '(?<=inet\s)\d+(\.\d+){3}' \
        | grep -v '^127\.')

# 额外允许从环境变量追加（方便固定某个 IP）
if [[ -n "${EXTRA_HOSTS:-}" ]]; then
  IFS=',' read -r -a _extra <<< "$EXTRA_HOSTS"
  HOSTS+=("${_extra[@]}")
fi

# 去重
mapfile -t HOSTS < <(printf '%s\n' "${HOSTS[@]}" | awk '!x[$0]++')

info "证书将覆盖以下 host/IP："
printf '  - %s\n' "${HOSTS[@]}"

# ---------- 4. 生成证书 ----------
mkdir -p "$CERT_DIR"
info "生成证书 → $CERT_DIR/"
mkcert -cert-file "$CERT_FILE" -key-file "$KEY_FILE" "${HOSTS[@]}"
ok "证书已生成："
printf '    %s/cert.pem\n    %s/cert.key\n' "$CERT_DIR" "$CERT_DIR"

# ---------- 5. 提示 ----------
cat <<EOF

${c_ok}[完成]${c_rst} 现在可以启动 HTTPS 开发服务器：

  ${c_info}npm run start:https${c_rst}

浏览器访问（在同一局域网内的设备）：

EOF
for ip in "${HOSTS[@]}"; do
  case "$ip" in
    *:*) ;;  # 跳过 IPv6
    *) printf "  ${c_info}https://%s:8001${c_rst}\n" "$ip" ;;
  esac
done

# ---------- 6. （可选）打印 CA 路径供手机信任 ----------
if [[ "${1:-}" == "--trust" ]]; then
  CA_ROOT="$(mkcert -CAROOT 2>/dev/null || true)"
  cat <<EOF

${c_info}要让手机/平板无警告访问，请把根证书装到设备：${c_rst}

  CA 路径： ${c_info}${CA_ROOT}/rootCA.pem${c_rst}

  Android：
    1) 把 rootCA.pem 传到手机
    2) 设置 → 安全 → 加密与凭据 → 安装证书 → CA 证书
    3) 浏览器访问时确认信任

  iOS：
    1) AirDrop 或邮件发送 rootCA.pem 到手机
    2) 设置 → 已下载描述文件 → 安装
    3) 设置 → 通用 → 关于本机 → 证书信任设置 → 启用 mkcert
EOF
fi
