# 快速部署指南

## 方式1: Cloudflare Pages（推荐）

### 通过 Git 部署

1. **创建 GitHub 仓库**
   ```bash
   # 在 GitHub 创建新仓库后
   git remote add origin https://github.com/your-username/divination-app.git
   git branch -M main
   git push -u origin main
   ```

2. **连接 Cloudflare Pages**
   - 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 "Workers & Pages"
   - 点击 "Create application" → "Pages" → "Connect to Git"
   - 选择你的仓库
   - 配置构建设置：
     ```
     构建命令: npm run build
     构建输出目录: dist
     根目录: /
     环境变量: NODE_VERSION = 18
     ```
   - 点击 "Save and Deploy"

3. **等待部署完成**
   - 首次部署约需 2-3 分钟
   - 部署成功后会得到一个 `.pages.dev` 域名
   - 后续推送代码会自动触发部署

### 直接上传部署（无需 Git）

```bash
# 1. 构建项目
npm run build

# 2. 安装 Wrangler CLI
npm install -g wrangler

# 3. 登录 Cloudflare
wrangler login

# 4. 部署
wrangler pages deploy dist --project-name=divination-app
```

## 方式2: Vercel

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 部署
vercel

# 按提示选择配置，Vercel 会自动检测 Vite 项目
```

或者：
1. 访问 [vercel.com](https://vercel.com)
2. 导入 GitHub 仓库
3. 自动部署

## 方式3: Netlify

### 拖拽部署
1. 构建项目: `npm run build`
2. 访问 [netlify.com](https://www.netlify.com/)
3. 拖拽 `dist` 文件夹到部署区域

### CLI 部署
```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 登录
netlify login

# 3. 部署
netlify deploy --prod
```

## 方式4: GitHub Pages

```bash
# 1. 安装 gh-pages
npm install -D gh-pages

# 2. 添加部署脚本到 package.json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}

# 3. 部署
npm run deploy
```

然后在 GitHub 仓库设置中启用 GitHub Pages，选择 `gh-pages` 分支。

## 环境要求

- Node.js: 18+
- npm: 8+

## 构建产物

- 大小: ~430KB (JS gzipped: ~129KB, CSS gzipped: ~5KB)
- 首次加载: < 3秒（在良好网络条件下）

## 验证部署

部署成功后，检查以下功能：

- ✅ 首页正常显示
- ✅ 六爻占卜流程完整
- ✅ 梅花易数流程完整
- ✅ 历史记录保存和读取
- ✅ 路由刷新不会 404
- ✅ 移动端显示正常

## 自定义域名

### Cloudflare Pages
1. 在项目设置中点击 "Custom domains"
2. 添加你的域名
3. 按提示配置 DNS 记录

### Vercel
1. 在项目设置中点击 "Domains"
2. 添加域名并按提示配置

### Netlify
1. 在站点设置中点击 "Domain management"
2. 添加自定义域名

## 故障排除

### 构建失败
- 检查 Node 版本是否 >= 18
- 清除缓存: `rm -rf node_modules package-lock.json && npm install`
- 本地构建测试: `npm run build`

### 404 错误
- 确保 `public/_redirects` 文件存在
- 内容应为: `/* /index.html 200`

### 样式未加载
- 检查 `index.html` 中的资源路径
- 确保使用相对路径或正确的 base URL

## 持续部署

Git 部署方式会自动启用持续部署：
- 推送到 main 分支 → 自动部署到生产环境
- 推送到其他分支 → 创建预览部署

## 性能优化建议

部署后可以考虑的优化：

1. **启用 CDN**（Cloudflare/Vercel/Netlify 默认启用）
2. **添加 Analytics**
   - Cloudflare Web Analytics
   - Google Analytics
3. **监控错误**
   - Sentry
   - LogRocket
4. **性能监控**
   - Lighthouse
   - Core Web Vitals

## 成本

- **Cloudflare Pages**: 免费（包含无限带宽）
- **Vercel**: 免费（个人项目）
- **Netlify**: 免费（100GB/月带宽）
- **GitHub Pages**: 完全免费

## 推荐

**首选 Cloudflare Pages**，因为：
- ✅ 完全免费，无带宽限制
- ✅ 全球 CDN
- ✅ 自动 HTTPS
- ✅ 快速部署
- ✅ 预览部署
- ✅ 良好的性能

立即开始部署吧！🚀
