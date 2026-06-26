import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { HexagramDisplay } from './HexagramDisplay';
import { linesToStructure } from '../../utils/hexagram';
import { calculateLiuyaoLayout } from '../../utils/liuyaoLayout';

interface SharePosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'liuyao' | 'meihua' | 'ziwei';
  data: any;
  aiResult: string | null;
}

// Extract summary from AI markdown result
const extractSummary = (text: string | null, type: string): string => {
  if (!text) return '卦象初成，玄机在心。静心体悟，趋吉避凶。';
  
  if (type === 'liuyao') {
    // Try to match "摊主一句话"
    const match = text.match(/### 💬 摊主一句话[^\n]*\n([\s\S]*?)(?=\n###|$)/);
    if (match && match[1]) {
      return match[1].replace(/\*\*/g, '').replace(/-\s*/g, '').trim();
    }
    // Fallback: match "占断结论"
    const conclMatch = text.match(/\*\*占断结论\*\*：(.*)/);
    if (conclMatch) {
      return `摊主占断：${conclMatch[1].trim()}`;
    }
  } else {
    // meihua or ziwei
    const match = text.match(/### 🎯 摊主看这卦[^\n]*\n([\s\S]*?)(?=\n###|$)/) ||
                  text.match(/### 🎯 摊主看这命盘[^\n]*\n([\s\S]*?)(?=\n###|$)/);
    if (match && match[1]) {
      return match[1].replace(/\*\*/g, '').replace(/-\s*/g, '').trim();
    }
  }

  // General fallback: clean Markdown headings/bold and trim
  const clean = text
    .replace(/###.*?\n/g, '')
    .replace(/\*\*.*?\*\*/g, (m) => m.replace(/\*\*/g, ''))
    .replace(/-\s+/g, '')
    .trim();
  return clean.slice(0, 110) + (clean.length > 110 ? '...' : '');
};

export function SharePosterModal({ isOpen, onClose, type, data, aiResult }: SharePosterModalProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  // Generate QR code for current site URL
  useEffect(() => {
    if (!isOpen) return;
    const siteUrl = window.location.origin;
    QRCode.toDataURL(siteUrl, {
      width: 120,
      margin: 1,
      color: { dark: '#0B0C10', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('QR generation failed:', err));
  }, [isOpen]);

  // Generate poster image when modal opens (wait for QR code to be ready)
  useEffect(() => {
    if (!isOpen) {
      setImgUrl(null);
      return;
    }
    if (!qrCodeUrl) return; // wait for QR code

    setRendering(true);
    // Short delay to ensure DOM (including QR img) is rendered before html2canvas runs
    const timer = setTimeout(() => {
      if (posterRef.current) {
        html2canvas(posterRef.current, {
          useCORS: true,
          allowTaint: true,
          scale: 2, // Double scale for HD output
          backgroundColor: '#FAF8F5',
        })
          .then((canvas) => {
            const url = canvas.toDataURL('image/png');
            setImgUrl(url);
            setRendering(false);
          })
          .catch((err) => {
            console.error('Failed to generate poster:', err);
            setRendering(false);
          });
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [isOpen, type, data, aiResult, qrCodeUrl]);

  if (!isOpen) return null;

  // Handle direct download
  const handleDownload = () => {
    if (!imgUrl) return;
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = `小卦摊_${type}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Helper variables for rendering classical elements
  const summaryText = extractSummary(aiResult, type);

  // Render different layouts for types
  const renderPosterContent = () => {
    if (type === 'liuyao') {
      const lData = data;
      const hexStructure = linesToStructure(lData.lines || []);
      const changingLines = lData.changingLines || [];
      const hasTransformed = lData.transformedHexagram;
      const transStructure = linesToStructure((lData.lines || []).map((v: number) => {
        if (v === 9) return 8;
        if (v === 6) return 7;
        return v;
      }));

      // Basic Ganzhi details
      const layout = calculateLiuyaoLayout(lData.lines || [], lData.timestamp || Date.now());

      return (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          <div className="text-center space-y-1">
            <p className="text-[10px] text-gold tracking-widest font-sans font-light">
              干支：{layout.yearGanzhi}年 {layout.monthGanzhi}月 {layout.dayGanzhi}日 {layout.hourGanzhi}时
            </p>
            <p className="text-[10px] text-terracotta/75 tracking-wider font-sans font-light">
              旬空：{layout.dayXunKong} · 宫位：{layout.palaceName}宫 ({layout.palaceElement})
            </p>
          </div>

          {/* Hexagram displays symmetrically */}
          <div className="flex justify-center items-center gap-10 my-2">
            <div className="text-center space-y-1.5">
              <span className="text-[9px] text-muted font-sans font-light uppercase tracking-wider block">本卦</span>
              <div className="p-2 border border-border/25 rounded-xl bg-cream/10 inline-block scale-90">
                <HexagramDisplay structure={hexStructure} changingLines={changingLines} size="sm" />
              </div>
              <h4 className="text-sm font-serif font-medium text-ink">
                {lData.mainHexagram?.name}
              </h4>
            </div>

            {hasTransformed && (
              <>
                <div className="text-gold opacity-45 text-xs font-serif font-light">之</div>
                <div className="text-center space-y-1.5">
                  <span className="text-[9px] text-muted font-sans font-light uppercase tracking-wider block">变卦</span>
                  <div className="p-2 border border-border/25 rounded-xl bg-cream/10 inline-block scale-90">
                    <HexagramDisplay structure={transStructure} changingLines={[]} size="sm" />
                  </div>
                  <h4 className="text-sm font-serif font-medium text-ink">
                    {lData.transformedHexagram?.name}
                  </h4>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    if (type === 'meihua') {
      const mData = data;
      return (
        <div className="space-y-5 flex-1 flex flex-col justify-between">
          <div className="text-center space-y-1">
            <p className="text-[10px] text-gold tracking-widest font-sans font-light">
              起卦：{mData.method === 'number' ? '易数心易起卦' : '时空演易起卦'}
            </p>
            <p className="text-[10px] text-muted font-sans font-light">
              体卦：{mData.upperTrigram} · 用卦：{mData.lowerTrigram}
            </p>
          </div>

          <div className="flex justify-center items-center gap-10 my-1">
            <div className="text-center space-y-1">
              <span className="text-[9px] text-muted font-sans font-light block">主卦</span>
              <div className="p-2 border border-border/25 rounded-xl bg-cream/10 inline-block scale-90">
                <HexagramDisplay structure={mData.hexagramStructure} size="sm" />
              </div>
              <h4 className="text-xs font-serif text-ink">{mData.mainHexagram.name}</h4>
            </div>
            {mData.transformedHexagram && (
              <>
                <div className="text-gold opacity-40 text-xs">之</div>
                <div className="text-center space-y-1">
                  <span className="text-[9px] text-muted font-sans font-light block">之卦</span>
                  <div className="p-2 border border-border/25 rounded-xl bg-cream/10 inline-block scale-90">
                    <HexagramDisplay structure={mData.transformedStructure} size="sm" />
                  </div>
                  <h4 className="text-xs font-serif text-ink">{mData.transformedHexagram.name}</h4>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }

    // ziwei
    const zData = data;
    return (
      <div className="space-y-4 flex-1 flex flex-col justify-between py-2">
        <div className="border border-border/40 rounded-2xl p-4 bg-cream/15 space-y-2.5 text-xs text-ink font-light font-sans leading-relaxed">
          <div className="grid grid-cols-2 gap-y-2 border-b border-border/30 pb-2">
            <div>命主：<strong className="text-gold font-normal">{zData.profile.name}</strong></div>
            <div>性别：{zData.profile.gender === 'male' ? '乾造 (男)' : '坤造 (女)'}</div>
            <div className="col-span-2">诞辰：{zData.profile.birthDate} {zData.profile.birthHour.split(' ')[0]}</div>
          </div>
          <div className="space-y-1 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span>命宫主星：<strong className="text-gold font-serif font-medium">{zData.mingGongData.majorStars.join('、')}</strong></span>
            </div>
            <p className="text-[10px] text-muted leading-relaxed">
              格盘：{zData.mingGongData.desc}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fadeIn">
      {/* Real Display Modal Container */}
      <div className="bg-cream-light border border-border rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl relative">
        <div className="p-5 border-b border-border/40 flex justify-between items-center bg-cream/20">
          <h3 className="text-sm font-serif text-ink tracking-wide">分享优雅挂幅</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink transition-colors w-7 h-7 rounded-full bg-border/20 flex items-center justify-center cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        {/* Poster preview / loading area */}
        <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[360px] bg-cream/10">
          {rendering ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 rounded-full border-2 border-gold/10 border-t-gold animate-spin" />
              </div>
              <p className="text-xs text-gold font-sans font-light tracking-widest animate-pulse">
                正为您排定雅致海报...
              </p>
            </div>
          ) : (
            imgUrl && (
              <div className="space-y-4 w-full flex flex-col items-center">
                <div className="border border-border/60 rounded-2xl overflow-hidden shadow-lg max-h-[380px] w-auto aspect-[375/620]">
                  <img
                    src={imgUrl}
                    alt="Divination Poster"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[10px] text-muted font-sans font-light text-center">
                  💡 移动端可长按图片直接保存至手机相册
                </p>
              </div>
            )
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-5 border-t border-border/40 flex gap-3 justify-center bg-cream/20 font-sans text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-border text-muted hover:border-gold/30 hover:text-gold transition-all cursor-pointer font-light bg-cream-light/50"
          >
            关闭
          </button>
          <button
            disabled={rendering || !imgUrl}
            onClick={handleDownload}
            className={`px-5 py-2.5 rounded-xl font-light tracking-wide transition-all duration-300 shadow-sm cursor-pointer ${
              imgUrl
                ? 'bg-gold text-cream hover:bg-gold/90'
                : 'bg-border text-muted cursor-not-allowed'
            }`}
          >
            📥 下载海报
          </button>
        </div>
      </div>

      {/* Hidden DOM Node for html2canvas to capture (Rendered off-screen) */}
      <div className="absolute top-full left-full pointer-events-none overflow-hidden" style={{ width: 0, height: 0 }}>
        <div
          ref={posterRef}
          className="relative bg-[#FAF8F5] text-ink font-sans flex flex-col justify-between p-7 select-none border-[12px] border-[#DFB15B]/15"
          style={{
            width: '375px',
            height: '620px',
            boxSizing: 'border-box',
          }}
        >
          {/* Inner Golden border corners */}
          <div className="absolute inset-2.5 border border-[#DFB15B]/30 pointer-events-none" />
          <div className="absolute inset-3 border-[0.5px] border-[#DFB15B]/20 pointer-events-none" />

          {/* Poster Header */}
          <div className="relative z-10 flex justify-between items-center border-b border-border/40 pb-3">
            <div className="flex items-center gap-1.5">
              <svg className="w-5 h-5 text-[#DFB15B]" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="#0B0C10" stroke="#DFB15B" strokeWidth="2"/>
                <path d="M 50 5 A 22.5 22.5 0 0 0 50 50 A 22.5 22.5 0 0 1 50 95 A 45 45 0 0 1 50 5 Z" fill="#DFB15B" />
                <circle cx="50" cy="27.5" r="6" fill="#DFB15B" />
                <circle cx="50" cy="72.5" r="6" fill="#0B0C10" stroke="#DFB15B" strokeWidth="1.5" />
              </svg>
              <span className="text-xs font-serif text-ink tracking-widest font-semibold">— 小卦摊 · 知命 —</span>
            </div>
            {/* Square stamp seal */}
            <div className="w-6 h-6 border border-[#B33925] bg-[#B33925] text-white flex items-center justify-center font-serif text-[8px] font-bold rounded shadow-sm opacity-90 leading-none select-none">
              知命
            </div>
          </div>

          {/* User query question */}
          <div className="relative z-10 text-center my-4">
            <span className="text-[9px] text-[#DFB15B] font-sans tracking-widest uppercase block mb-1">求占问事</span>
            <p className="text-base font-serif font-medium text-ink italic leading-relaxed px-4">
              “ {data.question || (type === 'ziwei' ? `${data.profile?.name}的紫微命盘` : '综合气运')} ”
            </p>
          </div>

          {/* Divination specific details */}
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            {renderPosterContent()}
          </div>

          {/* AI core summary block */}
          <div className="relative z-10 border border-[#DFB15B]/20 rounded-2xl p-4 bg-[#FAF8F5]/80 shadow-sm my-4">
            {/* Stamp label */}
            <span className="absolute -top-2.5 left-4 px-2 bg-[#FAF8F5] text-[#B33925] text-[9px] font-serif tracking-widest font-medium border border-[#B33925]/20 rounded">
              摊主一语
            </span>
            <p className="text-[11px] text-ink/80 font-sans font-light leading-relaxed text-justify mt-1">
              {summaryText}
            </p>
          </div>

          {/* Footer branding */}
          <div className="relative z-10 border-t border-border/40 pt-3 flex justify-between items-center text-[9px] text-muted/70 font-sans font-light">
            <div className="space-y-0.5">
              <p className="text-ink/60 font-serif">小卦摊 · 易数变化在乎一心</p>
              <p className="opacity-80">扫码体验「小卦摊」→</p>
            </div>
            {/* Real QR code linking to current site */}
            <div className="w-12 h-12 border border-[#DFB15B]/30 p-0.5 rounded bg-white flex items-center justify-center">
              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="QR" className="w-full h-full rounded" />
              ) : (
                <div className="w-full h-full bg-border/10 rounded" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
