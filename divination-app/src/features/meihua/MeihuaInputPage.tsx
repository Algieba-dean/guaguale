import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../../components/shared/PageTransition';
import { Button } from '../../components/shared/Button';
import { numberToHexagram, timeToHexagram } from '../../utils/meihua';
import { Solar } from 'lunar-javascript';

type InputMethod = 'number' | 'time';

export function MeihuaInputPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<InputMethod>('number');
  const [question, setQuestion] = useState('');
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [num3, setNum3] = useState('');
  const [error, setError] = useState('');

  // 时间法：使用当前时间
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const currentHour = now.getHours();

  const handleNumberSubmit = () => {
    setError('');

    const n1 = parseInt(num1);
    const n2 = parseInt(num2);
    const n3 = parseInt(num3);

    // 验证输入
    if (!num1 || !num2 || !num3) {
      setError('请输入三个数字');
      return;
    }

    if (isNaN(n1) || isNaN(n2) || isNaN(n3)) {
      setError('请输入有效的数字');
      return;
    }

    if (n1 < 1 || n1 > 8 || n2 < 1 || n2 > 8) {
      setError('前两个数字必须在 1-8 之间');
      return;
    }

    if (n3 < 1) {
      setError('第三个数字必须是正整数');
      return;
    }

    try {
      const result = numberToHexagram(n1, n2, n3);
      navigateToResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '计算出错');
    }
  };

  const handleTimeSubmit = () => {
    try {
      const result = timeToHexagram(currentYear, currentMonth, currentDay, currentHour);
      navigateToResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '计算出错');
    }
  };

  const navigateToResult = (result: any) => {
    navigate('/meihua/result', { state: { result, question } });
  };

  // 转换农历用于表单展示
  const solar = Solar.fromYmdHms(currentYear, currentMonth, currentDay, currentHour, 0, 0);
  const lunar = solar.getLunar();
  const lunarDisplayStr = `农历 ${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}日 ${lunar.getTimeZhi()}时`;

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full space-y-8 relative z-10">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full border border-terracotta/20 bg-terracotta-tint text-terracotta text-xs font-sans tracking-widest uppercase">
              梅花易数 · Meihua
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-ink tracking-wide">
              观梅起数，<span className="text-gold italic font-calligraphy">机缘即合</span>
            </h1>
            <p className="text-muted font-sans font-light leading-relaxed text-sm max-w-lg mx-auto">
              不拘一格，随心起卦。可任选“数字”或“当前时间”进行推演，洞察当下事态之机。
            </p>
          </div>

          {/* Question Input */}
          <div className="bg-cream-light/60 backdrop-blur-md rounded-3xl border border-border p-6 space-y-4 shadow-sm hover:border-gold/15 transition-all duration-300">
            <label className="block text-sm font-sans font-light text-muted tracking-wider">
              您的占问之事 (可选)：
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-border bg-cream/60 text-ink placeholder-muted/65 focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold transition-all duration-300"
              placeholder="例如：近期事业运势如何？合作是否顺利？"
            />
          </div>

          {/* Method Selection */}
          <div className="bg-cream-light/60 backdrop-blur-md rounded-3xl border border-border p-6 space-y-4 shadow-sm hover:border-gold/15 transition-all duration-300">
            <h2 className="text-sm font-sans font-light text-muted tracking-wider">
              选择起卦方式：
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => setMethod('number')}
                className={`flex-1 py-3 px-4 rounded-full font-sans text-sm tracking-widest transition-all duration-300 ${
                  method === 'number'
                    ? 'bg-gold text-cream font-medium shadow-md shadow-gold/10'
                    : 'bg-cream/40 text-muted border border-border/80 hover:border-gold/30 hover:text-gold'
                }`}
              >
                数字起卦
              </button>
              <button
                onClick={() => setMethod('time')}
                className={`flex-1 py-3 px-4 rounded-full font-sans text-sm tracking-widest transition-all duration-300 ${
                  method === 'time'
                    ? 'bg-gold text-cream font-medium shadow-md shadow-gold/10'
                    : 'bg-cream/40 text-muted border border-border/80 hover:border-gold/30 hover:text-gold'
                }`}
              >
                时间起卦
              </button>
            </div>
          </div>

          {/* Number Method */}
          {method === 'number' && (
            <div className="bg-cream-light/60 backdrop-blur-md rounded-3xl border border-border p-8 space-y-6 shadow-sm hover:border-gold/15 transition-all duration-300">
              <div className="space-y-2 pb-4 border-b border-border/50">
                <h3 className="text-lg font-serif text-ink">
                  数字起卦法
                </h3>
                <p className="text-muted text-xs leading-relaxed font-sans font-light">
                  心中默念所问之事，随意想三个数字：<br />
                  · 第一个数 (1-8)：决定上卦（乾一兑二离三震四巽五坎六艮七坤八）<br />
                  · 第二个数 (1-8)：决定下卦（同上）<br />
                  · 第三个数 (任意正整数)：决定动爻位置
                </p>
              </div>

              <div className="space-y-4 font-sans text-sm">
                <div>
                  <label className="block font-light text-ink mb-2">
                    第一个数字 (1-8)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={num1}
                    onChange={(e) => setNum1(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-cream/60 text-ink placeholder-muted/65 focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold transition-all duration-300"
                    placeholder="例如：3"
                  />
                </div>

                <div>
                  <label className="block font-light text-ink mb-2">
                    第二个数字 (1-8)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={num2}
                    onChange={(e) => setNum2(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-cream/60 text-ink placeholder-muted/65 focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold transition-all duration-300"
                    placeholder="例如：6"
                  />
                </div>

                <div>
                  <label className="block font-light text-ink mb-2">
                    第三个数字 (任意正整数)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={num3}
                    onChange={(e) => setNum3(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-cream/60 text-ink placeholder-muted/65 focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold transition-all duration-300"
                    placeholder="例如：15"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-2xl text-red-400 text-xs font-sans">
                  ⚠️ {error}
                </div>
              )}

              <Button onClick={handleNumberSubmit} fullWidth>
                开始推演占卜
              </Button>
            </div>
          )}

          {/* Time Method */}
          {method === 'time' && (
            <div className="bg-cream-light/60 backdrop-blur-md rounded-3xl border border-border p-8 space-y-6 shadow-sm hover:border-gold/15 transition-all duration-300">
              <div className="space-y-2 pb-4 border-b border-border/50">
                <h3 className="text-lg font-serif text-ink">
                  时间起卦法
                </h3>
                <p className="text-muted text-xs leading-relaxed font-sans font-light">
                  以起卦当时的农历年月日时求取卦象，天人感应，时来运转。适合问及突发、眼前发生之事。
                </p>
              </div>

              <div className="bg-cream-light/40 border border-gold/15 rounded-2xl p-6 shadow-sm hover:border-gold/25 transition-all duration-300">
                <div className="text-center space-y-2 font-sans">
                  <p className="text-[11px] text-gold tracking-widest uppercase">公历起卦时间</p>
                  <p className="text-2xl font-serif text-ink">
                    {currentYear}年 {currentMonth}月 {currentDay}日 {currentHour}时
                  </p>
                  <div className="border-t border-border/30 my-3 pt-3">
                    <p className="text-[11px] text-gold tracking-widest uppercase">阴历干支天机</p>
                    <p className="text-xl font-serif text-gold mt-1">
                      {lunarDisplayStr}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-terracotta-tint border border-terracotta/20 rounded-2xl p-4">
                <p className="text-xs text-ink leading-relaxed font-sans font-light">
                  💡 心中合掌默想所占问之事，点击下方按钮，即可自动转化干支进行起卦。
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-2xl text-red-400 text-xs font-sans">
                  ⚠️ {error}
                </div>
              )}

              <Button onClick={handleTimeSubmit} fullWidth>
                开始推演占卜
              </Button>
            </div>
          )}

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="text-muted hover:text-gold transition-colors text-xs font-sans font-light"
            >
              ← 返回首页
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
