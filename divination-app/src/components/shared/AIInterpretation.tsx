import { useState, useEffect, useCallback } from 'react';
import { getDivinationInterpretation, getDivinationPrompt } from '../../utils/deepseek';

interface AIInterpretationProps {
  type: 'liuyao' | 'meihua' | 'ziwei';
  data: any;
  onResultLoaded?: (result: string | null) => void;
}

const hasPendingQuestions = (text: string | null): boolean => {
  if (!text) return false;
  const keyword = '待补充与不确定信息';
  const altKeyword = '待补充';
  if (!text.includes(keyword) && !text.includes(altKeyword)) return false;

  const index = text.indexOf(keyword) !== -1 ? text.indexOf(keyword) : text.indexOf(altKeyword);
  const afterText = text.substring(index).toLowerCase();

  const slice = afterText.slice(0, 100);
  if (
    slice.includes('暂无') ||
    slice.includes('：无') ||
    slice.includes(': 无') ||
    slice.includes('无待补充') ||
    slice.includes('无需额外背景')
  ) {
    return false;
  }
  return true;
};

export function AIInterpretation({ type, data, onResultLoaded }: AIInterpretationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [thinkingIndex, setThinkingIndex] = useState(0);

  // States for secondary communication / context
  const [additionalContext, setAdditionalContext] = useState('');
  const [submittedContext, setSubmittedContext] = useState('');
  const [copied, setCopied] = useState(false);

  const serializedData = JSON.stringify(data);

  const handleCopyPrompt = () => {
    try {
      const parsedData = JSON.parse(serializedData);
      if (submittedContext) {
        parsedData.additionalContext = submittedContext;
      }
      const { prompt, systemMessage } = getDivinationPrompt(type, parsedData);
      const copyText = `## 角色设定（AI解卦师指示）\n${systemMessage}\n\n## 卦盘/命盘数据与问题\n${prompt}`;
      
      navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const fetchInterpretation = useCallback(async (context?: string) => {
    setLoading(true);
    setError(null);
    if (onResultLoaded) onResultLoaded(null);
    try {
      const parsedData = JSON.parse(serializedData);
      if (context) {
        parsedData.additionalContext = context;
      }
      const res = await getDivinationInterpretation(type, parsedData);
      setResult(res);
      if (onResultLoaded) onResultLoaded(res);
    } catch (err: any) {
      setError(err.message || '获取AI解卦失败，请检查网络后重试。');
      if (onResultLoaded) onResultLoaded(null);
    } finally {
      setLoading(false);
    }
  }, [type, serializedData, onResultLoaded]);

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
      '体用关系 and 五行生克都理清了...',
      '正在写解读，稍等一下...'
    ],
    ziwei: [
      '正在根据你的生辰排盘...',
      '十二宫位都排好了，正在研究...',
      '命宫主星和格局都看过了...',
      'AI 正在写分析报告...'
    ]
  }[type];

  const secondaryConfig = {
    liuyao: {
      title: '💬 二次沟通 / 补充占卜背景',
      desc: '解卦师摊主在上面可能提出了待证实的问题。你可以在下方输入回答，或补充更多细节背景（如求问者目前的处境、发生的时间顺序、求问对象的态度等），从而重新推演卦象，获得更为精准的占断。',
      placeholder: '例如：补充求问之事的具体起因、相关人员的性别与年龄、目前遇到的阻力，或回答摊主在解卦依据里提出的疑问...'
    },
    meihua: {
      title: '💬 二次沟通 / 补充占卜背景',
      desc: '解卦师摊主在上面可能提出了待证实的问题。你可以在下方输入回答，或补充更多细节背景（如求问者的当前现状、所见外应等），从而重新推演卦象，获得更为精准的体用判语。',
      placeholder: '例如：补充目前的处境、与占问人或事的关系，或者你起卦时看到、听到的突发外应（如风吹旗动、突闻鸟鸣）...'
    },
    ziwei: {
      title: '💬 二次沟通 / 补充个人现状与反馈',
      desc: '解卦师摊主在上面可能指出了你性格中的特点与运势起伏。你可以在下方输入回答，补充你目前的个人现状、想要着重问询的领域（如近期面临的职业抉择、感情困惑等）或对上一轮解说的反馈，从而获得针对性的修心解厄指南。',
      placeholder: '例如：反馈目前的求职状态或感情现状；说明你希望摊主能够着重就当下大限运势提供哪些针对性的规划建议...'
    }
  }[type];

  // Cycling the loading messages to create a breathing, alive experience
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setThinkingIndex((prev) => (prev + 1) % thinkingPhrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading, thinkingPhrases.length]);

  // Fetch immediately on load
  useEffect(() => {
    fetchInterpretation();
  }, [fetchInterpretation]);

  // Clear secondary communication fields if they are no longer needed
  useEffect(() => {
    if (result && !hasPendingQuestions(result)) {
      setAdditionalContext('');
      setSubmittedContext('');
    }
  }, [result]);

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
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyPrompt}
            className="px-3 py-1 rounded-full border border-gold/30 hover:border-gold text-[10px] text-gold tracking-wider font-sans transition-all active:scale-95 cursor-pointer bg-cream/5 hover:bg-cream/10"
            title="复制排盘提示词，可自行粘贴到 ChatGPT / Claude 等大模型提问"
          >
            {copied ? '✓ 已复制提示词' : '📋 复制排盘提示词'}
          </button>
          {loading && (
            <span className="text-[10px] text-gold tracking-widest font-sans uppercase animate-pulse">
              分析中
            </span>
          )}
        </div>
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
      {error && !loading && (
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
              onClick={() => fetchInterpretation(submittedContext)}
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

      {/* Secondary communication input - only visible when AI has pending questions */}
      {result && !error && hasPendingQuestions(result) && (
        <div className="border-t border-border/30 pt-6 mt-6 space-y-4">
          <div className="space-y-1.5">
            <h4 className="text-sm font-serif text-ink tracking-wide flex items-center gap-1.5">
              <span>{secondaryConfig.title}</span>
            </h4>
            <p className="text-[11px] text-muted font-light leading-relaxed">
              {secondaryConfig.desc}
            </p>
          </div>
          
          <div className="space-y-3">
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              disabled={loading}
              placeholder={secondaryConfig.placeholder}
              className="w-full h-24 px-4 py-3 rounded-2xl border border-border bg-cream/30 text-ink focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold transition-all text-xs resize-none disabled:opacity-50"
            />
            
            <div className="flex gap-3 justify-end">
              {submittedContext && !loading && (
                <button
                  type="button"
                  onClick={() => {
                    setAdditionalContext('');
                    setSubmittedContext('');
                    fetchInterpretation();
                  }}
                  className="px-4 py-2 rounded-xl border border-border text-muted text-xs hover:border-gold/30 hover:text-gold transition-all cursor-pointer font-sans font-light bg-cream/10"
                >
                  撤销补充
                </button>
              )}
              <button
                type="button"
                disabled={!additionalContext.trim() || loading}
                onClick={() => {
                  setSubmittedContext(additionalContext);
                  fetchInterpretation(additionalContext);
                }}
                className={`px-5 py-2 rounded-xl text-xs font-sans tracking-wider transition-all duration-300 shadow-sm shadow-gold/5 active:scale-95 cursor-pointer font-light ${
                  additionalContext.trim() && !loading
                    ? 'bg-gold text-cream hover:bg-gold/90'
                    : 'bg-border text-muted cursor-not-allowed'
                }`}
              >
                {loading ? '正在重新解卦...' : '提交补充，重新解卦'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
