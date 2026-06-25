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
import { saveRecord } from '../../utils/storage';
import { v4 as uuidv4 } from 'uuid';
import { useState, useEffect } from 'react';
import { AIInterpretation } from '../../components/shared/AIInterpretation';

export function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { question: string; lines: LineValue[] } | null;
  const [saved, setSaved] = useState(false);

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

  const handleSave = () => {
    const record = {
      id: uuidv4(),
      timestamp: Date.now(),
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
      <div className="min-h-screen bg-cream px-6 py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-pill bg-terracotta-tint text-terracotta text-sm font-light">
              卦象解读
            </div>
            {question && (
              <p className="text-muted font-light text-sm">
                问：{question}
              </p>
            )}
          </div>

          {/* Main Hexagram */}
          <div className="bg-cream-light rounded-3xl border border-border p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <HexagramDisplay
                  structure={structure}
                  changingLines={changingLinePositions}
                  size="lg"
                />
              </div>

              <div>
                <h2 className="text-4xl font-serif text-ink">
                  {mainHexagram.unicode} {mainHexagram.name}
                </h2>
                <p className="text-muted font-light text-sm mt-2">
                  上{mainHexagram.upper} 下{mainHexagram.lower}
                </p>
              </div>
            </div>

            {/* Judgment Text */}
            {mainHexagram.judgment && (
              <div className="pt-6 border-t border-border space-y-4">
                <h3 className="text-lg font-serif text-ink">卦辞</h3>
                {mainHexagram.judgment.original && (
                  <p className="text-sm text-ink font-light leading-relaxed">
                    {mainHexagram.judgment.original}
                  </p>
                )}
                {mainHexagram.judgment.translation && (
                  <p className="text-sm text-muted font-light leading-relaxed">
                    {mainHexagram.judgment.translation}
                  </p>
                )}
              </div>
            )}

            {/* Changing Lines */}
            {changingLinePositions.length > 0 && (
              <div className="pt-6 border-t border-border space-y-4">
                <h3 className="text-lg font-serif text-ink">变爻</h3>
                <div className="space-y-3">
                  {changingLinePositions.map((position) => (
                    <div key={position} className="text-sm">
                      <span className="text-terracotta font-normal">第 {position} 爻变</span>
                      {mainHexagram.lines && mainHexagram.lines[position - 1] && (
                        <div className="mt-1 space-y-1">
                          <p className="text-ink font-light">
                            {mainHexagram.lines[position - 1].original}
                          </p>
                          <p className="text-muted font-light text-xs">
                            {mainHexagram.lines[position - 1].translation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transformed Hexagram */}
            {transformedHexagram && (
              <div className="pt-6 border-t border-border space-y-4">
                <h3 className="text-lg font-serif text-ink">之卦</h3>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-serif text-ink">
                    {transformedHexagram.unicode} {transformedHexagram.name}
                  </p>
                  <p className="text-muted font-light text-sm">
                    事态发展的走向
                  </p>
                </div>

                {/* Transformed Hexagram Judgment */}
                {transformedHexagram.judgment && (
                  <div className="mt-4 space-y-3">
                    {transformedHexagram.judgment.original && (
                      <p className="text-sm text-ink font-light leading-relaxed">
                        {transformedHexagram.judgment.original}
                      </p>
                    )}
                    {transformedHexagram.judgment.translation && (
                      <p className="text-sm text-muted font-light leading-relaxed">
                        {transformedHexagram.judgment.translation}
                      </p>
                    )}
                  </div>
                )}

                {/* Transformed Hexagram Interpretation */}
                {transformedHexagram.interpretation?.general && (
                  <div className="mt-3">
                    <p className="text-sm text-muted font-light leading-relaxed">
                      {transformedHexagram.interpretation.general}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* General Interpretation */}
            {mainHexagram.interpretation?.general && (
              <div className="pt-6 border-t border-border space-y-4">
                <h3 className="text-lg font-serif text-ink">卦象解读</h3>
                <p className="text-sm text-muted font-light leading-relaxed">
                  {mainHexagram.interpretation.general}
                </p>
              </div>
            )}

            {/* Detailed Guidance */}
            <div className="pt-6 border-t border-border space-y-4">
              <h3 className="text-lg font-serif text-ink">占断指南</h3>
              <div className="space-y-3 text-sm text-muted font-light leading-relaxed">
                <div className="bg-cream rounded-2xl p-4 space-y-2">
                  <p className="text-ink font-normal">📖 本卦（现状）</p>
                  <p>本卦 <strong className="text-ink">{mainHexagram.name}</strong> 反映当前的状况和形势。{mainHexagram.upper}上{mainHexagram.lower}下，需要理解上下卦的关系和相互作用。</p>
                </div>

                {changingLinePositions.length > 0 && (
                  <div className="bg-cream rounded-2xl p-4 space-y-2">
                    <p className="text-ink font-normal">🔄 变爻（关键）</p>
                    <p>
                      {changingLinePositions.length === 1 && '有一个变爻，表明此爻位是事态的关键点。'}
                      {changingLinePositions.length === 2 && '有两个变爻，以上爻为主来判断。'}
                      {changingLinePositions.length === 3 && '有三个变爻，观察本卦和之卦的卦辞来判断。'}
                      {changingLinePositions.length === 4 && '有四个变爻，以之卦的两个不变爻辞为主。'}
                      {changingLinePositions.length === 5 && '有五个变爻，以之卦的那一个不变爻辞为主。'}
                      {changingLinePositions.length === 6 && '六爻皆变，观察之卦卦辞，并参考乾坤二卦的用九用六。'}
                      变爻的爻辞最为重要，需重点参考。
                    </p>
                  </div>
                )}

                {transformedHexagram && (
                  <div className="bg-cream rounded-2xl p-4 space-y-2">
                    <p className="text-ink font-normal">➡️ 之卦（趋势）</p>
                    <p>之卦 <strong className="text-ink">{transformedHexagram.name}</strong> 显示事态的发展方向和最终结果。从本卦到之卦的变化，揭示了事物的动态演变过程。</p>
                  </div>
                )}

                {!changingLinePositions.length && (
                  <div className="bg-cream rounded-2xl p-4 space-y-2">
                    <p className="text-ink font-normal">⚪ 无变爻</p>
                    <p>六爻皆不变，说明局面相对稳定，主要参考本卦的卦辞和整体卦象来判断。事态暂时不会有大的变化。</p>
                  </div>
                )}

                <div className="bg-terracotta-tint rounded-2xl p-4 space-y-2">
                  <p className="text-terracotta font-normal">💡 解卦提示</p>
                  <p className="text-ink">
                    占卜只是参考，最重要的是结合实际情况理性分析。卦象提供的是一个思考的角度和可能的趋势，具体如何行动还需要自己权衡判断。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Interpretation */}
          <AIInterpretation type="liuyao" data={aiData} />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleSave}
              disabled={saved}
              variant="primary"
            >
              {saved ? '✓ 已保存' : '保存记录'}
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
    </PageTransition>
  );
}
