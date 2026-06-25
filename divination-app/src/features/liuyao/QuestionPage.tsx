import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../../components/shared/PageTransition';
import { Button } from '../../components/shared/Button';

export function QuestionPage() {
  const [question, setQuestion] = useState('');
  const navigate = useNavigate();

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
                placeholder="例如：这份工作是否适合我？"
                className="w-full px-4 py-3 rounded-2xl border border-border bg-cream/60 text-ink placeholder-muted/65 font-sans font-light focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold resize-none text-sm transition-all duration-300"
                rows={4}
              />
              <p className="text-[11px] text-muted font-sans font-light mt-2">
                问题将保存在本地占卜记录中，方便日后回顾与验证卦验。
              </p>
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
            </div>

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
                    · 2正1反 = 少阳 ━━━ (静爻，阳)<br/>
                    · 2反1正 = 少阴 ━  ━ (静爻，阴)<br/>
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
