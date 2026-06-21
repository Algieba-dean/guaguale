#!/bin/bash

# 占卜应用 - 功能测试脚本

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║              占卜应用 - 自动化功能测试                              ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数器
PASS=0
FAIL=0

# 测试函数
test_case() {
    local name="$1"
    local command="$2"

    echo -n "测试: $name ... "

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 通过${NC}"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗ 失败${NC}"
        ((FAIL++))
        return 1
    fi
}

echo "1️⃣  项目结构检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_case "package.json 存在" "test -f package.json"
test_case "src 目录存在" "test -d src"
test_case "public 目录存在" "test -d public"
test_case "vite.config.ts 存在" "test -f vite.config.ts"
test_case "tsconfig.json 存在" "test -f tsconfig.json"
echo ""

echo "2️⃣  核心文件检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_case "App.tsx 存在" "test -f src/App.tsx"
test_case "main.tsx 存在" "test -f src/main.tsx"
test_case "index.css 存在" "test -f src/index.css"
test_case "_redirects 存在" "test -f public/_redirects"
echo ""

echo "3️⃣  功能模块检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_case "六爻模块存在" "test -d src/features/liuyao"
test_case "梅花模块存在" "test -d src/features/meihua"
test_case "历史模块存在" "test -d src/features/history"
test_case "首页模块存在" "test -d src/features/home"
echo ""

echo "4️⃣  工具函数检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_case "hexagram.ts 存在" "test -f src/utils/hexagram.ts"
test_case "liuyao.ts 存在" "test -f src/utils/liuyao.ts"
test_case "meihua.ts 存在" "test -f src/utils/meihua.ts"
test_case "storage.ts 存在" "test -f src/utils/storage.ts"
echo ""

echo "5️⃣  数据文件检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_case "hexagrams.json 存在" "test -f src/data/hexagrams.json"
test_case "trigrams.json 存在" "test -f src/data/trigrams.json"
test_case "hexagrams.json 格式正确" "node -e 'require(\"./src/data/hexagrams.json\")'"
test_case "trigrams.json 格式正确" "node -e 'require(\"./src/data/trigrams.json\")'"
echo ""

echo "6️⃣  组件检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_case "Button 组件存在" "test -f src/components/shared/Button.tsx"
test_case "HexagramDisplay 组件存在" "test -f src/components/shared/HexagramDisplay.tsx"
test_case "CoinAnimation 组件存在" "test -f src/components/shared/CoinAnimation.tsx"
test_case "PageTransition 组件存在" "test -f src/components/shared/PageTransition.tsx"
echo ""

echo "7️⃣  依赖检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_case "node_modules 存在" "test -d node_modules"
test_case "React 已安装" "test -d node_modules/react"
test_case "React Router 已安装" "test -d node_modules/react-router-dom"
test_case "Framer Motion 已安装" "test -d node_modules/framer-motion"
test_case "TailwindCSS 已安装" "test -d node_modules/tailwindcss"
test_case "UUID 已安装" "test -d node_modules/uuid"
echo ""

echo "8️⃣  TypeScript 编译检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_case "TypeScript 编译通过" "npx tsc --noEmit"
echo ""

echo "9️⃣  构建检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_case "构建成功" "npm run build"
test_case "dist 目录生成" "test -d dist"
test_case "index.html 生成" "test -f dist/index.html"
test_case "资源文件生成" "test -n \"\$(ls dist/assets/*.js 2>/dev/null)\""
echo ""

echo "🔟 文档检查"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
test_case "README.md 存在" "test -f README.md"
test_case "PROGRESS.md 存在" "test -f PROGRESS.md"
test_case "DEPLOYMENT.md 存在" "test -f DEPLOYMENT.md"
test_case "DEPLOY-GUIDE.md 存在" "test -f DEPLOY-GUIDE.md"
test_case "SUMMARY.md 存在" "test -f SUMMARY.md"
test_case "QUICKSTART.md 存在" "test -f QUICKSTART.md"
echo ""

# 总结
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                        测试结果总结                                 ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}通过: $PASS${NC}"
echo -e "${RED}失败: $FAIL${NC}"
echo "总计: $((PASS + FAIL))"
echo ""

# 计算通过率
TOTAL=$((PASS + FAIL))
if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$((PASS * 100 / TOTAL))
    echo "通过率: ${PERCENTAGE}%"
    echo ""

    if [ $PERCENTAGE -eq 100 ]; then
        echo -e "${GREEN}🎉 所有测试通过！项目状态良好。${NC}"
        exit 0
    elif [ $PERCENTAGE -ge 80 ]; then
        echo -e "${YELLOW}⚠️  大部分测试通过，但有少量问题需要修复。${NC}"
        exit 1
    else
        echo -e "${RED}❌ 多个测试失败，请检查并修复问题。${NC}"
        exit 1
    fi
fi
