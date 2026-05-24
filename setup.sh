#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Pi Config Bootstrap — setup pi + restore config di laptop baru
# ============================================================
# Cara pakai:
#   curl -fsSL https://raw.githubusercontent.com/fadilsflow/pi-config/main/setup.sh | bash
# ============================================================

PI_CONFIG_REPO="https://github.com/fadilsflow/pi-config.git"
PI_CONFIG_DIR="$HOME/.pi"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
info() { echo -e "${CYAN}[i]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }

# ── 1. Cek prerequisites ──────────────────────────────────
info "Memeriksa prerequisites..."

if ! command -v node &>/dev/null; then
  err "Node.js belum terinstall. Install dulu: https://nodejs.org"
  exit 1
fi

if ! command -v git &>/dev/null; then
  err "Git belum terinstall."
  exit 1
fi

if command -v bun &>/dev/null; then
  PKG_MGR="bun"
elif command -v npm &>/dev/null; then
  PKG_MGR="npm"
else
  err "Bun atau npm belum terinstall."
  exit 1
fi

log "Prerequisites OK (${PKG_MGR})"

# ── 2. Install pi (global) ────────────────────────────────
if command -v pi &>/dev/null; then
  PI_VER=$(pi --version 2>/dev/null || echo "?")
  log "Pi sudah terinstall: v${PI_VER}"
else
  info "Menginstall pi via ${PKG_MGR}..."
  case "$PKG_MGR" in
    bun)  bun install -g @earendil-works/pi-coding-agent ;;
    npm)  npm install -g @earendil-works/pi-coding-agent ;;
  esac
  log "Pi berhasil diinstall"
fi

# ── 3. Backup existing config (jika ada) ──────────────────
if [ -d "$PI_CONFIG_DIR" ] && [ -f "$PI_CONFIG_DIR/.git" ]; then
  warn "$PI_CONFIG_DIR sudah ada dan merupakan git repo — skip clone"
elif [ -d "$PI_CONFIG_DIR" ]; then
  BACKUP="$HOME/.pi.backup.$(date +%Y%m%d%H%M%S)"
  warn "Backup config lama ke $BACKUP"
  mv "$PI_CONFIG_DIR" "$BACKUP"
fi

# ── 4. Clone config ───────────────────────────────────────
if [ ! -d "$PI_CONFIG_DIR/.git" ]; then
  info "Meng-clone pi-config..."
  git clone "$PI_CONFIG_REPO" "$PI_CONFIG_DIR"
  log "Config berhasil di-clone"
fi

cd "$PI_CONFIG_DIR"

# ── 5. Setup auth.json (dari template jika belum ada) ─────
if [ ! -f "agent/auth.json" ]; then
  if [ -f "agent/auth.template.json" ]; then
    cp agent/auth.template.json agent/auth.json
    warn ""
    warn "╔══════════════════════════════════════════════════════╗"
    warn "║  EDIT agent/auth.json dan isi API key kamu!         ║"
    warn "║  EDIT agent/mcp.json  dan isi CONTEXT7_API_KEY!     ║"
    warn "╚══════════════════════════════════════════════════════╝"
    warn ""
  fi
else
  log "auth.json sudah ada"
fi

# ── 6. Install packages ───────────────────────────────────
if command -v pi &>/dev/null; then
  info "Menginstall packages terdaftar..."
  # Settings.json sudah include packages, pi akan auto-install saat startup
fi

# ── 7. Setup selesai ──────────────────────────────────────
log "=========================================="
log "  Setup selesai! 🎉"
log "=========================================="
echo ""
info "Jalankan ${CYAN}pi${NC} untuk memulai."
echo ""
echo -e "  ${YELLOW}Penting:${NC}"
echo -e "  - Isi API key di ${CYAN}~/.pi/agent/auth.json${NC}"
echo -e "  - Isi CONTEXT7_API_KEY di ${CYAN}~/.pi/agent/mcp.json${NC}"
echo ""

# Tanya mau langsung running?
read -r -p "Langsung jalankan pi? [Y/n] " ans
case "$ans" in
  [Nn]*) exit 0 ;;
  *)     pi ;;
esac
