## Why

小卦摊当前提供了六爻占卜、梅花易数和紫微斗数等较为严肃和复杂的专业占卜功能。然而，用户在日常生活中常常需要更轻量级、快速决定的趣味占卜工具（例如“中午吃什么”、“今天是否表白”或简单的吉凶运势摇签）。新增一个“摇签筒”功能，不仅能降低使用门槛、增加互动乐趣，还可以通过手机晃动传感器（DeviceMotion API）模拟现实中的“摇签筒”动作，进一步增强移动端的沉浸式用户体验。

## What Changes

- **摇签筒界面 (Shaker UI)**：在移动端与桌面端设计符合“雅意丹青”与“宣纸书屋”风格的精美签筒界面，支持深浅主题切换。
- **自定义与预设问题签 (Stick Pools)**：提供常用快速决定的预设签面（如“今日运势”、“午餐抉择”、“行止决策”），并支持用户自定义签文列表。
- **晃动手机交互 (DeviceMotion Shake)**：在移动端接入晃动检测。当用户在手机上摇晃设备时，触发签筒动画、音效（或振动反馈，在支持的设备上）并掷出一支签。
- **签面解读 (Stick Result)**：摇出签后以精美的宣纸卡片形式展开签文，并附带简单易懂的趣味AI解读或固定诗签解析，支持重新摇签或保存历史。
- **入口导航升级**：
  - 在移动端底部导航栏 [Navigation.tsx](file:///Users/mac/web/zhanbo/divination-app/src/components/layout/Navigation.tsx) 和桌面端头部导航 [Header.tsx](file:///Users/mac/web/zhanbo/divination-app/src/components/layout/Header.tsx) 中新增“摇签”入口。
  - 在主页 [HomePage.tsx](file:///Users/mac/web/zhanbo/divination-app/src/features/home/HomePage.tsx) 新增第四张卡片或快捷入口。

## Capabilities

### New Capabilities
- `fortune-stick-shaker`: 提供摇签筒快速决定的完整功能，包括签筒动画、晃动检测、预设/自定义签面池管理以及解签卡片展示。

### Modified Capabilities
无。

## Impact

- **新增文件**：
  - `src/features/shaker/ShakerPage.tsx`: 摇签功能主页面。
  - `src/hooks/useDeviceShake.ts`: 设备晃动传感器检测 hook。
- **修改文件**：
  - `src/App.tsx`: 注册 `/shaker` 路由。
  - `src/components/layout/Header.tsx` / `Navigation.tsx`: 添加“摇签”导航项目。
  - `src/features/home/HomePage.tsx`: 增加摇签筒作为第四个卡片（在移动端轮播图和桌面网格中增加它）。
- **外部依赖**：
  - 需要在移动端请求 DeviceMotionEvent 的权限（在 iOS 13+ 设备上需要显式授权）。
