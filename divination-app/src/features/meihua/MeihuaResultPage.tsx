import { useLocation, useNavigate } from 'react-router-dom';
import { PageTransition } from '../../components/shared/PageTransition';
import { Button } from '../../components/shared/Button';
import { HexagramDisplay } from '../../components/shared/HexagramDisplay';
import { type MeihuaResult, getTrigramName } from '../../utils/meihua';
import { getHexagramByStructure } from '../../utils/hexagram';
import { saveRecord } from '../../utils/storage';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import { AIInterpretation } from '../../components/shared/AIInterpretation';

export function MeihuaResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as MeihuaResult | undefined;
  const question = location.state?.question as string | undefined;
  const [saved, setSaved] = useState(false);

  if (!result) {
    navigate('/meihua', { replace: true });
    return null;
  }

  const hexagram = getHexagramByStructure(result.hexagramStructure);
  const transformedHexagram = result.transformedStructure
    ? getHexagramByStructure(result.transformedStructure)
    : null;

  if (!hexagram) {
    navigate('/meihua', { replace: true });
    return null;
  }

  const handleSave = () => {
    const record = {
      id: uuidv4(),
      timestamp: Date.now(),
      type: 'meihua' as const,
      question,
      data: {
        method: result.method,
        inputValues: result.input.numbers || result.input.timestamp,
        hexagram: hexagram.id,
        changingLine: result.changingLine,
      },
    };

    const success = saveRecord(record);
    if (success) {
      setSaved(true);
    }
  };

  const getInputDisplay = () => {
    if (result.method === 'number' && result.input.numbers) {
      const [n1, n2, n3] = result.input.numbers;
      return (
        <div className="space-y-2 font-sans">
          <p className="text-xs text-muted tracking-wide">起卦方式：数字起卦 (梅花易数)</p>
          <div className="flex gap-6 text-base text-ink font-light">
            <span>第一数：<strong className="text-gold font-normal">{n1}</strong></span>
            <span>第二数：<strong className="text-gold font-normal">{n2}</strong></span>
            <span>第三数：<strong className="text-gold font-normal">{n3}</strong></span>
          </div>
        </div>
      );
    }

    if (result.method === 'time' && result.input.timestamp) {
      const { year, month, day, hour, lunarStr } = result.input.timestamp;
      return (
        <div className="space-y-2 font-sans">
          <p className="text-xs text-muted tracking-wide">起卦方式：时间起卦 (梅花易数)</p>
          <div className="text-base text-ink font-light">
            <p><strong className="text-gold font-normal">{year}年 {month}月 {day}日 {hour}时</strong></p>
            {lunarStr && (
              <p className="text-xs text-gold mt-1.5 border-t border-border/30 pt-1">
                ✨ {lunarStr}
              </p>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  const meihuaData = {
    question,
    method: result.method,
    upperTrigram: getTrigramName(result.upperTrigram),
    lowerTrigram: getTrigramName(result.lowerTrigram),
    mainHexagram: {
      name: hexagram.name,
      unicode: hexagram.unicode,
      judgment: hexagram.judgment ? {
        original: hexagram.judgment.original || '',
        translation: hexagram.judgment.translation || ''
      } : undefined,
      lines: hexagram.lines ? hexagram.lines.map(line => ({
        original: line.original || '',
        translation: line.translation || ''
      })) : undefined
    },
    changingLine: result.changingLine,
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
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="max-w-3xl w-full space-y-8 relative z-10">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full border border-terracotta/20 bg-terracotta-tint text-terracotta text-xs font-sans tracking-widest uppercase">
              梅花易象解读
            </div>
            {question && (
              <p className="text-muted font-light text-sm">
                问：{question}
              </p>
            )}
            {getInputDisplay() && (
              <div className="bg-cream-light/60 backdrop-blur-md rounded-2xl border border-border/80 p-5 inline-block text-left mx-auto font-sans">
                {getInputDisplay()}
              </div>
            )}
          </div>

          {/* Hexagram Display Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* 本卦 */}
            <div className="bg-cream-light/60 backdrop-blur-md rounded-3xl border border-border p-8 flex flex-col items-center space-y-6">
              <div className="text-center space-y-2">
                <span className="text-[10px] text-gold tracking-widest font-sans uppercase">本卦 (主卦)</span>
                <h2 className="text-3xl font-serif text-ink tracking-wide">
                  {hexagram.unicode} {hexagram.name}
                </h2>
              </div>
              <div className="p-4 bg-cream/30 border border-border/10 rounded-2xl">
                <HexagramDisplay
                  structure={result.hexagramStructure}
                  changingLines={[result.changingLine]}
                  size="lg"
                />
              </div>
              <div className="text-center font-sans">
                <p className="text-xs text-muted">
                  动爻：第 <strong className="text-terracotta">{result.changingLine}</strong> 爻变
                </p>
              </div>
            </div>

            {/* 变卦 */}
            {transformedHexagram && (
              <div className="bg-cream-light/60 backdrop-blur-md rounded-3xl border border-border p-8 flex flex-col items-center space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-[10px] text-terracotta tracking-widest font-sans uppercase">变卦 (之卦)</span>
                  <h2 className="text-3xl font-serif text-ink tracking-wide">
                    {transformedHexagram.unicode} {transformedHexagram.name}
                  </h2>
                </div>
                <div className="p-4 bg-cream/30 border border-border/10 rounded-2xl">
                  <HexagramDisplay
                    structure={result.transformedStructure!}
                    size="lg"
                  />
                </div>
                <div className="text-center font-sans">
                  <p className="text-xs text-muted">
                    展示事物演变的最终走向
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Trigram Composition Details */}
          <div className="bg-cream-light/60 backdrop-blur-md rounded-3xl border border-border p-6 space-y-4 font-sans">
            <h2 className="text-base font-serif text-ink tracking-wide">卦象构成 (体用分析)</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-cream/40 border border-border/10 rounded-2xl p-4 space-y-1">
                <p className="text-xs text-muted">上卦</p>
                <p className="text-xl font-serif text-gold">
                  {getTrigramName(result.upperTrigram)}
                </p>
              </div>
              <div className="bg-cream/40 border border-border/10 rounded-2xl p-4 space-y-1">
                <p className="text-xs text-muted">下卦</p>
                <p className="text-xl font-serif text-gold">
                  {getTrigramName(result.lowerTrigram)}
                </p>
              </div>
            </div>
          </div>

          {/* Texts interpretation */}
          <div className="bg-cream-light/60 backdrop-blur-md rounded-3xl border border-border p-8 space-y-6 font-sans">
            {/* 本卦卦辞 */}
            {hexagram.judgment && (
              <div className="space-y-3">
                <h3 className="text-base font-serif text-gold border-l-2 border-gold pl-2">本卦卦辞</h3>
                <div className="space-y-2">
                  <p className="text-base text-ink font-serif leading-relaxed">
                    {hexagram.judgment.original}
                  </p>
                  <p className="text-xs text-muted font-sans font-light leading-relaxed">
                    {hexagram.judgment.translation}
                  </p>
                </div>
              </div>
            )}

            {/* 动爻爻辞 */}
            {hexagram.lines && hexagram.lines[result.changingLine - 1] && (
              <div className="pt-6 border-t border-border/50 space-y-3">
                <h3 className="text-base font-serif text-gold border-l-2 border-gold pl-2">
                  动爻爻辞 (第 {result.changingLine} 爻)
                </h3>
                <div className="space-y-2">
                  <p className="text-base text-ink font-serif leading-relaxed">
                    {hexagram.lines[result.changingLine - 1].original}
                  </p>
                  <p className="text-xs text-muted font-sans font-light leading-relaxed">
                    {hexagram.lines[result.changingLine - 1].translation}
                  </p>
                </div>
              </div>
            )}

            {/* 变卦卦辞 */}
            {transformedHexagram && transformedHexagram.judgment && (
              <div className="pt-6 border-t border-border/50 space-y-3">
                <h3 className="text-base font-serif text-gold border-l-2 border-gold pl-2">变卦卦辞</h3>
                <div className="space-y-2">
                  <p className="text-base text-ink font-serif leading-relaxed">
                    {transformedHexagram.judgment.original}
                  </p>
                  <p className="text-xs text-muted font-sans font-light leading-relaxed">
                    {transformedHexagram.judgment.translation}
                  </p>
                </div>
              </div>
            )}

            {/* General Interpretation */}
            {hexagram.interpretation && (
              <div className="pt-6 border-t border-border/50 space-y-3">
                <h3 className="text-base font-serif text-gold border-l-2 border-gold pl-2">断语解读</h3>
                <p className="text-sm text-muted font-sans font-light leading-relaxed">
                  {hexagram.interpretation.general}
                </p>
              </div>
            )}
          </div>

          {/* Meihua Interpretation Guide */}
          <div className="bg-cream-light/60 backdrop-blur-md rounded-3xl border border-border p-8 space-y-6 font-sans">
            <h2 className="text-base font-serif text-ink tracking-wide">梅花易数解卦要点</h2>
            <div className="space-y-4 text-xs text-muted leading-relaxed font-sans font-light">
              <div className="bg-cream/40 border border-border/10 rounded-2xl p-4 space-y-2">
                <p className="text-ink font-medium">📖 体卦与用卦（体用分析）</p>
                <p>
                  梅花易数以动爻分体用。<strong>无动爻的卦为体卦，有动爻的卦为用卦。</strong><br/>
                  · 体卦代表自身、主方、占者；用卦代表他人、客方、占问之事。<br/>
                  · 比如本卦中，{result.changingLine <= 3 ? '上卦为体，下卦为用' : '下卦为体，上卦为用'}。若体用五行相生相助（如用生体，或体用同五行）则大吉；若体用相克（如用克体）则为不吉。
                </p>
              </div>

              <div className="bg-cream/40 border border-border/10 rounded-2xl p-4 space-y-2">
                <p className="text-ink font-medium">🔄 动爻之机变</p>
                <p>
                  第 <strong>{result.changingLine}</strong> 爻为动爻，是阴阳交替、吉凶转化的触发点。动爻的变动产生之卦（变卦），表示事态由静态向动态演变，指示了未来的发展与结果。
                </p>
              </div>

              <div className="bg-cream/40 border border-border/10 rounded-2xl p-4 space-y-2">
                <p className="text-ink font-medium">🎯 观物取象</p>
                <p>
                  梅花易数极具灵活性，除起卦所得数外，需配合起卦时的“外应”（如突然的声音、风向、所见吉兆物等）。数字法重卦理，时间法重时令（如秋金旺、春木旺等五行衰旺），皆需感而遂通。
                </p>
              </div>

              <div className="bg-terracotta-tint border border-terracotta/20 rounded-2xl p-5 space-y-2">
                <p className="text-terracotta font-medium flex items-center gap-1.5">
                  <span>💡</span>
                  <span>解卦提示</span>
                </p>
                <p className="text-ink text-xs leading-relaxed">
                  易数变化，在乎一心。卦辞爻辞均提供思维联想模型，切忌盲目生搬硬套。请平心静气结合心中占问的具体事项进行参悟。
                </p>
              </div>
            </div>
          </div>

          {/* AI Interpretation */}
          <AIInterpretation type="meihua" data={meihuaData} />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleSave} disabled={saved} variant="primary" className="flex-1">
              {saved ? '✓ 已保存至历史' : '保存记录'}
            </Button>
            <Button
              onClick={() => navigate('/meihua')}
              variant="secondary"
              className="flex-1"
            >
              再占一卦
            </Button>
            <Button
              onClick={() => navigate('/history')}
              variant="ghost"
              className="flex-1"
            >
              查看历史 →
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
