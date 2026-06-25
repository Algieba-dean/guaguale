---
name: Divination App
description: A modern divination app based on traditional Chinese Yi-Ching philosophy.
colors:
  primary: "#C4612F"
  primary-dark: "#A94E22"
  primary-tint: "#F2E3D6"
  neutral-bg: "#F7F4EF"
  neutral-surface: "#FBF9F5"
  neutral-ink: "#1F2421"
  neutral-muted: "#5C635D"
  border: "#E7E1D7"
typography:
  display:
    fontFamily: "Fraunces, 'DM Serif Display', 'Playfair Display', serif"
    fontSize: "clamp(2.5rem, 6vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Fraunces, 'DM Serif Display', 'Playfair Display', serif"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 300
    lineHeight: 1.6
rounded:
  sm: "8px"
  md: "16px"
  lg: "24px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.pill}"
    padding: "10px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
---

# Design System: Divination App

## 1. Overview

**Creative North Star: "雅意丹青 (The Ink & Terracotta Studio)"**

“雅意丹青”是为现代东方占卜量身定制的视觉系统。它摒弃了过往黄历页面的廉价堆积感，同样拒绝了冷酷前卫的现代SaaS控制面板风格，而是在温润如宣纸的墨色背景上，以朱砂陶土（Terracotta）作为坚定的核心强调色，辅以如竹简般干净挺拔的线条。

系统在密度上保持克制，通过大量的留白让用户的思绪在起卦过程中沉静下来。在交互上追求“平面极简主义”，通过色块的微妙明暗差与1px的线框勾勒出界面层级，拒绝多余的多重阴影与过度复杂的浮雕。

**Key Characteristics:**
- **宣纸留白**：通过大面积温润底色与舒缓的间距营造宁静、内敛的心理氛围。
- **竹简线条**：1px 的精细描边与利落的格栅线，使内容规整、具有可信赖的书卷感。
- **朱砂点晴**：Terracotta 橙红仅在动作入口、核心卦象和变爻等最关键之处显现，保持克制。

## 2. Colors

朱砂与水墨的现代融合，以自然、泥土和植物本色为基底。

### Primary
- **朱砂 (Terracotta)** (#C4612F): 核心品牌强调色，用于主按钮、核心卦画、链接与变爻。
- **暗朱砂 (Terracotta Dark)** (#A94E22): 强调色悬浮/点击状态。
- **陶土浅晕 (Terracotta Tint)** (#F2E3D6): 轻度背景晕染，用于徽章、卡片局部高亮。

### Neutral
- **宣纸 (Cream)** (#F7F4EF): 界面主背景色，带来不刺眼的古朴温润感。
- **白宣 (Cream Light)** (#FBF9F5): 卡片和浮层容器底色，形成微弱的层级差。
- **玄墨 (Ink)** (#1F2421): 主文字与标题，提供极其稳重的阅读体验。
- **松烟 (Muted)** (#5C635D): 辅助说明文字、次要标签。
- **竹简描边 (Border)** (#E7E1D7): 容器、格栅的分隔线条。

### Named Rules
**The Ten-Percent Terracotta Rule.** 核心强调色 Terracotta 在页面上的视觉覆盖率必须控制在 10% 以内，不可滥用，确保其每次显现都具有引导性与仪式感。

## 3. Typography

**Display Font:** Fraunces (with 'DM Serif Display', 'Playfair Display', serif)
**Body Font:** Inter (with system-ui, sans-serif)

**Character:** 采用衬线 display 字体与无衬线 body 字体的对比配对。Display 字体传达易理的古朴与神圣，而 body 字体则提供现代且清晰易读的工具性体验。

### Hierarchy
- **Display** (400, clamp(2.5rem, 6vw, 4rem), 1.2): 适用于巨型主页标题、卦名大字展示。
- **Headline** (400, 1.875rem, 1.3): 适用于各大占卜功能页的版块标题。
- **Title** (400, 1.25rem, 1.4): 适用于卡片标题、弹窗页眉。
- **Body** (300, 1rem, 1.6): 适用于卦爻辞长文本解读。最大每行宽度限制在 65-75ch 以保证极佳的阅读连贯性。
- **Label** (400, 0.875rem, 0.05em): 适用于徽章、英文辅标、日期与元数据。

## 4. Elevation

系统奉行**平面极简主义**（Flat Minimalist）。在 rest 状态下，所有的卡片和容器均平铺于宣纸背景上，通过 background-color 的微弱变化（`#F7F4EF` vs `#FBF9F5`）以及 1px 的 `#E7E1D7` 边框来区分。

### Named Rules
**The Shadowless Default Rule.** 容器在默认状态下绝不允许出现阴影。仅在可交互的卡片处于 hover 或 active 状态时，才允许显示微弱的 1px 细线外晕或柔和过渡，以做反馈。

## 5. Components

### Buttons
- **Shape:** 胶囊形 (rounded-pill / 999px radius)
- **Primary:** 主按钮背景为 Terracotta (#C4612F)，字为 Cream Light (#FBF9F5)，水平内边距 24px，垂直内边距 10px。
- **Hover / Focus:** 悬浮时背景过渡至 Terracotta Dark (#A94E22)；focus-visible 时显示 2px 的 Terracotta 描边与 2px 的白色环圈。

### Cards / Containers
- **Corner Style:** 圆润拐角 (rounded-lg / 24px radius)
- **Background:** 白宣 (Cream Light / #FBF9F5)
- **Border:** 1px 的竹简描边 (#E7E1D7)
- **Internal Padding:** 大量空气感留白 (24px - 32px / spacing-lg to xl)

### Inputs / Fields
- **Style:** 底部 1px 细线描边或全框描边，背景可透明，拐角圆角为 8px (sm)。
- **Focus:** 描边变更为 Terracotta (#C4612F)，无过多外发光。

### Navigation
- **Style:** 底部或顶部固定条，底色为白宣，上方 1px 描边。当前激活项使用 Terracotta，未激活项使用 Muted，辅以极其柔和的滑块或圆点指示器。

## 6. Do's and Don'ts

### Do:
- **Do** 严格保持古籍爻辞的行宽在 65-75ch 之间，使用大行高（1.6）确保阅读古文时不感到拥挤。
- **Do** 在六爻投币交互中，设计具有物理真实感的旋转与下落回弹，以创造解压的仪式感。
- **Do** 始终保证占卜记录卡片的对比度（Text vs Background）大于 4.5:1。

### Don't:
- **Don't** 在任何地方使用渐变文字（background-clip: text）。卦名或标题应使用纯色 Terracotta 或 Ink。
- **Don't** 使用大于 1px 的侧边彩色条（side-stripe borders）来标注警示或高亮，应改用底色浅晕（Terracotta Tint）或整体虚线框。
- **Don't** 滥用阴影和磨砂玻璃（glassmorphism）作为卡片底色，底色必须使用白宣（#FBF9F5）保持整体风格的书卷气。
