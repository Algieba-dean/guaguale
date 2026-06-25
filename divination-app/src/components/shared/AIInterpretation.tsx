import { useState, useEffect, useCallback } from 'react';
import { getDivinationInterpretation } from '../../utils/deepseek';

interface AIInterpretationProps {
  type: 'liuyao' | 'meihua' | 'ziwei';
  data: any;
}

export function AIInterpretation({ type, data }: AIInterpretationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [thinkingIndex, setThinkingIndex] = useState(0);

  const thinkingPhrases = {
    liuyao: [
      '正在平息尘虑，凝神起誓...',
      '乾坤既定，正在模拟铜钱翻滚...',
      '六爻重叠，变爻交错，正在推演卦象...',
      '感应天地，正在破译周易卦爻天机...'
    ],
    meihua: [
      '不执铜钱，感时而动...',
      '正在根据干支数理排定卦象...',
      '体用生克，主宾互易，正在研判气场...',
      '象数相照，正在撰写梅花断案启迪...'
    ],
    ziwei: [
      '正在输入生辰阴阳八字，核算干支...',
      '天星罗列，十二宫垣排盘定位...',
      '命主星曜起落归垣，正在研判格局...',
      '正在推演流限星象，书写修心解厄法要...'
    ]
  }[type];

  // Cycling the loading messages to create a breathing, alive experience
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setThinkingIndex((prev) => (prev + 1) % thinkingPhrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading, thinkingPhrases.length]);

  const fetchInterpretation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDivinationInterpretation(type, data);
      setResult(res);
    } catch (err: any) {
      setError(err.message || '获取AI解卦失败，请检查网络后重试。');
    } finally {
      setLoading(false);
    }
  }, [type, data]);

  // Fetch immediately on load
  useEffect(() => {
    fetchInterpretation();
  }, [fetchInterpretation]);

  // Simple Markdown Parser to avoid external dependencies
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Heading 3
      if (line.startsWith('### ')) {
        const title = line.replace('### ', '').trim();
        return (
          <h4
            key={index}
            className="text-base font-serif text-gold border-l-2 border-gold pl-2.5 mt-6 mb-3 tracking-wide flex items-center gap-1.5"
          >
            {title}
          </h4>
        );
      }
      
      if (line.trim() === '') return null;

      // Inline Bold **text** parsing
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="text-gold font-normal">
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      return (
        <p
          key={index}
          className="text-xs text-muted font-sans font-light leading-relaxed mb-3.5 tracking-wide text-justify"
        >
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  return (
    <div className="bg-cream-light/60 backdrop-blur-md rounded-3xl border border-border p-8 space-y-6 relative overflow-hidden transition-all duration-300">
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <h3 className="text-lg font-serif text-ink tracking-wider flex items-center gap-2">
          <svg className="w-5 h-5 text-gold animate-spin-slow" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.25">
            <circle cx="10" cy="10" r="9" />
            <path d="M10 1 A 4.5 4.5 0 0 0 10 10 A 4.5 4.5 0 0 1 10 19 A 9 9 0 0 1 10 1 Z" fill="currentColor" className="opacity-80" />
            <circle cx="10" cy="5.5" r="1.2" fill="currentColor" />
            <circle cx="10" cy="14.5" r="1.2" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
          <span>AI 命理宗师深度解卦</span>
        </h3>
        {loading && (
          <span className="text-[10px] text-gold tracking-widest font-sans uppercase animate-pulse">
            天机推演中
          </span>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-4">
          <div className="relative w-12 h-12">
            {/* Spinning Gold Trigram ring */}
            <div className="absolute inset-0 rounded-full border-2 border-gold/10 border-t-gold animate-spin" />
            {/* Pulsing inner cinnabar center */}
            <div className="absolute inset-2.5 rounded-full bg-terracotta/25 border border-terracotta/40 animate-pulse" />
          </div>
          <p className="text-xs text-gold font-sans font-light tracking-widest animate-pulse">
            {thinkingPhrases[thinkingIndex]}
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="space-y-4 py-4">
          <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-2xl text-red-400 text-xs font-sans flex items-start gap-3">
            <span className="text-base mt-0.5">⚠️</span>
            <div className="space-y-1">
              <p className="font-medium text-red-300">卦象感应中断 (解卦发生错误)</p>
              <p className="opacity-85 leading-relaxed">{error}</p>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={fetchInterpretation}
              className="px-5 py-2 rounded-full border border-terracotta text-terracotta text-xs font-sans tracking-widest hover:bg-terracotta hover:text-white transition-all duration-300 shadow-sm shadow-terracotta/5 active:scale-95 cursor-pointer"
            >
              🔄 重新沟通天地（重试）
            </button>
          </div>
        </div>
      )}

      {/* Success / Result state */}
      {!loading && !error && result && (
        <div className="space-y-2 animate-fadeIn prose max-w-none">
          {renderContent(result)}
        </div>
      )}
    </div>
  );
}
