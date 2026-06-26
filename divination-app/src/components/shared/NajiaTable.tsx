import { calculateLiuyaoLayout } from '../../utils/liuyaoLayout';
import { linesToStructure, getHexagramByStructure } from '../../utils/hexagram';

interface NajiaTableProps {
  lines: number[];
  timestamp?: number;
}

export function NajiaTable({ lines, timestamp = Date.now() }: NajiaTableProps) {
  if (!lines || lines.length !== 6) return null;

  // 1. Calculate Main Hexagram Layout
  const mainLayout = calculateLiuyaoLayout(lines, timestamp);
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
  } = mainLayout;

  const mainStructure = linesToStructure(lines);
  const mainHexagram = getHexagramByStructure(mainStructure);

  // 2. Check and Calculate Transformed Hexagram (之卦) Layout
  const hasChanging = lines.some(v => v === 6 || v === 9);
  let transLayout: any = null;
  let transHexagram: any = null;

  if (hasChanging) {
    const transLines = lines.map(v => {
      if (v === 9) return 8; // old yang -> young yin
      if (v === 6) return 7; // old yin -> young yang
      return v;
    });
    // Calculate transformed hexagram using its own palace (no third parameter)
    transLayout = calculateLiuyaoLayout(transLines, timestamp);
    const transStructure = linesToStructure(transLines);
    transHexagram = getHexagramByStructure(transStructure);
  }

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

  // Status badges formatter
  const renderStatus = (line: any) => {
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

    if (!statusText) return null;
    return <span className={statusClass}>{statusText}</span>;
  };

  // Reverse lines to display from top (Line 6) to bottom (Line 1)
  const mainReversedLines = [...resultLines].reverse();
  const transReversedLines = transLayout ? [...transLayout.lines].reverse() : [];

  return (
    <div className="w-full bg-cream-light/40 border border-border/80 rounded-2xl p-4 sm:p-5 my-6 font-sans text-xs sm:text-sm text-ink/90 relative overflow-hidden">
      {/* Cinnabar stamp background detail */}
      <div className="absolute top-3 right-4 select-none pointer-events-none border border-dashed border-terracotta/20 text-terracotta/35 font-serif text-[10px] sm:text-xs flex items-center justify-center p-1.5 rounded-sm opacity-60 scale-90 sm:scale-100" style={{ writingMode: 'vertical-rl' }}>
        卦摊排盘印
      </div>

      {/* Frame border */}
      <div className="absolute inset-1 border border-gold/5 pointer-events-none rounded-xl" />

      {/* Common Header: Time, GZ, Xun Kong */}
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

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
          <span className="px-2 py-0.5 rounded bg-cream border border-border/60 text-[10px] sm:text-xs font-light">
            <span className="text-muted">干支：</span>
            <strong className="font-normal text-ink">{yearGanzhi}年 {monthGanzhi}月 {dayGanzhi}日 {hourGanzhi}时</strong>
          </span>
        </div>
      </div>

      {/* Hexagram Tables container */}
      <div className={`grid grid-cols-1 ${hasChanging ? 'lg:grid-cols-2' : ''} gap-6`}>
        {/* 1. Main Hexagram Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 border-b border-gold/10 pb-1.5">
            <h4 className="font-serif text-[13px] sm:text-sm font-medium text-ink flex items-center gap-1.5">
              <span className="text-terracotta">●</span>
              <span>本卦：{mainHexagram?.name} ({mainHexagram?.unicode})</span>
            </h4>
            <span className="px-2 py-0.5 rounded bg-terracotta-tint text-terracotta text-[10px] font-light">
              {palaceName}宫{palaceElement} {isYouhun && '· 游魂'} {isGuihun && '· 归魂'}
            </span>
          </div>
          
          <div className="overflow-x-auto scrollbar-none">
            <table className="w-full text-center border-collapse min-w-[340px]">
              <thead>
                <tr className="border-b border-border/30 text-muted font-light text-[10px] sm:text-xs">
                  <th className="py-1 px-1 text-left w-12">六神</th>
                  <th className="py-1 px-1 w-10">爻位</th>
                  <th className="py-1 px-1 w-12 border-l border-border/10">六亲</th>
                  <th className="py-1 px-1 w-16">纳支五行</th>
                  <th className="py-1 px-1 w-20">爻象</th>
                  <th className="py-1 px-1 w-10">世应</th>
                  <th className="py-1 px-1 text-right w-12 border-l border-border/10">状态</th>
                </tr>
              </thead>
              <tbody>
                {mainReversedLines.map((line) => {
                  const isChanging = line.value === 6 || line.value === 9;
                  return (
                    <tr
                      key={line.position}
                      className={`border-b border-border/15 text-[11px] sm:text-xs transition-colors hover:bg-cream-light/20 ${
                        line.isShi ? 'bg-gold-tint/5' : ''
                      }`}
                    >
                      <td className="py-2 px-1 text-left font-light text-muted">{line.beast}</td>
                      <td className="py-2 px-1 font-light text-muted">{getPositionName(line.position)}</td>
                      <td className={`py-2 px-1 font-medium border-l border-border/10 ${isChanging ? 'text-terracotta' : 'text-ink/80'}`}>
                        {line.relation}
                      </td>
                      <td className="py-2 px-1 font-light">
                        <span className="text-ink">{line.branch}</span>
                        <span className="text-[10px] text-muted ml-0.5">({line.element})</span>
                      </td>
                      <td className={`py-2 px-1 font-mono text-xs sm:text-sm tracking-wider ${
                        isChanging ? 'text-terracotta font-semibold' : 'text-gold'
                      }`}>
                        {getLineSymbol(line.value)}
                      </td>
                      <td className="py-2 px-1 font-medium">
                        {line.isShi && <span className="px-1 py-0.5 rounded bg-gold/20 text-gold text-[9px] font-sans">世</span>}
                        {line.isYing && <span className="px-1 py-0.5 rounded bg-border text-muted text-[9px] font-sans font-light">应</span>}
                      </td>
                      <td className="py-2 px-1 text-right border-l border-border/10">{renderStatus(line)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Transformed Hexagram Table (Only if changing lines exist) */}
        {hasChanging && transLayout && transHexagram && (
          <div className="space-y-3 lg:border-l lg:border-border/30 lg:pl-6">
            <div className="flex items-center justify-between px-1 border-b border-gold/10 pb-1.5">
              <h4 className="font-serif text-[13px] sm:text-sm font-medium text-ink flex items-center gap-1.5">
                <span className="text-gold">▲</span>
                <span>变卦：{transHexagram.name} ({transHexagram.unicode})</span>
              </h4>
              <span className="px-2 py-0.5 rounded bg-gold-tint text-gold border border-gold/15 text-[10px] font-light">
                {transLayout.palaceName}宫{transLayout.palaceElement} {transLayout.isYouhun && '· 游魂'} {transLayout.isGuihun && '· 归魂'}
              </span>
            </div>

            <div className="overflow-x-auto scrollbar-none">
              <table className="w-full text-center border-collapse min-w-[340px]">
                <thead>
                  <tr className="border-b border-border/30 text-muted font-light text-[10px] sm:text-xs">
                    <th className="py-1 px-1 text-left w-12">六神</th>
                    <th className="py-1 px-1 w-10">爻位</th>
                    <th className="py-1 px-1 w-12 border-l border-border/10">六亲</th>
                    <th className="py-1 px-1 w-16">纳支五行</th>
                    <th className="py-1 px-1 w-20">爻象</th>
                    <th className="py-1 px-1 w-10">世应</th>
                    <th className="py-1 px-1 text-right w-12 border-l border-border/10">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {transReversedLines.map((line) => {
                    // Check if this line corresponds to a changing position in the main hexagram
                    const mainLine = resultLines[line.position - 1];
                    const isChangedFromMain = mainLine?.isChanging;
                    
                    return (
                      <tr
                        key={line.position}
                        className={`border-b border-border/15 text-[11px] sm:text-xs transition-colors hover:bg-cream-light/20 ${
                          line.isShi ? 'bg-gold-tint/5' : ''
                        }`}
                      >
                        <td className="py-2 px-1 text-left font-light text-muted">{line.beast}</td>
                        <td className="py-2 px-1 font-light text-muted">{getPositionName(line.position)}</td>
                        <td className={`py-2 px-1 font-medium border-l border-border/10 ${isChangedFromMain ? 'text-terracotta' : 'text-ink/80'}`}>
                          {line.relation}
                        </td>
                        <td className="py-2 px-1 font-light">
                          <span className="text-ink">{line.branch}</span>
                          <span className="text-[10px] text-muted ml-0.5">({line.element})</span>
                        </td>
                        <td className={`py-2 px-1 font-mono text-xs sm:text-sm tracking-wider ${
                          isChangedFromMain ? 'text-terracotta font-semibold' : 'text-gold'
                        }`}>
                          {getLineSymbol(line.value)}
                        </td>
                        <td className="py-2 px-1 font-medium">
                          {line.isShi && <span className="px-1 py-0.5 rounded bg-gold/20 text-gold text-[9px] font-sans">世</span>}
                          {line.isYing && <span className="px-1 py-0.5 rounded bg-border text-muted text-[9px] font-sans font-light">应</span>}
                        </td>
                        <td className="py-2 px-1 text-right border-l border-border/10">{renderStatus(line)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Guide tip */}
      <div className="mt-4 border-t border-border/30 pt-3 text-[9px] sm:text-[10px] text-muted/70 font-light text-center sm:text-left leading-relaxed">
        ※ 提示：排盘包含本卦与之卦的世应、纳甲、六亲、六神，已作为上下文提供给“小卦摊摊主”AI。本卦和变卦的六亲和六亲的五行可能不同，系由各自宫位五行独立推算，卦图及爻象均一一对应呈现。
      </div>
    </div>
  );
}
