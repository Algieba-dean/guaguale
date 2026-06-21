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
      <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-pill bg-terracotta-tint text-terracotta text-sm font-light">
              六爻占卜
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-ink">
              心中所问，<span className="text-terracotta italic">卦象可解</span>
            </h1>
            <p className="text-muted font-light leading-relaxed">
              静心凝神，将你想要询问的事情写下来。问题可以是具体的事项，也可以是心中的困惑。
            </p>
          </div>

          {/* Question Input */}
          <div className="bg-cream-light rounded-3xl border border-border p-8 space-y-6">
            <div>
              <label className="block text-ink font-light mb-3">
                你想问什么？（选填）
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="例如：这份工作是否适合我？"
                className="w-full px-4 py-3 rounded-2xl border border-border bg-white text-ink font-light focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta resize-none"
                rows={4}
              />
              <p className="text-xs text-muted font-light mt-2">
                问题将保存在你的占卜记录中，方便日后回顾验证
              </p>
            </div>

            {/* Mode Selection */}
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted font-light">选择占卜方式：</p>

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

            <div className="pt-4 border-t border-border space-y-3">
              <p className="text-xs text-muted font-light leading-relaxed">
                💡 完整仪式需要手动投掷六次铜钱，体验传统占卜的仪式感；快速模式则自动生成卦象，节省时间。
              </p>

              <div className="bg-terracotta-tint rounded-2xl p-4 space-y-2">
                <p className="text-xs text-terracotta font-medium">🪙 硬币规则说明</p>
                <div className="text-xs text-ink font-light leading-relaxed space-y-1">
                  <p><strong className="text-yellow-700">正面（阳）：</strong>金色面 - 有字的一面</p>
                  <p><strong className="text-gray-700">反面（阴）：</strong>银色面 - 无字的一面</p>
                  <p className="pt-2 border-t border-terracotta/20">
                    每次投掷3枚硬币：<br/>
                    · 3个正面 = 老阳 ━━━ （动爻）<br/>
                    · 2正1反 = 少阳 ━━━<br/>
                    · 2反1正 = 少阴 ━  ━<br/>
                    · 3个反面 = 老阴 ━  ━ （动爻）
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
