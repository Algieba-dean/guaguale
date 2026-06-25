## Context

当前小卦摊应用是一个基于 React + TypeScript + Tailwind CSS 和 Framer Motion 的现代化单页 Web 应用。我们已成功集成了深浅双主题切换，且应用在设计上追求极致的“国潮”和“宣纸插画”美学。
本项目需要增加一个新的趣味模块：摇签筒（`/shaker`），允许移动端用户晃动手机、桌面端用户点击按钮进行快速决定占卜。

## Goals / Non-Goals

**Goals:**
- 提供一个支持深色和浅色主题、高度美学感的摇签筒界面（Impeccable style）。
- 实现移动端手机物理摇晃检测（DeviceMotion API），并在检测到摇晃时触发摇签。
- 提供内置常用抉择签面池（今日运势、午餐吃啥、决策行止）并支持用户保存自定义签池到 `localStorage`。
- 展示展开效果极其 premium 的宣纸签文结果卡片。

**Non-Goals:**
- 不依赖任何原生的外壳/App包，纯 Web API 实现。
- 不需要后端存储，所有自定义签面及摇签历史本地持久化于 `localStorage`。

## Decisions

### 1. 移动端加速度晃动传感器（useDeviceShake hook）
- **选择**：使用原生 React Hook 监听 `devicemotion` 事件，计算三轴加速度瞬时变化率。
- **iOS 特殊处理**：在 iOS 13+ 系统上，获取 `devicemotion` 加速度计权限需要用户手动触发授权。我们必须在页面上设计一个精美的“启用摇一摇”的权限启用流程（仅在 iOS 设备且未授权时展示）。
- **备选方案**：使用第三方库如 `shake.js`。
- **舍弃理由**：`shake.js` 依赖较老且不直接支持 React/TS 的声明式生命周期，自写 React Hook 仅需约 40 行，能够更好地控制阈值和防抖。

### 2. 签筒与签条的动画设计
- **选择**：使用 SVG 绘制签筒。签筒由三层组成：
  1. 签筒底部及背景半圆。
  2. 多条木质签条（利用 Framer Motion 的 `animate` 产生错落的上下起伏）。
  3. 签筒前半部分遮罩（覆盖在签条上，露出签尖）。
- **摇动状态**：签筒整体以锚点在底部为轴心进行高频交替摆动，同时内部签条产生随机高度起伏并伴随微弱的旋转。
- **掷签状态**：抽中的那根签条从筒中飞起并放大展示，淡入一张宣纸卡片。

### 3. 数据层（签池数据结构设计）
- 新建 `src/data/shakerPools.ts` 文件管理数据：
```typescript
export interface ShakerStick {
  id: number;
  title: string;       // 签文结果（如：小炒肉 / 宜前行）
  fortune?: string;    // 吉凶（大吉、上吉、中平、下下等）
  poetry?: string;     // 传统诗签（选填，用于传统运势签）
  explanation: string; // 通俗易懂的大白话解签/行动建议
}
export interface ShakerPool {
  id: string;
  name: string;
  isCustom?: boolean;
  sticks: ShakerStick[];
}
```
- 内置签池：
  1. `today-fortune`（今日运势签，含诗意与趣味解读）。
  2. `lunch-decider`（午餐吃什么，含各类中华特色美食与推荐语）。
  3. `action-decision`（行止抉择签，含“宜”、“忌”以及趣味警示）。

### 4. 主题适配
- 在浅色模式（`data-theme="light"`）下，签筒采用温润的红木/黄花梨质感色泽，签条采用竹简淡黄色，解签卡片背景使用纯白宣纸纹理配以细边红线框；
- 在深色模式下，签筒采用紫檀/沉香木黑金色泽，签条采用古铜/深竹色，解签卡片使用暗色烫金边框。

## Risks / Trade-offs

- **[Risk] iOS 13+ 安全限制导致 DeviceMotion API 无法直接调用**
  - **Mitigation**：必须在页面显式添加“点击授权”按钮，并通过用户点击动作来调用 `DeviceMotionEvent.requestPermission()`。若用户拒绝或在桌面端，则优雅降级为点击/轻触屏幕直接摇签，并提供明确引导。
- **[Risk] 移动端浏览器对 `devicemotion` 支持度差异**
  - **Mitigation**：利用 Feature Detection，若 `window.DeviceMotionEvent` 未定义或无法授权，隐藏“晃动手机摇签”提示语，仅保留“点击/轻触签筒摇签”交互。
