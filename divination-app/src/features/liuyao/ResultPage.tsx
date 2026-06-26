import { useLocation, useNavigate } from 'react-router-dom';
import { PageTransition } from '../../components/shared/PageTransition';
import { Button } from '../../components/shared/Button';
import { HexagramDisplay } from '../../components/shared/HexagramDisplay';
import type { LineValue } from '../../utils/liuyao';
import {
  linesToStructure,
  getHexagramByStructure,
  getChangingLines,
  getTransformedHexagram
} from '../../utils/hexagram';
import { calculateLiuyaoLayout } from '../../utils/liuyaoLayout';
import { saveRecord } from '../../utils/storage';
import { v4 as uuidv4 } from 'uuid';
import { useState, useEffect } from 'react';
import { AIInterpretation } from '../../components/shared/AIInterpretation';
import { NajiaTable } from '../../components/shared/NajiaTable';
import { SharePosterModal } from '../../components/shared/SharePosterModal';

export function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { question: string; lines: LineValue[]; timestamp?: number } | null;
  const [saved, setSaved] = useState(false);
  const [timestamp] = useState(state?.timestamp || Date.now());
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  useEffect(() => {
    if (!state) {
      navigate('/liuyao', { replace: true });
    }
  }, [state, navigate]);

  if (!state) return null;

  const { question, lines } = state;

  const structure = linesToStructure(lines);
  const mainHexagram = getHexagramByStructure(structure);
  const changingLinePositions = getChangingLines(lines);
  const transformedHexagram = getTransformedHexagram(lines);

  // Calculate layout parameters for titles
  const mainLayout = calculateLiuyaoLayout(lines, timestamp);
  const { palaceName, palaceElement } = mainLayout;

  let transLayout: any = null;
  if (changingLinePositions.length > 0) {
    const transLines = lines.map(v => {
      if (v === 9) return 8;
      if (v === 6) return 7;
      return v;
    });
    transLayout = calculateLiuyaoLayout(transLines, timestamp);
  }

  const handleSave = () => {
    const record = {
      id: uuidv4(),
      timestamp,
      type: 'liuyao' as const,
      question,
      data: {
        mainHexagram: mainHexagram?.id,
        changingLines: changingLinePositions,
        transformedHexagram: transformedHexagram?.id || null
      }
    };

    const success = saveRecord(record);
    if (success) {
      setSaved(true);
    }
  };

  if (!mainHexagram) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-cream flex items-center justify-center px-6">
          <p className="text-muted">卦象数据错误</p>
        </div>
      </PageTransition>
    );
  }

  const aiData = {
    question,
    timestamp,
    lines,
    mainHexagram: {
      name: mainHexagram.name,
      unicode: mainHexagram.unicode,
      judgment: mainHexagram.judgment ? {
        original: mainHexagram.judgment.original || '',
        translation: mainHexagram.judgment.translation || ''
      } : undefined,
      lines: mainHexagram.lines ? mainHexagram.lines.map(line => ({
        original: line.original || '',
        translation: line.translation || ''
      })) : undefined
    },
    changingLines: changingLinePositions,
    transformedHexagram: transformedHexagram ? {
      name: transformedHexagram.name,
      unicode: transformedHexagram.unicode,
      judgment: transformedHexagram.judgment ? {
        original: transformedHexagram.judgment.original || '',
        translation: transformedHexagram.judgment.translation || ''
      } : undefined
    } : null
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-cream px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-pill bg-terracotta-tint text-terracotta text-sm font-light">
              卦象解读
            </div>
            {question && (
              <p className="text-muted font-light text-sm sm:text-base px-4">
                问：{question}
              </p>
            )}
          </div>

          {/* Professional Najia Layout Board Card */}
          <NajiaTable lines={lines} timestamp={timestamp} />

          {/* Symmetrical Hexagram Details (Judgment & Line Statements) */}
          <div className={`grid grid-cols-1 ${transformedHexagram ? 'md:grid-cols-2' : ''} gap-6 sm:gap-8`}>
            {/* 1. Main Hexagram Card */}
            <div className="bg-cream-light rounded-3xl border border-border p-6 sm:p-8 space-y-6">
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <HexagramDisplay
                    structure={structure}
                    changingLines={changingLinePositions}
                    size="lg"
                  />
                </div>
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-terracotta-tint text-terracotta text-[10px] font-sans font-light mb-1.5">
                    本卦（当前状况）
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif text-ink">
                    {mainHexagram.unicode} {mainHexagram.name}
                  </h2>
                  <p className="text-muted font-light text-xs mt-1">
                    上{mainHexagram.upper} 下{mainHexagram.lower} · {palaceName}宫{palaceElement}
                  </p>
                </div>
              </div>

              {/* Main Hexagram Judgment */}
              {mainHexagram.judgment && (
                <div className="pt-5 border-t border-border/50 space-y-2">
                  <h3 className="text-xs sm:text-sm font-serif font-medium text-ink flex items-center gap-1.5">
                    <span className="text-terracotta text-[10px]">◆</span> 卦辞
                  </h3>
                  <div className="text-xs sm:text-sm text-ink font-normal leading-relaxed bg-cream/40 p-3.5 rounded-2xl border border-border/20">
                    <strong>{mainHexagram.judgment.original}</strong>
                  </div>
                  {mainHexagram.judgment.translation && (
                    <p className="text-[11px] sm:text-xs text-muted font-light leading-relaxed px-1">
                      {mainHexagram.judgment.translation}
                    </p>
                  )}
                </div>
              )}

              {/* Main Hexagram 6 Lines 爻辞 */}
              {mainHexagram.lines && (
                <div className="pt-5 border-t border-border/50 space-y-3">
                  <h3 className="text-xs sm:text-sm font-serif font-medium text-ink flex items-center gap-1.5">
                    <span className="text-terracotta text-[10px]">◆</span> 爻辞 (自下而上)
                  </h3>
                  <div className="space-y-3">
                    {[...mainHexagram.lines].reverse().map((line) => {
                      const pos = line.position;
                      const isChanging = changingLinePositions.includes(pos);
                      return (
                        <div
                          key={pos}
                          className={`p-3.5 rounded-2xl border transition-all text-xs space-y-1 ${
                            isChanging
                              ? 'bg-terracotta-tint/20 border-terracotta/30 shadow-sm'
                              : 'bg-cream/20 border-border/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${isChanging ? 'text-terracotta font-semibold' : 'text-ink/70'}`}>
                              {pos === 6 ? '上爻' : pos === 1 ? '初爻' : `${pos}爻`}
                              {isChanging && <span className="ml-1.5 px-1.5 py-0.5 rounded bg-terracotta/10 text-[9px] font-sans font-light">变爻</span>}
                            </span>
                          </div>
                          <p className="text-ink font-light leading-relaxed">
                            {line.original}
                          </p>
                          {line.translation && (
                            <p className="text-muted font-light leading-normal text-[11px] pt-1 border-t border-dashed border-border/10 mt-1">
                              {line.translation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Transformed Hexagram Card */}
            {transformedHexagram && transLayout && (
              <div className="bg-cream-light rounded-3xl border border-border p-6 sm:p-8 space-y-6">
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <HexagramDisplay
                      structure={linesToStructure(
                        lines.map(v => {
                          if (v === 9) return 8;
                          if (v === 6) return 7;
                          return v;
                        })
                      )}
                      changingLines={[]}
                      size="lg"
                    />
                  </div>
                  <div>
                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-gold-tint text-gold border border-gold/15 text-[10px] font-sans font-light mb-1.5">
                      之卦（发展结果）
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif text-ink">
                      {transformedHexagram.unicode} {transformedHexagram.name}
                    </h2>
                    <p className="text-muted font-light text-xs mt-1">
                      上{transformedHexagram.upper} 下{transformedHexagram.lower} · {transLayout.palaceName}宫{transLayout.palaceElement}
                    </p>
                  </div>
                </div>

                {/* Transformed Hexagram Judgment */}
                {transformedHexagram.judgment && (
                  <div className="pt-5 border-t border-border/50 space-y-2">
                    <h3 className="text-xs sm:text-sm font-serif font-medium text-ink flex items-center gap-1.5">
                      <span className="text-gold text-[10px]">◆</span> 卦辞
                    </h3>
                    <div className="text-xs sm:text-sm text-ink font-normal leading-relaxed bg-cream/40 p-3.5 rounded-2xl border border-border/20">
                      <strong>{transformedHexagram.judgment.original}</strong>
                    </div>
                    {transformedHexagram.judgment.translation && (
                      <p className="text-[11px] sm:text-xs text-muted font-light leading-relaxed px-1">
                        {transformedHexagram.judgment.translation}
                      </p>
                    )}
                  </div>
                )}

                {/* Transformed Hexagram 6 Lines 爻辞 */}
                {transformedHexagram.lines && (
                  <div className="pt-5 border-t border-border/50 space-y-3">
                    <h3 className="text-xs sm:text-sm font-serif font-medium text-ink flex items-center gap-1.5">
                      <span className="text-gold text-[10px]">◆</span> 爻辞 (自下而上)
                    </h3>
                    <div className="space-y-3">
                      {[...transformedHexagram.lines].reverse().map((line) => {
                        const pos = line.position;
                        const isChangedFromMain = changingLinePositions.includes(pos);
                        return (
                          <div
                            key={pos}
                            className={`p-3.5 rounded-2xl border transition-all text-xs space-y-1 ${
                              isChangedFromMain
                                ? 'bg-gold-tint/20 border-gold/30 shadow-sm'
                                : 'bg-cream/20 border-border/10'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`font-medium ${isChangedFromMain ? 'text-gold font-semibold' : 'text-ink/70'}`}>
                                {pos === 6 ? '上爻' : pos === 1 ? '初爻' : `${pos}爻`}
                                {isChangedFromMain && <span className="ml-1.5 px-1.5 py-0.5 rounded bg-gold/10 text-[9px] font-sans font-light">变出</span>}
                              </span>
                            </div>
                            <p className="text-ink font-light leading-relaxed">
                              {line.original}
                            </p>
                            {line.translation && (
                              <p className="text-muted font-light leading-normal text-[11px] pt-1 border-t border-dashed border-border/10 mt-1">
                                {line.translation}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Interpretation */}
          <AIInterpretation type="liuyao" data={aiData} onResultLoaded={setAiResult} />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={handleSave}
              disabled={saved}
              variant="primary"
            >
              {saved ? '✓ 已保存' : '保存记录'}
            </Button>
            <Button
              onClick={() => setShareModalOpen(true)}
              variant="secondary"
            >
              🌌 分享结果
            </Button>
            <Button
              onClick={() => navigate('/liuyao')}
              variant="secondary"
            >
              再占一卦
            </Button>
            <Button
              onClick={() => navigate('/history')}
              variant="ghost"
            >
              查看历史
            </Button>
          </div>
        </div>
      </div>
      <SharePosterModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        type="liuyao"
        data={aiData}
        aiResult={aiResult}
      />
    </PageTransition>
  );
}
