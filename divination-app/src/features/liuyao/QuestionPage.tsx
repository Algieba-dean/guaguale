import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../../components/shared/PageTransition';
import { Button } from '../../components/shared/Button';

export function QuestionPage() {
  const [question, setQuestion] = useState('');
  const navigate = useNavigate();
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualDateTime, setManualDateTime] = useState('');
  const [manualLines, setManualLines] = useState<number[]>([7, 7, 7, 7, 7, 7]);

  const handleStart = (mode: 'ritual' | 'quick') => {
    navigate('/liuyao/shake', { state: { question, mode } });
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full space-y-8 relative z-10">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full border border-gold/20 bg-gold-tint text-gold text-xs font-sans tracking-widest uppercase">
              六爻占卜 · Liuyao
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-ink tracking-wide">
              心中所问，<span className="text-gold italic font-calligraphy">卦象可解</span>
            </h1>
            <p className="text-muted font-sans font-light leading-relaxed text-sm max-w-lg mx-auto">
              静心凝神，将你想要询问的事情写在下方。心诚则灵，问题可具体亦可为心中一时之困惑。
            </p>
          </div>

          {/* Question Input */}
          <div className="bg-cream-light/60 backdrop-blur-md rounded-3xl border border-border p-8 space-y-6">
            <div>
              <label className="block text-ink font-sans font-light text-sm mb-3">
                你想问什么？（选填）
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={`例如：\n【占问事由】我与某公司合作的新项目这周能否顺利签约？\n【当前处境】方案已交，对方正在进行方案评审，预计周三给反馈。\n【期望时间】期望本周五前完成签约。\n（信息越详实，用神与应期推算越精准）`}
                className="w-full px-4 py-3 rounded-2xl border border-border bg-cream/60 text-ink placeholder-muted/65 font-sans font-light focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold resize-none text-sm transition-all duration-300"
                rows={5}
              />
              <p className="text-[11px] text-muted font-sans font-light mt-2">
                问题将保存在本地占卜记录中，方便日后回顾与验证卦验。
              </p>

              {/* Guochao Styled Guideline Card */}
              <div className="mt-4 p-4 bg-gold-tint/10 border border-gold/15 rounded-2xl space-y-2.5">
                <p className="text-xs text-gold font-medium flex items-center gap-1.5">
                  <span>💡</span>
                  <span>摊主解卦小贴士：如何提问更精准？</span>
                </p>
                <ul className="text-[11px] text-muted font-sans font-light leading-relaxed list-disc pl-4 space-y-1.5 text-left">
                  <li>
                    <strong className="text-ink/80 font-normal">明确主体与对象</strong>：如“我与某客户的合作”、“帮妹妹求升学考试”等。
                  </li>
                  <li>
                    <strong className="text-ink/80 font-normal">说明具体所求</strong>：六爻取“用神”需对应具体事物（如求职取“官鬼”、求财取“妻财”、求升学取“父母”），问法越明确，用神定位越准。
                  </li>
                  <li>
                    <strong className="text-ink/80 font-normal">设定时间范围</strong>：如“这周内”、“本月内”、“今年年底前”，这有利于推算精准的“应期”。
                  </li>
                  <li>
                    <strong className="text-ink/80 font-normal">补充当前简要现状</strong>：如“已于昨日提交方案，目前对方在审核”等，有助于大模型结合现实处境进行逻辑断卦。
                  </li>
                </ul>
              </div>
            </div>

            {/* Mode Selection */}
            <div className="space-y-4 pt-4">
              <p className="text-xs text-muted font-sans font-light tracking-wide">选择占卜方式：</p>
 
              <Button
                onClick={() => handleStart('ritual')}
                variant="primary"
                size="lg"
                className="w-full"
              >
                完整仪式 · 六次投掷
              </Button>
 
              <Button
                onClick={() => handleStart('quick')}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                快速模式 · 自动生成
              </Button>

              <Button
                onClick={() => {
                  setShowManualForm(!showManualForm);
                  if (!manualDateTime) {
                    const now = new Date();
                    const offset = now.getTimezoneOffset() * 60000;
                    const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
                    setManualDateTime(localISOTime);
                  }
                }}
                variant="secondary"
                size="lg"
                className="w-full border border-gold/30 text-gold bg-transparent hover:bg-gold-tint/20"
              >
                {showManualForm ? '收起手动指定' : '手动指定 · 自选爻象时间'}
              </Button>
            </div>

            {showManualForm && (
              <div className="pt-6 border-t border-border/80 space-y-5 text-left font-sans text-xs sm:text-sm">
                <h3 className="text-sm font-serif text-ink font-normal border-b border-border/40 pb-2 flex items-center justify-between">
                  <span>手动排盘配置</span>
                  <button
                    type="button"
                    onClick={() => {
                      setManualLines([7, 7, 7, 7, 7, 7]);
                    }}
                    className="text-[11px] text-muted hover:text-gold transition-colors font-sans font-light"
                  >
                    重置为全少阳
                  </button>
                </h3>
                
                {/* Divination Date & Time */}
                <div className="space-y-1.5">
                  <label className="block text-ink font-light">起卦时间</label>
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={manualDateTime}
                      onChange={(e) => setManualDateTime(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-cream/40 text-ink focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold transition-all text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const offset = now.getTimezoneOffset() * 60000;
                        const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
                        setManualDateTime(localISOTime);
                      }}
                      className="px-3 py-2.5 rounded-xl border border-border hover:border-gold/30 hover:text-gold text-muted text-xs transition-all bg-cream/10 shrink-0 font-sans font-light"
                    >
                      使用当前时间
                    </button>
                  </div>
                </div>

                {/* Visual Trigram/Hexagram Click Toggle Selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-ink font-light">自选爻象 (点击爻线切换阴阳动静)</label>
                    <span className="text-[10px] text-muted font-light">
                      少阳 ➡️ 少阴 ➡️ 老阳 ➡️ 老阴
                    </span>
                  </div>

                  <div className="bg-cream/30 border border-border/40 rounded-2xl p-4 flex flex-col items-center justify-center">
                    {/* Visual Hexagram Line Stack */}
                    <div className="w-full max-w-[320px] flex flex-col space-y-2 my-2">
                      {[...Array(6)].map((_, i) => {
                        const pos = 6 - i; // line position 6 down to 1
                        const linesIdx = pos - 1;
                        const val = manualLines[linesIdx];
                        
                        // Line styles and text
                        let symbolStr = '';
                        let typeLabel = '';
                        let colorClass = '';
                        
                        switch (val) {
                          case 7: // 少阳
                            symbolStr = '━━━━━━━━━━━━━━━';
                            typeLabel = '少阳 (静)';
                            colorClass = 'border-gold text-gold hover:bg-gold/5';
                            break;
                          case 8: // 少阴
                            symbolStr = '━━━━━━   ━━━━━━';
                            typeLabel = '少阴 (静)';
                            colorClass = 'border-gold/60 text-gold/80 hover:bg-gold/5';
                            break;
                          case 9: // 老阳
                            symbolStr = '━━━━━━━━━━━━━━━ ◯';
                            typeLabel = '老阳 (动)';
                            colorClass = 'border-terracotta text-terracotta hover:bg-terracotta/5';
                            break;
                          case 6: // 老阴
                            symbolStr = '━━━━━━ ✕ ━━━━━━';
                            typeLabel = '老阴 (动)';
                            colorClass = 'border-terracotta/80 text-terracotta/90 hover:bg-terracotta/5';
                            break;
                        }

                        // Cycle through values: 7 -> 8 -> 9 -> 6 -> 7
                        const handleToggle = () => {
                          const nextMap: Record<number, number> = { 7: 8, 8: 9, 9: 6, 6: 7 };
                          const updated = [...manualLines];
                          updated[linesIdx] = nextMap[val] || 7;
                          setManualLines(updated);
                        };

                        return (
                          <button
                            key={pos}
                            type="button"
                            onClick={handleToggle}
                            className={`w-full flex items-center justify-between px-4 py-2.5 border rounded-xl cursor-pointer transition-all ${colorClass}`}
                          >
                            <span className="font-serif text-xs font-light select-none w-12 text-left">
                              {pos === 6 ? '上爻' : pos === 1 ? '初爻' : `${pos}爻`}
                            </span>
                            <span className="font-mono text-[14px] tracking-widest font-semibold flex-1 text-center select-none">
                              {symbolStr}
                            </span>
                            <span className="text-[10px] w-14 text-right select-none font-light opacity-80">
                              {typeLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Submit Manual Divination */}
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      const selectedTimestamp = manualDateTime 
                        ? new Date(manualDateTime).getTime() 
                        : Date.now();
                      
                      navigate('/liuyao/result', { 
                        state: { 
                          question, 
                          lines: manualLines,
                          timestamp: selectedTimestamp
                        } 
                      });
                    }}
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    确认排盘生成
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-border/80 space-y-4">
              <p className="text-xs text-muted font-sans font-light leading-relaxed">
                💡 完整仪式需要您手动投掷六次铜钱，体验传统占卜的交互与仪式感；快速模式则自动模拟生成卦象。
              </p>

              <div className="bg-terracotta-tint border border-terracotta/20 rounded-2xl p-5 space-y-3">
                <p className="text-xs text-terracotta font-medium flex items-center gap-1.5">
                  <span>🪙</span>
                  <span>乾坤通宝铜钱规则</span>
                </p>
                <div className="text-xs text-ink font-sans font-light leading-relaxed space-y-2">
                  <div className="flex justify-between border-b border-border/20 pb-2">
                    <p><strong className="text-gold font-normal">正面（阳）：</strong>金色面（乾坤通宝）</p>
                    <p><strong className="text-muted font-normal">反面（阴）：</strong>银色面（阴阳贞吉）</p>
                  </div>
                  <p className="pt-1 text-[11px] text-muted leading-relaxed">
                    每次摇卦投掷三枚铜钱：<br/>
                    · 3个正面 = 老阳 ━━━ (变爻，阳动)<br/>
                    · 2正1反 = 少阴 ━  ━ (静爻，阴)<br/>
                    · 2反1正 = 少阳 ━━━ (静爻，阳)<br/>
                    · 3个反面 = 老阴 ━  ━ (变爻，阴动)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
