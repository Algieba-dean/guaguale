## 1. 数据与底层 Hook 准备

- [ ] 1.1 创建内置签池配置文件 `src/data/shakerPools.ts`，内置“今日运势”、“中午吃什么”和“决策行止”的签条数据。
- [ ] 1.2 实现 `src/hooks/useDeviceShake.ts` 自定义 Hook，监听移动端加速度传感器事件并计算晃动率，提供阈值配置与防抖。

## 2. 摇签筒组件与页面实现

- [ ] 2.1 在 `src/features/shaker/` 下新建 `ShakerPage.tsx` 页面。
- [ ] 2.2 使用 SVG 和 Framer Motion 实现签筒摇晃以及签条掷出动画。
- [ ] 2.3 实现 iOS 13+ 移动端的 DeviceMotion 传感器权限启用申请弹窗与流程。
- [ ] 2.4 实现抽签结果的宣纸卡片翻开与多主题展示（包括吉凶、签文和通俗易懂的解读）。
- [ ] 2.5 支持下拉切换内置签池，并实现自定义签池表单（包含签面选项的动态增删），将自定义签池保存至 LocalStorage。

## 3. 路由与全局导航集成

- [ ] 3.1 在 `src/App.tsx` 中注册 `/shaker` 路由，关联 `ShakerPage`。
- [ ] 3.2 在移动端底部导航 `src/components/layout/Navigation.tsx` 和桌面端头部 `src/components/layout/Header.tsx` 中加入“摇签”入口。
- [ ] 3.3 在主页 `src/features/home/HomePage.tsx` 的卡片列表中新增“快速摇签”作为第四个卡片，并更新移动端横向滑动的点位分页器。

## 4. 验证与润色

- [ ] 4.1 运行 TypeScript 类型检查与项目打包，确保构建无任何错误。
- [ ] 4.2 通过浏览器模拟晃动和点击，测试各种极端边界情况（如只有一个签条的自定义池）。
