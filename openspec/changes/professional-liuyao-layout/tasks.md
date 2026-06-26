## 1. 算法纠偏与排盘引擎实现

- [x] 1.1 修改 `src/utils/liuyao.ts` 中的 `coinsToLineValue` 逻辑，交换 `case 2` (返回8/少阴) 和 `case 1` (返回7/少阳) 的逻辑，修正卦爻基本映射。
- [x] 1.2 新建 `src/utils/liuyaoLayout.ts`，利用 `lunar-javascript` 开发排盘计算引擎，支持计算起卦时间干支、日空亡、世应位置、所属宫位（及五行）、纳甲六支、装配六亲、装配六神等核心参数。

## 2. 宣纸排盘 UI 界面开发

- [x] 2.1 在 `src/features/liuyao/ResultPage.tsx` 中导入排盘引擎，并在主卦与变卦下方设计并实现一个响应式的、古风宣纸样式的六爻纳甲排盘数据表格。
- [x] 2.2 在表格中清晰标出每个爻位的六神、六亲、纳支地支、世应爻标识、以及空亡或月破等旺衰状态。
- [x] 2.3 在历史记录详情页（`src/features/history/HistoryPage.tsx`）中同步支持该排盘表格 of the display.

## 3. AI 解卦与数据层对接

- [x] 3.1 更新 `src/utils/deepseek.ts` 中的 `LiuyaoData` 类型定义，使之能够携带并传递完整的纳甲排盘元数据。
- [x] 3.2 优化 `src/utils/deepseek.ts` 中的 AI 提示词 payload，将排盘中的干支、世应、宫位、空亡等关键易理维度喂给 DeepSeek 模型，实现更加精准深刻的“卦摊主”口语化解读。

## 4. 构建与测试验证

- [x] 4.1 运行 `npm run build` 确保 TypeScript 与 Vite 打包构建零错误。
- [x] 4.2 在本地开发环境进行实机测试，使用已知卦例验证寻世、认宫、纳甲地支和六神起序的绝对准确性。
