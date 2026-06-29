# 小卦摊 (Divination App)

小卦摊是一个融合传统易理排盘算法与现代大语言模型（LLM）智能解读的国风命理排盘占卜系统。本系统基于 React 18、Vite、TypeScript 与 TailwindCSS 架构，面向中国传统周易六爻、梅花易数和紫微斗数提供精确的算法模拟、图形排盘展示、海报离线生成、以及 AI 一键智能分析解卦功能。

---

## 核心系统设计与功能实现

### 1. 周易六爻排盘系统

- **起卦机制**：支持“完整仪式起卦”（模拟三次投掷铜钱、连续投掷六次生成阴阳爻、老阴老阳的动静变化）以及“快速排盘”两种交互逻辑。
- **专业纳甲算法**：
  - 根据起卦时刻的干支天机自动推演起卦年、月、日、时干支以及日旬空亡。
  - 推算本卦与之卦的本宫卦位、宫位五行，自动定位世爻与应爻位置。
  - 自下而上排列六爻的纳甲干支、六亲属性（官鬼、父母、兄弟、子孙、妻财）与六神（青龙、朱雀、勾陈、腾蛇、白虎、玄武）分布。
  - 智能判断各爻的动态状态，包含旬空、月破、日破及暗动等动态生克指标。
- **AI 智能解卦**：通过定制化的 System Prompt 引导 LLM 按照结构化逻辑进行占断。包含结论卡片（结论、置信度、应期）、百字简析、趋避建议、用神旺衰及动变生克的六步依据链路。

### 2. 梅花易数推演系统

- **起卦算法**：
  - 数字起卦：输入三个指定范围的数字，按八卦数理折算上卦（先天）、下卦（后天）及动爻。
  - 时间起卦：自动将当前公历时间换算为阴历农历干支，按干支数理之和求取卦象与动爻。
- **体用互变解析**：
  - 自动提取本卦的体卦（无动爻之卦）与用卦（有动爻之卦）及其对应的五行属性。
  - 推导互卦（取本卦二、三、四爻为下卦，三、四、五爻为上卦）以揭示事态的中间变化。
  - 计算之卦（动爻阴阳互变）作为事态的最终指向。
  - 自动分析体用生克关系（体受生、体泄气、体受克、体克事、比和），结合时令时节判断强弱衰旺。

### 3. 紫微斗数排盘系统

- **十二宫位环绕布局**：严格遵循古代紫微斗数排盘规范，以“子”至“亥”十二地支宫位呈 4x4 的外围环绕网格进行排布。
- **星曜精密演算**：根据命主的性别（乾造/坤造）及诞辰生辰，自动计算命宫位置、身宫位置、五行局属性、十岁大限流动区间、以及各宫位随大限和流年变化的岁数。
- **诸星排布与四化**：
  - 自动分布十四主星（紫微、天机、太阳、武曲、天同、廉贞、天府、太阴、贪狼、巨门、天相、天梁、七杀、破军）。
  - 分布吉煞辅星，自动计算并高亮标注生年干四化（化禄、化权、化科、化忌）。
  - 推演命主星、身主星与起卦四柱八字。

### 4. 系统增强与辅助工具

- **AI 提示词复制器**：提供“一键复制排盘提示词”功能。当用户点击时，系统会自动聚合当前盘面的所有算法输出参数（如六爻纳甲数据、梅花体用生克、紫微十二宫星曜与四化配置），并与特定的系统级角色提示词（System Prompt）组合，生成标准 Markdown 格式的完整提示词。用户可以将其粘贴至本地 ChatGPT、Claude、DeepSeek 或 Ollama 本地模型中进行深度对话和追问。
- **海报生成器（SharePosterModal）**：
  - 使用 `html-to-image` 作为主渲染手段进行离屏 DOM 节点栅格化，并保留 `html2canvas` 作为降级兼容方案，彻底解决移动端及离屏渲染空白的问题。
  - 动态加载站点二维码。在分享卡片中自动展示求占问题（若有）、盘面核心符号图表（如卦象图或紫微4x4网格）、AI 一语以及扫码网址。
- **历史卦记管理**：基于 Web LocalStorage 实现本地数据库，存储容量达到 500 条上限时自动触发警告，支持准确度标记、自定义批注备注与删除管理。

---

## 目录结构

```
divination-app/
├── public/                 # 静态资源与构建依赖
│   └── screenshots/        # README 所需的演示截图
├── src/
│   ├── components/
│   │   ├── layout/         # 页面框架及全局导航组件
│   │   └── shared/         # 共享组件 (AIInterpretation, SharePosterModal, NajiaTable 等)
│   ├── features/
│   │   ├── home/           # 首页模块
│   │   ├── liuyao/         # 六爻占卜页面及交互流程
│   │   ├── meihua/         # 梅花易数输入与结果页面
│   │   ├── ziwei/          # 紫微斗数输入表单与4x4排盘页面
│   │   └── history/        # 历史记录列表与备注功能
│   ├── utils/
│   │   ├── hexagram.ts     # 64卦及8卦数据计算工具
│   │   ├── liuyao.ts       # 六爻纳甲起卦规则与六兽排布
│   │   ├── meihua.ts       # 梅花数理换算逻辑
│   │   ├── storage.ts      # 本地 LocalStorage 读写及容量计算
│   │   └── deepseek.ts     # 大语言模型提示词（System/User）生成与 API 交互接口
│   └── data/
│       ├── hexagrams.json  # 易经64卦卦辞爻辞静态数据库
│       └── trigrams.json   # 基础八卦属性数据库
├── vite.config.ts          # Vite 配置文件，包含 HTML 动态注入及 SEO 自动生成插件
└── package.json            # 依赖包及构建脚本
```

---

## 环境变量配置

在根目录下的 `.env`（开发环境）或托管平台的环境变量设置中，配置以下参数。你也可以参考项目根目录下的 [`.env.example`](./.env.example) 与 [`.env.template`](./.env.template)。

| 变量名称               | 是否必填 | 默认值                     | 说明与格式规范                                                                                                                                 |
| :--------------------- | :------: | :------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| `API_KEY`              |    是    | 无                         | 兼容 OpenAI 格式的大模型 API Key (如 DeepSeek API 密钥)                                                                                        |
| `BASE_URL`             |    否    | `https://api.deepseek.com` | 大模型接口的基础地址                                                                                                                           |
| `MODEL`                |    否    | `deepseek-chat`            | 调用的模型名称 (如 `deepseek-chat` 或 `deepseek-coder`)                                                                                        |
| `VITE_SITE_URL`        |    否    | 自动获取                   | 用于分享海报中二维码的网站根地址。**必须包含 http(s):// 协议头**                                                                               |
| `VITE_REDIRECT_DOMAIN` |    否    | 无                         | 强制重定向的统一生产域名。**只能是 bare hostname（例如 `your-domain.com`，不得带有 http 协议或斜杠）**。若留空或未设置，则自动跳过重定向逻辑。 |
| `VITE_GA_ID`           |    否    | 无                         | Google Analytics 衡量 ID (例如 `G-XXXXXXXXXX`)。未设置时不加载 gtag 脚本。                                                                     |
| `VITE_CLARITY_ID`      |    否    | 无                         | Microsoft Clarity 项目跟踪 ID (例如 `xcm9mtpb36`)。未设置时不加载 Clarity 脚本。                                                               |

---

## 本地安装与启动

项目运行需要 Node.js 18+ 环境。

```bash
# 1. 克隆项目并进入 divination-app 文件夹
cd divination-app

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 生产环境打包
npm run build
```

在打包（`npm run build`）时，Vite 的 `generate-seo-files` 插件将自动读取 `.env` 中的 `VITE_SITE_URL` 变量，在 `dist` 目录中动态生成符合 SEO 规范的 `sitemap.xml` 和 `robots.txt`。

---

## 生产部署指南

### 方案 A：Cloudflare Pages 部署 (推荐)

1.  **接入仓库**：登录 Cloudflare 控制台，进入 **Workers & Pages** -> **Create application** -> **Pages**，授权连接你的 GitHub 仓库。
2.  **构建设置**：
    - **Framework preset**：选择 `Vite`。
    - **Build command**：`npm run build`。
    - **Build output directory**：`dist`。
    - **Root directory**：填写 `divination-app`。
3.  **配置环境变量**：在 Pages 管理后台进入项目设置（Settings -> Environment variables），添加 `API_KEY`、`BASE_URL` 以及自定义的 `VITE_SITE_URL` 等变量。
4.  保存并点击 **Save and Deploy**，Cloudflare 将自动触发持续集成并部署上线。

### 方案 B：Vercel 部署

1.  在 Vercel 仪表盘中点击 **Add New Project** 并导入 GitHub 仓库。
2.  在配置页中将 **Root Directory** 指定为 `divination-app`。
3.  在 **Environment Variables** 选项下配置你所需的 API 密钥及其他环境变量。
4.  点击 **Deploy** 即可开始自动编译与全球 CDN 发布。

---

## 许可协议

本项目根据 [MIT License](./LICENSE) 协议开源。欢迎在此基础上进行扩展、定制与贡献。

---

## 🤝 Friends / Links

<table border="0">
  <tbody>
    <tr>
      <td width="200" align="center">
        <a href="https://linux.do" target="_blank" style="text-decoration:none;">
          <img src="https://img.shields.io/badge/LINUX.DO-Community-000000?style=for-the-badge&logo=linux&logoColor=white" alt="LINUX.DO" />
        </a>
      </td>
      <td align="left">
        <strong><a href="https://linux.do" target="_blank">LINUX.DO</a></strong><br/>
        真诚、友善、团结、专业，共建你我引以为荣之社区。
      </td>
    </tr>
    <tr>
      <td width="200" align="center">
        <a href="https://blog.algieba12.cn/" target="_blank" style="text-decoration:none;">
          <img src="https://img.shields.io/badge/阿尔的代码屋-Blog-DFB15B?style=for-the-badge&logo=rss&logoColor=white" alt="阿尔的代码屋" />
        </a>
      </td>
      <td align="left">
        <strong><a href="https://blog.algieba12.cn/" target="_blank">阿尔的代码屋</a></strong><br/>
        Add bricks to the edifice of the world as you envision it.
      </td>
    </tr>
  </tbody>
</table>
