import { calculateLiuyaoLayout } from '../../utils/liuyaoLayout';

interface NajiaTableProps {
  lines: number[];
  timestamp?: number;
}

export function NajiaTable({ lines, timestamp = Date.now() }: NajiaTableProps) {
  if (!lines || lines.length !== 6) return null;

  const layout = calculateLiuyaoLayout(lines, timestamp);
  const {
    yearGanzhi,
    monthGanzhi,
    dayGanzhi,
    hourGanzhi,
    dayXunKong,
    palaceName,
    palaceElement,
    isYouhun,
    isGuihun,
    lines: resultLines
  } = layout;

  const getPositionName = (pos: number): string => {
    const names = ['', '初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
    return names[pos] || '';
  };

  const getLineSymbol = (val: number): string => {
    switch (val) {
      case 9: return '━━━ ◯'; // 老阳
      case 7: return '━━━';    // 少阳
      case 8: return '━ ━';    // 少阴
      case 6: return '━ ━ ✕'; // 老阴
      default: return '';
    }
  };

  // Reverse lines to display from top (Line 6) to bottom (Line 1)
  const reversedLines = [...resultLines].reverse();

  return (
    <div className="w-full bg-cream-light/40 border border-border/80 rounded-2xl p-4 sm:p-5 my-6 font-sans text-xs sm:text-sm text-ink/90 relative overflow-hidden">
      {/* Cinnabar stamp background detail */}
      <div className="absolute top-3 right-4 select-none pointer-events-none border border-dashed border-terracotta/20 text-terracotta/35 font-serif text-[10px] sm:text-xs flex items-center justify-center p-1.5 rounded-sm opacity-60 scale-90 sm:scale-100" style={{ writingMode: 'vertical-rl' }}>
        卦摊排盘印
      </div>

      {/* Frame border */}
      <div className="absolute inset-1 border border-gold/5 pointer-events-none rounded-xl" />

      {/* Header Info */}
      <div className="space-y-2 border-b border-border/50 pb-3 mb-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px] sm:text-xs text-muted font-light">
          <div>
            <span className="font-normal text-ink/80">起卦时间：</span>
            <span>{new Date(timestamp).toLocaleString('zh-CN', { hour12: false })}</span>
          </div>
          <div>
            <span className="font-normal text-ink/80">旬空：</span>
            <span className="text-terracotta/90 font-medium">{dayXunKong || '无'}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
          <span className="px-2 py-0.5 rounded bg-cream border border-border/60 text-[10px] sm:text-xs font-light">
            <span className="text-muted">干支：</span>
            <strong className="font-normal text-ink">{yearGanzhi}年 {monthGanzhi}月 {dayGanzhi}日 {hourGanzhi}时</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-terracotta-tint text-terracotta text-[10px] sm:text-xs font-serif font-light">
            {palaceName}为{palaceElement}宫 {isYouhun && '· 游魂'} {isGuihun && '· 归魂'}
          </span>
        </div>
      </div>

      {/* Layout Table */}
      <div className="overflow-x-auto scrollbar-none">
        <table className="w-full text-center border-collapse min-w-[280px]">
          <thead>
            <tr className="border-b border-border/40 text-muted font-light text-[10px] sm:text-xs">
              <th className="py-1.5 px-1 text-left">六神</th>
              <th className="py-1.5 px-1">爻位</th>
              <th className="py-1.5 px-1">六亲</th>
              <th className="py-1.5 px-1">纳支五行</th>
              <th className="py-1.5 px-1">爻象</th>
              <th className="py-1.5 px-1">世应</th>
              <th className="py-1.5 px-1 text-right">状态</th>
            </tr>
          </thead>
          <tbody>
            {reversedLines.map((line) => {
              const isChanging = line.value === 6 || line.value === 9;
              
              // Determine status text/styling
              let statusText = '';
              let statusClass = 'text-muted';
              
              if (line.isVoid) {
                statusText = '空亡';
                statusClass = 'text-terracotta font-medium bg-terracotta-tint/30 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px]';
              } else if (line.isYuePo) {
                statusText = '月破';
                statusClass = 'text-terracotta font-medium bg-terracotta-tint/30 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px]';
              } else if (line.isRiPo) {
                statusText = '日破';
                statusClass = 'text-muted/80 bg-black/5 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px]';
              } else if (line.isAnDong) {
                statusText = '暗动';
                statusClass = 'text-gold font-normal bg-gold/10 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px]';
              }

              return (
                <tr 
                  key={line.position} 
                  className={`border-b border-border/20 text-[11px] sm:text-xs transition-colors hover:bg-cream-light/20 ${
                    line.isShi ? 'bg-gold-tint/5' : ''
                  }`}
                >
                  {/* 六神 */}
                  <td className="py-2.5 px-1 text-left font-light text-muted">
                    {line.beast}
                  </td>
                  
                  {/* 爻位 */}
                  <td className="py-2.5 px-1 font-light text-muted">
                    {getPositionName(line.position)}
                  </td>
                  
                  {/* 六亲 */}
                  <td className={`py-2.5 px-1 font-medium ${isChanging ? 'text-terracotta' : 'text-ink/80'}`}>
                    {line.relation}
                  </td>
                  
                  {/* 地支五行 */}
                  <td className="py-2.5 px-1 font-light">
                    <span className="text-ink">{line.branch}</span>
                    <span className="text-[10px] text-muted ml-0.5">({line.element})</span>
                  </td>
                  
                  {/* 爻象 */}
                  <td className={`py-2.5 px-1 font-mono text-xs sm:text-sm tracking-wider ${
                    isChanging ? 'text-terracotta font-semibold' : 'text-gold'
                  }`}>
                    {getLineSymbol(line.value)}
                  </td>
                  
                  {/* 世应 */}
                  <td className="py-2.5 px-1 font-medium">
                    {line.isShi && (
                      <span className="px-1.5 py-0.5 rounded bg-gold/20 text-gold text-[9px] sm:text-[10px] font-sans">
                        世
                      </span>
                    )}
                    {line.isYing && (
                      <span className="px-1.5 py-0.5 rounded bg-border text-muted text-[9px] sm:text-[10px] font-sans font-light">
                        应
                      </span>
                    )}
                  </td>
                  
                  {/* 状态 */}
                  <td className="py-2.5 px-1 text-right">
                    {statusText && (
                      <span className={statusClass}>
                        {statusText}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Guide tip */}
      <div className="mt-3 text-[9px] sm:text-[10px] text-muted/70 font-light text-center sm:text-left leading-relaxed">
        ※ 提示：排盘包含世应、纳甲、六亲、六神，已作为上下文提供给“小卦摊摊主”AI，为你生成精确的分析。
      </div>
    </div>
  );
}
