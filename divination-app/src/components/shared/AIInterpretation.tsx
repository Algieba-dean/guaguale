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
      '正在认真看你的卦象...',
      '铜钱落定，正在分析每一爻...',
      '变爻和卦辞都看完了，正在整理思路...',
      'AI 正在组织语言，马上就好...'
    ],
    meihua: [
      '收到你的数据了，正在起卦...',
      '上卦下卦都排好了，正在分析...',
      '体用关系和五行生克都理清了...',
      '正在写解读，稍等一下...'
    ],
    ziwei: [
      '正在根据你的生辰排盘...',
      '十二宫位都排好了，正在研究...',
      '命宫主星和格局都看过了...',
      'AI 正在写分析报告...'
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

  const serializedData = JSON.stringify(data);

  const fetchInterpretation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDivinationInterpretation(type, JSON.parse(serializedData));
      setResult(res);
    } catch (err: any) {
      setError(err.message || '获取AI解卦失败，请检查网络后重试。');
    } finally {
      setLoading(false);
    }
  }, [type, serializedData]);

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
          <span>AI 智能解读</span>
        </h3>
        {loading && (
          <span className="text-[10px] text-gold tracking-widest font-sans uppercase animate-pulse">
            分析中
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
              <p className="font-medium text-red-300">解读出错了</p>
              <p className="opacity-85 leading-relaxed">{error}</p>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={fetchInterpretation}
              className="px-5 py-2 rounded-full border border-terracotta text-terracotta text-xs font-sans tracking-widest hover:bg-terracotta hover:text-white transition-all duration-300 shadow-sm shadow-terracotta/5 active:scale-95 cursor-pointer"
            >
               🔄 重新解读
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
