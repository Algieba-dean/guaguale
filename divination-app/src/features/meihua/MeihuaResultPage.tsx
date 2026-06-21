import { useLocation, useNavigate } from 'react-router-dom';
import { PageTransition } from '../../components/shared/PageTransition';
import { Button } from '../../components/shared/Button';
import { HexagramDisplay } from '../../components/shared/HexagramDisplay';
import { type MeihuaResult, getTrigramName, getHourPeriodName } from '../../utils/meihua';
import { getHexagramByStructure } from '../../utils/hexagram';
import { saveRecord } from '../../utils/storage';
import { v4 as uuidv4 } from 'uuid';

export function MeihuaResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as MeihuaResult | undefined;

  if (!result) {
    // 如果没有结果数据，返回输入页面
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
      data: {
        method: result.method,
        inputValues: result.input.numbers || result.input.timestamp,
        hexagram: hexagram.id,
        changingLine: result.changingLine,
      },
    };

    const success = saveRecord(record);
    if (success) {
      alert('已保存到历史记录');
    } else {
      alert('保存失败，请稍后重试');
    }
  };

  const getInputDisplay = () => {
    if (result.method === 'number' && result.input.numbers) {
      const [n1, n2, n3] = result.input.numbers;
      return (
        <div className="space-y-2">
          <p className="text-sm text-[#5C635D]">起卦方式：数字起卦</p>
          <div className="flex gap-4 text-lg">
            <span>第一数：<strong className="text-[#C4612F]">{n1}</strong></span>
            <span>第二数：<strong className="text-[#C4612F]">{n2}</strong></span>
            <span>第三数：<strong className="text-[#C4612F]">{n3}</strong></span>
          </div>
        </div>
      );
    }

    if (result.method === 'time' && result.input.timestamp) {
      const { year, month, day, hour } = result.input.timestamp;
      return (
        <div className="space-y-2">
          <p className="text-sm text-[#5C635D]">起卦方式：时间起卦</p>
          <div className="text-lg">
            <p><strong className="text-[#C4612F]">{year}年 {month}月 {day}日</strong></p>
            <p className="text-sm text-[#5C635D] mt-1">
              {getHourPeriodName(hour)} ({hour}时)
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F7F4EF] px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block bg-[#F2E3D6] text-[#C4612F] text-xs font-medium px-3 py-1 rounded-full mb-3">
              梅花易数
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-[#1F2421] mb-2">
              {hexagram.name}
            </h1>
            <p className="text-xl text-[#5C635D]">
              {hexagram.unicode}
            </p>
          </div>

          {/* Input Display */}
          <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
            {getInputDisplay()}
          </div>

          {/* Trigram Composition */}
          <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-serif text-[#1F2421] mb-4">卦象构成</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-[#F7F4EF] rounded-2xl p-4">
                <p className="text-sm text-[#5C635D] mb-1">上卦</p>
                <p className="text-2xl font-serif text-[#1F2421]">
                  {getTrigramName(result.upperTrigram)}
                </p>
              </div>
              <div className="bg-[#F7F4EF] rounded-2xl p-4">
                <p className="text-sm text-[#5C635D] mb-1">下卦</p>
                <p className="text-2xl font-serif text-[#1F2421]">
                  {getTrigramName(result.lowerTrigram)}
                </p>
              </div>
            </div>
          </div>

          {/* Hexagram Display */}
          <div className="bg-white rounded-3xl shadow-sm p-8 mb-6">
            <h2 className="text-lg font-serif text-[#1F2421] mb-6 text-center">
              本卦
            </h2>
            <HexagramDisplay
              structure={result.hexagramStructure}
              changingLines={[result.changingLine]}
            />
            <div className="mt-6 text-center">
              <p className="text-sm text-[#5C635D]">
                动爻：第 <strong className="text-[#C4612F]">{result.changingLine}</strong> 爻
              </p>
            </div>
          </div>

          {/* Transformed Hexagram */}
          {transformedHexagram && (
            <div className="bg-white rounded-3xl shadow-sm p-8 mb-6">
              <h2 className="text-lg font-serif text-[#1F2421] mb-4 text-center">
                变卦：{transformedHexagram.name} {transformedHexagram.unicode}
              </h2>
              <HexagramDisplay structure={result.transformedStructure!} />

              {/* Transformed Hexagram Judgment */}
              {transformedHexagram.judgment && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-base font-serif text-[#1F2421]">卦辞</h3>
                  <p className="text-[#1F2421] font-serif leading-relaxed text-sm">
                    {transformedHexagram.judgment.original}
                  </p>
                  <p className="text-[#5C635D] text-sm leading-relaxed">
                    {transformedHexagram.judgment.translation}
                  </p>
                </div>
              )}

              {/* Transformed Hexagram Interpretation */}
              {transformedHexagram.interpretation?.general && (
                <div className="mt-4">
                  <h3 className="text-base font-serif text-[#1F2421] mb-2">解读</h3>
                  <p className="text-[#5C635D] text-sm leading-relaxed">
                    {transformedHexagram.interpretation.general}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Judgment */}
          {hexagram.judgment && (
            <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-serif text-[#1F2421] mb-4">卦辞</h2>
              <div className="space-y-3">
                <p className="text-[#1F2421] font-serif leading-relaxed">
                  {hexagram.judgment.original}
                </p>
                <p className="text-[#5C635D] text-sm leading-relaxed">
                  {hexagram.judgment.translation}
                </p>
              </div>
            </div>
          )}

          {/* Changing Line Text */}
          {hexagram.lines && hexagram.lines[result.changingLine - 1] && (
            <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-serif text-[#1F2421] mb-4">
                动爻爻辞（第{result.changingLine}爻）
              </h2>
              <div className="space-y-3">
                <p className="text-[#1F2421] font-serif leading-relaxed">
                  {hexagram.lines[result.changingLine - 1].original}
                </p>
                <p className="text-[#5C635D] text-sm leading-relaxed">
                  {hexagram.lines[result.changingLine - 1].translation}
                </p>
              </div>
            </div>
          )}

          {/* General Interpretation */}
          {hexagram.interpretation && (
            <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-serif text-[#1F2421] mb-4">卦象解读</h2>
              <p className="text-[#5C635D] leading-relaxed">
                {hexagram.interpretation.general}
              </p>
            </div>
          )}

          {/* Meihua Interpretation Guide */}
          <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-serif text-[#1F2421] mb-4">梅花易数解卦要点</h2>
            <div className="space-y-3 text-sm text-[#5C635D] leading-relaxed">
              <div className="bg-[#F7F4EF] rounded-2xl p-4 space-y-2">
                <p className="text-[#1F2421] font-medium">📖 体卦与用卦</p>
                <p>
                  上卦 <strong className="text-[#1F2421]">{getTrigramName(result.upperTrigram)}</strong> 为体卦，代表自己、内部、静态；
                  下卦 <strong className="text-[#1F2421]">{getTrigramName(result.lowerTrigram)}</strong> 为用卦，代表他人、外部、动态。
                  体用关系决定了吉凶走向。
                </p>
              </div>

              <div className="bg-[#F7F4EF] rounded-2xl p-4 space-y-2">
                <p className="text-[#1F2421] font-medium">🔄 动爻的作用</p>
                <p>
                  第 <strong className="text-[#C4612F]">{result.changingLine}</strong> 爻为动爻，是事态变化的关键点。
                  动爻所在的卦（{result.changingLine <= 3 ? '下卦' : '上卦'}）力量会受到影响，需要特别关注这一爻的爻辞含义。
                </p>
              </div>

              {transformedHexagram && (
                <div className="bg-[#F7F4EF] rounded-2xl p-4 space-y-2">
                  <p className="text-[#1F2421] font-medium">➡️ 变卦的意义</p>
                  <p>
                    变卦 <strong className="text-[#1F2421]">{transformedHexagram.name}</strong> 显示事态发展后的结果和趋势。
                    从本卦到变卦的转化过程，反映了事物从当前状态向未来状态的演变。
                  </p>
                </div>
              )}

              <div className="bg-[#F7F4EF] rounded-2xl p-4 space-y-2">
                <p className="text-[#1F2421] font-medium">🎯 取象方法</p>
                <p>
                  梅花易数重在"观物取象"，除了卦象本身，还要结合起卦时的时间、方位、所见之物等外应来综合判断。
                  数字起卦注重卦象本身，时间起卦则要考虑时令节气的影响。
                </p>
              </div>

              <div className="bg-[#F2E3D6] rounded-2xl p-4 space-y-2">
                <p className="text-[#C4612F] font-medium">💡 解卦建议</p>
                <p className="text-[#1F2421]">
                  梅花易数简便灵活，但解卦需要经验积累。初学者可以先看卦辞和爻辞的基本含义，
                  然后结合实际情况和具体问题来理解。记住，卦象提供的是一个思考角度，最终决策还需理性判断。
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={handleSave} fullWidth>
              保存记录
            </Button>
            <Button
              onClick={() => navigate('/meihua')}
              variant="secondary"
              fullWidth
            >
              再占一卦
            </Button>
            <div className="text-center">
              <button
                onClick={() => navigate('/history')}
                className="text-[#5C635D] hover:text-[#C4612F] transition-colors text-sm"
              >
                查看历史记录 →
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
