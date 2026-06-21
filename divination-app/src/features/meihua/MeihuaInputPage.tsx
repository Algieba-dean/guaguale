import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../../components/shared/PageTransition';
import { Button } from '../../components/shared/Button';
import { numberToHexagram, timeToHexagram, type MeihuaResult } from '../../utils/meihua';

type InputMethod = 'number' | 'time';

export function MeihuaInputPage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<InputMethod>('number');
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

  const navigateToResult = (result: MeihuaResult) => {
    navigate('/meihua/result', { state: { result } });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F7F4EF] px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-serif text-[#1F2421] mb-3">
              梅花易数
            </h1>
            <p className="text-[#5C635D] text-lg">
              Plum Blossom Numerology
            </p>
          </div>

          {/* Method Selection */}
          <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-serif text-[#1F2421] mb-4">
              选择起卦方式
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => setMethod('number')}
                className={`flex-1 py-3 px-4 rounded-full font-medium transition-all ${
                  method === 'number'
                    ? 'bg-[#C4612F] text-white'
                    : 'bg-[#F7F4EF] text-[#5C635D] hover:bg-[#E7E1D7]'
                }`}
              >
                数字起卦
              </button>
              <button
                onClick={() => setMethod('time')}
                className={`flex-1 py-3 px-4 rounded-full font-medium transition-all ${
                  method === 'time'
                    ? 'bg-[#C4612F] text-white'
                    : 'bg-[#F7F4EF] text-[#5C635D] hover:bg-[#E7E1D7]'
                }`}
              >
                时间起卦
              </button>
            </div>
          </div>

          {/* Number Method */}
          {method === 'number' && (
            <div className="bg-white rounded-3xl shadow-sm p-8">
              <div className="mb-6">
                <h3 className="text-lg font-serif text-[#1F2421] mb-2">
                  数字起卦法
                </h3>
                <p className="text-[#5C635D] text-sm leading-relaxed">
                  心中默念所问之事，随意想三个数字：<br />
                  • 第一个数字（1-8）决定上卦<br />
                  • 第二个数字（1-8）决定下卦<br />
                  • 第三个数字（任意正整数）决定动爻
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#1F2421] mb-2">
                    第一个数字 (1-8)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={num1}
                    onChange={(e) => setNum1(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E7E1D7] rounded-2xl focus:outline-none focus:border-[#C4612F] transition-colors"
                    placeholder="输入 1-8"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2421] mb-2">
                    第二个数字 (1-8)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={num2}
                    onChange={(e) => setNum2(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E7E1D7] rounded-2xl focus:outline-none focus:border-[#C4612F] transition-colors"
                    placeholder="输入 1-8"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1F2421] mb-2">
                    第三个数字 (任意正整数)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={num3}
                    onChange={(e) => setNum3(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E7E1D7] rounded-2xl focus:outline-none focus:border-[#C4612F] transition-colors"
                    placeholder="输入任意正整数"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button onClick={handleNumberSubmit} fullWidth>
                开始占卜
              </Button>
            </div>
          )}

          {/* Time Method */}
          {method === 'time' && (
            <div className="bg-white rounded-3xl shadow-sm p-8">
              <div className="mb-6">
                <h3 className="text-lg font-serif text-[#1F2421] mb-2">
                  时间起卦法
                </h3>
                <p className="text-[#5C635D] text-sm leading-relaxed">
                  以当前的年月日时起卦，天人相应，感时而动。
                  此法适合随机占测眼前之事。
                </p>
              </div>

              <div className="bg-[#F7F4EF] rounded-2xl p-6 mb-6">
                <div className="text-center">
                  <p className="text-sm text-[#5C635D] mb-2">当前时间</p>
                  <p className="text-2xl font-serif text-[#1F2421]">
                    {currentYear}年 {currentMonth}月 {currentDay}日
                  </p>
                  <p className="text-lg text-[#5C635D] mt-1">
                    {currentHour}时
                  </p>
                </div>
              </div>

              <div className="bg-[#F2E3D6] rounded-2xl p-4 mb-6">
                <p className="text-sm text-[#1F2421] leading-relaxed">
                  💡 心静神凝，默念所问之事，点击按钮即刻起卦
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button onClick={handleTimeSubmit} fullWidth>
                开始占卜
              </Button>
            </div>
          )}

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-[#5C635D] hover:text-[#C4612F] transition-colors text-sm"
            >
              ← 返回首页
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
