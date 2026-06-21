# 🚀 快速开始

## 一分钟上手

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 打开浏览器
# 访问 http://localhost:5173
```

就这么简单！🎉

## 5分钟部署到 Cloudflare Pages

### 方式1: 通过 GitHub（推荐）

```bash
# 1. 创建 GitHub 仓库并推送
git remote add origin https://github.com/你的用户名/divination-app.git
git branch -M main
git push -u origin main

# 2. 访问 Cloudflare Dashboard
# 3. Pages → Create → Connect to Git
# 4. 选择仓库，配置：
#    构建命令: npm run build
#    输出目录: dist
# 5. 点击 Deploy
```

### 方式2: 直接部署（无需 GitHub）

```bash
# 1. 安装 Wrangler
npm install -g wrangler

# 2. 登录
wrangler login

# 3. 构建并部署
npm run build
wrangler pages deploy dist --project-name=divination-app
```

## 项目结构

```
divination-app/
├── src/
│   ├── features/          # 功能模块
│   │   ├── liuyao/       # 六爻占卜
│   │   ├── meihua/       # 梅花易数
│   │   └── history/      # 历史记录
│   ├── components/       # UI组件
│   ├── utils/           # 工具函数
│   └── data/            # 卦象数据
├── public/              # 静态资源
└── dist/               # 构建产物
```

## 核心功能

### 1️⃣ 六爻占卜
- 完整仪式模式（6次摇卦）
- 快速模式（一键生成）
- 自动计算变卦

### 2️⃣ 梅花易数
- 数字起卦（输入3个数字）
- 时间起卦（基于当前时间）

### 3️⃣ 历史记录
- 保存所有占卜记录
- 准确度标记
- 添加备注

## 开发命令

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建

# 代码检查
npm run lint         # ESLint 检查
```

## 技术栈

- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **TailwindCSS** - 样式
- **Framer Motion** - 动画

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 文档

- [README.md](./README.md) - 详细介绍
- [DEPLOY-GUIDE.md](./DEPLOY-GUIDE.md) - 部署指南
- [SUMMARY.md](./SUMMARY.md) - 项目总结

## 常见问题

### Q: 如何添加新的卦象数据？
A: 编辑 `src/data/hexagrams.json`，添加 `judgment`、`lines`、`interpretation` 字段。

### Q: 如何修改颜色主题？
A: 编辑 `tailwind.config.js` 中的 `colors` 配置。

### Q: 历史记录保存在哪里？
A: 保存在浏览器的 LocalStorage 中，最多500条。

### Q: 如何清空历史记录？
A: 在历史记录页面点击"清空全部"按钮。

## 获取帮助

- 查看 [文档](./README.md)
- 提交 [Issue](https://github.com/你的用户名/divination-app/issues)
- 查看 [示例](./SUMMARY.md)

## 开始使用

```bash
npm install && npm run dev
```

打开 http://localhost:5173，开始你的占卜之旅！🔮

---

**需要更多帮助？** 查看 [完整文档](./README.md) 📚
