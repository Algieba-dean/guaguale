import { useState, useEffect, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';
import QRCode from 'qrcode';
import { linesToStructure } from '../../utils/hexagram';
import { calculateLiuyaoLayout } from '../../utils/liuyaoLayout';

const rawSiteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
const SITE_URL = rawSiteUrl.endsWith('/') ? rawSiteUrl : rawSiteUrl + '/';

// ── Poster-only hexagram glyph (pure inline styles, no Tailwind/oklch) ─────
function PosterHexagram({ structure, changingLines = [] }: { structure: string; changingLines?: number[] }) {
  if (structure.length !== 6) return null;
  const lines = structure.split('');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center' }}>
      {lines.map((line, index) => {
        const position = 6 - index;
        const isChanging = changingLines.includes(position);
        const isYang = line === '1';
        const color = isChanging ? '#B33925' : (isYang ? '#DFB15B' : '#6B6155');

        return (
          <div key={index} style={{ width: '56px', height: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isYang ? (
              <div style={{ width: '100%', height: '5px', backgroundColor: color, borderRadius: '1px' }} />
            ) : (
              <div style={{ width: '100%', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <div style={{ flex: 1, height: '5px', backgroundColor: color, borderRadius: '1px' }} />
                <div style={{ flex: 1, height: '5px', backgroundColor: color, borderRadius: '1px' }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface SharePosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'liuyao' | 'meihua' | 'ziwei';
  data: any;
  aiResult: string | null;
}

// ── Extract key sections from AI markdown result ───────────────────────────
const extractSummary = (text: string | null, type: string): string => {
  if (!text) return '卦象初成，玄机在心。静心体悟，趋吉避凶。';
  
  if (type === 'liuyao') {
    const match = text.match(/### 💬 摊主一句话[^\n]*\n([\s\S]*?)(?=\n###|$)/);
    if (match && match[1]) {
      return match[1].replace(/\*\*/g, '').replace(/-\s*/g, '').trim().slice(0, 200);
    }
    const conclMatch = text.match(/\*\*占断结论\*\*：(.*)/);
    if (conclMatch) {
      return `摊主占断：${conclMatch[1].trim()}`;
    }
  } else if (type === 'meihua') {
    const match = text.match(/### 🎯 摊主看这[^\n]*\n([\s\S]*?)(?=\n###|$)/);
    if (match && match[1]) {
      return match[1].replace(/\*\*/g, '').replace(/-\s*/g, '').trim().slice(0, 200);
    }
  } else {
    // ziwei
    const match = text.match(/### 🎯 摊主看这[^\n]*\n([\s\S]*?)(?=\n###|$)/);
    if (match && match[1]) {
      return match[1].replace(/\*\*/g, '').replace(/-\s*/g, '').trim().slice(0, 200);
    }
  }

  const clean = text
    .replace(/###.*?\n/g, '')
    .replace(/\*\*.*?\*\*/g, (m) => m.replace(/\*\*/g, ''))
    .replace(/-\s+/g, '')
    .trim();
  return clean.slice(0, 200) + (clean.length > 200 ? '...' : '');
};

// Extract conclusion fields for Liuyao
const extractLiuyaoConclusion = (text: string | null): { conclusion: string; confidence: string; timing: string } | null => {
  if (!text) return null;
  const match = text.match(/### 🎯 摊主结论卡片[^\n]*\n([\s\S]*?)(?=\n###|$)/);
  if (!match || !match[1]) return null;

  const content = match[1];
  const conclusionMatch = content.match(/\*\*占断结论\*\*：([^\n]*)/) || content.match(/\*\*占断结论\*\*:\s*([^\n]*)/);
  const confidenceMatch = content.match(/\*\*置信程度\*\*：([^\n]*)/) || content.match(/\*\*置信程度\*\*:\s*([^\n]*)/);
  const timingMatch = content.match(/\*\*应期提示\*\*：([^\n]*)/) || content.match(/\*\*应期提示\*\*:\s*([^\n]*)/);

  return {
    conclusion: conclusionMatch ? conclusionMatch[1].replace(/\*\*/g, '').trim() : '',
    confidence: confidenceMatch ? confidenceMatch[1].replace(/\*\*/g, '').trim() : '',
    timing: timingMatch ? timingMatch[1].replace(/\*\*/g, '').trim() : '',
  };
};

// Extract extra detail paragraphs from AI result for a richer poster
const extractDetailSections = (text: string | null): string[] => {
  if (!text) return [];
  const sections: string[] = [];

  // Try to extract "详细说/依据" or "建议" sections
  const patterns = [
    /### .*?(?:详细|依据|链路|分析|核心)[^\n]*\n([\s\S]*?)(?=\n###|$)/,
    /### .*?(?:建议|趋避|提醒|忠告)[^\n]*\n([\s\S]*?)(?=\n###|$)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const cleaned = match[1]
        .replace(/\*\*/g, '')
        .replace(/-\s+/g, '')
        .trim();
      if (cleaned.length > 10) {
        sections.push(cleaned.slice(0, 160) + (cleaned.length > 160 ? '...' : ''));
      }
    }
  }
  return sections.slice(0, 2);
};

export function SharePosterModal({ isOpen, onClose, type, data, aiResult }: SharePosterModalProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const posterRef = useRef<HTMLDivElement>(null);
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  // Generate QR code for site URL
  useEffect(() => {
    QRCode.toDataURL(SITE_URL, {
      width: 240,
      margin: 1,
      color: { dark: '#0B0C10', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('QR generation failed:', err));
  }, []);

  // Render the poster when modal opens + QR ready
  const generatePoster = useCallback(() => {
    if (!posterRef.current || !qrCodeUrl) return;
    setRendering(true);
    setImgUrl(null);

    // Wait for DOM paint + QR image load
    requestAnimationFrame(() => {
      setTimeout(async () => {
        if (!posterRef.current) return;
        const node = posterRef.current;
        try {
          // Use html-to-image as primary method since it's extremely fast and robust for offscreen
          const dataUrl = await toPng(node, {
            backgroundColor: '#FAF8F5',
            pixelRatio: 2,
            width: 375,
            height: node.scrollHeight,
          });
          setImgUrl(dataUrl);
        } catch (err) {
          console.error('Failed to generate poster with html-to-image, falling back to html2canvas:', err);
          try {
            const canvas = await html2canvas(node, {
              scale: 2,
              width: 375,
              height: node.scrollHeight,
              backgroundColor: '#FAF8F5',
              useCORS: true,
              logging: false,
            });
            setImgUrl(canvas.toDataURL('image/png'));
          } catch (fallbackErr) {
            console.error('Failed to generate poster with html2canvas fallback:', fallbackErr);
          }
        } finally {
          setRendering(false);
        }
      }, 600);
    });
  }, [qrCodeUrl]);

  useEffect(() => {
    if (isOpen && qrCodeUrl) {
      generatePoster();
    }
    if (!isOpen) {
      setImgUrl(null);
    }
  }, [isOpen, qrCodeUrl, generatePoster]);

  if (!isOpen) return null;

  // ── Helpers ────────────────────────────────────────────────────────────
  const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
    return new Blob([u8arr], { type: mime });
  };

  const handleShare = async () => {
    if (!imgUrl) return;
    try {
      const blob = dataURLtoBlob(imgUrl);
      const file = new File([blob], `小卦摊_${type}_${Date.now()}.png`, { type: 'image/png' });
      await navigator.share({
        title: '小卦摊 · 知命',
        text: `我在「小卦摊」得了一卦，快来看看！\n${SITE_URL}`,
        files: [file],
      });
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        handleDownload();
      }
    }
  };

  const handleDownload = () => {
    if (!imgUrl) return;
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = `小卦摊_${type}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const summaryText = extractSummary(aiResult, type);
  const detailSections = extractDetailSections(aiResult);

  // ── Type label for header badge ─────────────────────────────────────────
  const typeLabel = type === 'liuyao' ? '六爻占卜' : type === 'meihua' ? '梅花易数' : '紫微斗数';
  const questionText = data.question || (type === 'ziwei' ? `${data.profile?.name}的紫微命盘` : '综合气运');

  // ── Poster Content Renderers ──────────────────────────────────────────

  const renderLiuyaoPoster = () => {
    const lData = data;
    const hexStructure = linesToStructure(lData.lines || []);
    const changingLines = lData.changingLines || [];
    const hasTransformed = lData.transformedHexagram;
    const transStructure = linesToStructure((lData.lines || []).map((v: number) => {
      if (v === 9) return 8;
      if (v === 6) return 7;
      return v;
    }));
    const layout = calculateLiuyaoLayout(lData.lines || [], lData.timestamp || Date.now());

    // Build six-line detail table
    const najiaLines = layout.lines || [];

    return (
      <>
        {/* Time & Space context */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '10px', color: '#DFB15B', letterSpacing: '2px', marginBottom: '3px' }}>
            {layout.yearGanzhi}年 {layout.monthGanzhi}月 {layout.dayGanzhi}日 {layout.hourGanzhi}时
          </div>
          <div style={{ fontSize: '9px', color: '#B33925', opacity: 0.8, letterSpacing: '1px' }}>
            旬空：{layout.dayXunKong} · {layout.palaceName}宫 ({layout.palaceElement})
          </div>
        </div>

        {/* Hexagram Visuals */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '24px', marginBottom: '10px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#6B6155', marginBottom: '6px', letterSpacing: '1px' }}>本 卦</div>
            <div style={{ padding: '8px', border: '1px solid rgba(107,97,85,0.2)', borderRadius: '10px', display: 'inline-block', backgroundColor: 'rgba(250,248,245,0.6)' }}>
              <PosterHexagram structure={hexStructure} changingLines={changingLines} />
            </div>
            <div style={{ fontSize: '14px', marginTop: '6px', color: '#1A1A1A', fontWeight: 600 }}>
              {lData.mainHexagram?.unicode} {lData.mainHexagram?.name}
            </div>
          </div>
          {hasTransformed && (
            <>
              <div style={{ color: '#DFB15B', opacity: 0.6, fontSize: '16px', paddingTop: '30px' }}>→</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#6B6155', marginBottom: '6px', letterSpacing: '1px' }}>变 卦</div>
                <div style={{ padding: '8px', border: '1px solid rgba(107,97,85,0.2)', borderRadius: '10px', display: 'inline-block', backgroundColor: 'rgba(250,248,245,0.6)' }}>
                  <PosterHexagram structure={transStructure} changingLines={[]} />
                </div>
                <div style={{ fontSize: '14px', marginTop: '6px', color: '#1A1A1A', fontWeight: 600 }}>
                  {lData.transformedHexagram?.unicode} {lData.transformedHexagram?.name}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Najia line details – compact table */}
        {najiaLines.length > 0 && (
          <div style={{
            border: '1px solid rgba(107,97,85,0.15)',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '8px',
            fontSize: '9px',
          }}>
            {[...najiaLines].reverse().map((line, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '3px 10px',
                backgroundColor: idx % 2 === 0 ? 'rgba(223,177,91,0.04)' : 'transparent',
                borderBottom: idx < najiaLines.length - 1 ? '1px solid rgba(107,97,85,0.08)' : 'none',
                gap: '6px',
              }}>
                <span style={{ color: '#DFB15B', width: '24px', fontWeight: 600 }}>{line.beast}</span>
                <span style={{ color: line.isChanging ? '#B33925' : '#6B6155', width: '24px' }}>{line.relation}</span>
                <span style={{ color: '#1A1A1A', width: '32px', fontWeight: 500 }}>{line.branch}{line.element}</span>
                <span style={{ color: line.lineType === 'yang' ? '#DFB15B' : '#6B6155', flex: 1 }}>
                  {line.lineType === 'yang' ? '▬▬▬' : '▬ ▬'}
                  {line.isChanging ? ' ○' : ''}
                </span>
                <span style={{ color: '#B33925', fontSize: '8px' }}>
                  {line.isShi ? '世' : line.isYing ? '应' : ''}
                  {line.isVoid ? ' 空' : ''}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Judgment text */}
        {lData.mainHexagram?.judgment && (
          <div style={{
            fontSize: '10px',
            color: '#1A1A1A',
            lineHeight: 1.6,
            padding: '8px 10px',
            backgroundColor: 'rgba(223,177,91,0.06)',
            borderRadius: '8px',
            borderLeft: '3px solid #DFB15B',
            marginBottom: '6px',
          }}>
            <div style={{ fontSize: '8px', color: '#DFB15B', letterSpacing: '2px', marginBottom: '3px', fontWeight: 600 }}>卦 辞</div>
            <div style={{ fontWeight: 500 }}>{lData.mainHexagram.judgment.original}</div>
            {lData.mainHexagram.judgment.translation && (
              <div style={{ fontSize: '9px', color: '#6B6155', marginTop: '3px' }}>
                {lData.mainHexagram.judgment.translation.slice(0, 100)}{lData.mainHexagram.judgment.translation.length > 100 ? '...' : ''}
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  const renderMeihuaPoster = () => {
    const mData = data;
    return (
      <>
        {/* Method label */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '10px', color: '#DFB15B', letterSpacing: '2px', marginBottom: '3px' }}>
            {mData.method === 'number' ? '数字起卦' : '时间起卦'}
          </div>
          <div style={{ fontSize: '9px', color: '#6B6155' }}>
            上卦：{mData.upperTrigram} · 下卦：{mData.lowerTrigram}
          </div>
        </div>

        {/* Hexagram Visuals */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '24px', marginBottom: '10px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: '#6B6155', marginBottom: '6px', letterSpacing: '1px' }}>主 卦</div>
            <div style={{ padding: '8px', border: '1px solid rgba(107,97,85,0.2)', borderRadius: '10px', display: 'inline-block', backgroundColor: 'rgba(250,248,245,0.6)' }}>
              <PosterHexagram structure={mData.hexagramStructure} />
            </div>
            <div style={{ fontSize: '14px', marginTop: '6px', color: '#1A1A1A', fontWeight: 600 }}>
              {mData.mainHexagram?.unicode} {mData.mainHexagram?.name}
            </div>
          </div>
          {mData.transformedHexagram && (
            <>
              <div style={{ color: '#DFB15B', opacity: 0.6, fontSize: '16px', paddingTop: '30px' }}>→</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#6B6155', marginBottom: '6px', letterSpacing: '1px' }}>之 卦</div>
                <div style={{ padding: '8px', border: '1px solid rgba(107,97,85,0.2)', borderRadius: '10px', display: 'inline-block', backgroundColor: 'rgba(250,248,245,0.6)' }}>
                  <PosterHexagram structure={mData.transformedStructure} />
                </div>
                <div style={{ fontSize: '14px', marginTop: '6px', color: '#1A1A1A', fontWeight: 600 }}>
                  {mData.transformedHexagram?.unicode} {mData.transformedHexagram?.name}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Judgment text */}
        {mData.mainHexagram?.judgment && (
          <div style={{
            fontSize: '10px',
            color: '#1A1A1A',
            lineHeight: 1.6,
            padding: '8px 10px',
            backgroundColor: 'rgba(223,177,91,0.06)',
            borderRadius: '8px',
            borderLeft: '3px solid #DFB15B',
            marginBottom: '6px',
          }}>
            <div style={{ fontSize: '8px', color: '#DFB15B', letterSpacing: '2px', marginBottom: '3px', fontWeight: 600 }}>卦 辞</div>
            <div style={{ fontWeight: 500 }}>{mData.mainHexagram.judgment.original}</div>
            {mData.mainHexagram.judgment.translation && (
              <div style={{ fontSize: '9px', color: '#6B6155', marginTop: '3px' }}>
                {mData.mainHexagram.judgment.translation.slice(0, 120)}{mData.mainHexagram.judgment.translation.length > 120 ? '...' : ''}
              </div>
            )}
          </div>
        )}

        {/* Changing line info */}
        {mData.changingLine && (
          <div style={{ fontSize: '9px', color: '#B33925', textAlign: 'center', opacity: 0.8 }}>
            动爻：第{mData.changingLine}爻
          </div>
        )}
      </>
    );
  };

  const renderZiweiPoster = () => {
    const zData = data;
    const palaces = zData.chartData || [];

    // Grid positions: map branch index to CSS grid position
    // Branch order: 子(0) 丑(1) 寅(2) 卯(3) 辰(4) 巳(5) 午(6) 未(7) 申(8) 酉(9) 戌(10) 亥(11)
    const gridPos: Record<number, { col: number; row: number }> = {
      0: { col: 3, row: 4 }, // 子
      1: { col: 2, row: 4 }, // 丑
      2: { col: 1, row: 4 }, // 寅
      3: { col: 1, row: 3 }, // 卯
      4: { col: 1, row: 2 }, // 辰
      5: { col: 1, row: 1 }, // 巳
      6: { col: 2, row: 1 }, // 午
      7: { col: 3, row: 1 }, // 未
      8: { col: 4, row: 1 }, // 申
      9: { col: 4, row: 2 }, // 酉
      10: { col: 4, row: 3 }, // 戌
      11: { col: 4, row: 4 }, // 亥
    };
    const branchOrder = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    const shColorMap: Record<string, string> = {
      '禄': '#059669',
      '权': '#e11d48',
      '科': '#2563eb',
      '忌': '#71717a',
    };

    return (
      <>
        {/* Profile Summary */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '10px',
          color: '#1A1A1A',
          marginBottom: '6px',
          padding: '4px 6px',
          backgroundColor: 'rgba(223,177,91,0.06)',
          borderRadius: '6px',
        }}>
          <span>命主：<strong style={{ color: '#DFB15B' }}>{zData.profile?.name}</strong> {zData.profile?.gender === 'male' ? '(乾造)' : '(坤造)'}</span>
          <span style={{ fontSize: '9px', color: '#6B6155' }}>{zData.profile?.birthDate} {zData.profile?.birthHour?.split(' ')[0]}</span>
        </div>

        {/* 4x4 Chart Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(4, 1fr)',
          gap: '2px',
          border: '1px solid rgba(107,97,85,0.25)',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: 'rgba(107,97,85,0.08)',
          marginBottom: '6px',
        }}>
          {palaces.map((palace: any) => {
            const branchIdx = branchOrder.indexOf(palace.branch);
            const pos = gridPos[branchIdx] || { col: 1, row: 1 };
            const isMingGong = palace.name === '命宫';

            return (
              <div
                key={palace.branch}
                style={{
                  gridColumn: pos.col,
                  gridRow: pos.row,
                  backgroundColor: isMingGong ? 'rgba(179,57,37,0.06)' : '#FAF8F5',
                  padding: '3px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '60px',
                  borderLeft: isMingGong ? '2px solid #B33925' : 'none',
                }}
              >
                {/* Palace header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{
                    fontSize: '7px',
                    fontWeight: 600,
                    color: isMingGong ? '#B33925' : '#DFB15B',
                    backgroundColor: isMingGong ? 'rgba(179,57,37,0.1)' : 'rgba(223,177,91,0.1)',
                    padding: '0px 3px',
                    borderRadius: '2px',
                  }}>
                    {palace.name}
                  </span>
                  <span style={{ fontSize: '7px', color: '#6B6155' }}>
                    {palace.stem}{palace.branch}
                  </span>
                </div>

                {/* Major Stars */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1px' }}>
                  {(palace.majorStars || []).map((star: string) => {
                    const [starName, sh] = star.split('·');
                    return (
                      <div key={starName} style={{
                        fontSize: '8px',
                        fontWeight: 600,
                        color: '#1A1A1A',
                        textAlign: 'center',
                        lineHeight: 1.3,
                      }}>
                        {starName}
                        {sh && (
                          <span style={{
                            fontSize: '6px',
                            color: shColorMap[sh] || '#71717a',
                            fontWeight: 700,
                            marginLeft: '1px',
                          }}>
                            {sh}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {(palace.majorStars || []).length === 0 && (
                    <div style={{ fontSize: '7px', color: '#B0A89F', textAlign: 'center', fontStyle: 'italic' }}>空宫</div>
                  )}
                </div>

                {/* Minor Stars (compact) */}
                {(palace.minorStars || []).length > 0 && (
                  <div style={{
                    fontSize: '5.5px',
                    color: '#9B9488',
                    textAlign: 'center',
                    borderTop: '1px solid rgba(107,97,85,0.08)',
                    paddingTop: '1px',
                    marginTop: '1px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}>
                    {(palace.minorStars || []).slice(0, 4).map((s: string) => {
                      const [n, sh] = s.split('·');
                      return sh ? `${n}(${sh})` : n;
                    }).join(' ')}
                  </div>
                )}

                {/* Luck Range */}
                <div style={{
                  fontSize: '5.5px',
                  color: '#9B9488',
                  textAlign: 'center',
                  marginTop: '1px',
                }}>
                  {palace.luckRange?.split(' ')[0]}
                </div>
              </div>
            );
          })}

          {/* Center 2x2: Profile Summary */}
          <div style={{
            gridColumn: '2 / 4',
            gridRow: '2 / 4',
            backgroundColor: '#FAF8F5',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '8px',
            gap: '4px',
          }}>
            <div style={{ fontSize: '8px', color: '#DFB15B', letterSpacing: '3px', fontWeight: 500 }}>紫 微 命 盘</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#1A1A1A' }}>{zData.profile?.name}</div>
            <div style={{ fontSize: '8px', color: '#6B6155', lineHeight: 1.5, textAlign: 'center' }}>
              {zData.profile?.gender === 'male' ? '乾造 (男)' : '坤造 (女)'}
              <br />
              {zData.profile?.birthDate}
              <br />
              {zData.profile?.birthHour?.split(' ')[0]}
            </div>
            {(zData.mingZhu || zData.shenZhu) && (
              <div style={{ fontSize: '7px', color: '#B33925', marginTop: '2px' }}>
                {zData.mingZhu && `命主：${zData.mingZhu}`}
                {zData.mingZhu && zData.shenZhu && ' · '}
                {zData.shenZhu && `身主：${zData.shenZhu}`}
              </div>
            )}
            {zData.pillars && (
              <div style={{ fontSize: '7px', color: '#DFB15B', marginTop: '1px' }}>
                {zData.pillars.year} {zData.pillars.month} {zData.pillars.day} {zData.pillars.hour}
              </div>
            )}
            <div style={{
              fontSize: '7px',
              color: '#1A1A1A',
              marginTop: '3px',
              padding: '2px 6px',
              backgroundColor: 'rgba(223,177,91,0.08)',
              borderRadius: '4px',
            }}>
              命宫主星：<strong style={{ color: '#DFB15B' }}>{zData.mingGongData?.majorStars?.map((s: string) => s.split('·')[0]).join('、') || '无'}</strong>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderPosterContent = () => {
    if (type === 'liuyao') return renderLiuyaoPoster();
    if (type === 'meihua') return renderMeihuaPoster();
    return renderZiweiPoster();
  };

  // ── Modal Title ─────────────────────────────────────────────────────────
  const modalTitle = type === 'ziwei' ? '分享命盘' : '分享卦象';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fadeIn">
      {/* Modal Container */}
      <div className="bg-cream-light border border-border rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl relative max-h-[90vh]">
        <div className="p-5 border-b border-border/40 flex justify-between items-center bg-cream/20 shrink-0">
          <h3 className="text-sm font-serif text-ink tracking-wide">{modalTitle}</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink transition-colors w-7 h-7 rounded-full bg-border/20 flex items-center justify-center cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>

        {/* Poster preview / loading area */}
        <div className="p-4 flex-1 flex flex-col items-center justify-center min-h-[320px] bg-cream/10 overflow-y-auto">
          {rendering ? (
            <div className="flex flex-col items-center space-y-3 py-12">
              <div className="relative w-9 h-9">
                <div className="absolute inset-0 rounded-full border-2 border-gold/10 border-t-gold animate-spin" />
              </div>
              <p className="text-xs text-gold font-sans font-light tracking-widest animate-pulse">
                正在生成分享图片...
              </p>
            </div>
          ) : imgUrl ? (
            <div className="space-y-3 w-full flex flex-col items-center">
              <div className="border border-border/60 rounded-2xl overflow-hidden shadow-lg w-full max-w-[300px]">
                <img
                  src={imgUrl}
                  alt="Divination Share Image"
                  className="w-full h-auto"
                />
              </div>
              <p className="text-[10px] text-muted font-sans font-light text-center">
                💡 移动端可长按图片保存至相册
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3 py-12">
              <p className="text-xs text-muted font-sans font-light">图片生成中...</p>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-border/40 flex gap-3 justify-center bg-cream/20 font-sans text-xs shrink-0">
          {canShare && (
            <button
              disabled={rendering || !imgUrl}
              onClick={handleShare}
              className={`px-5 py-2.5 rounded-xl font-light tracking-wide transition-all duration-300 shadow-sm cursor-pointer ${
                imgUrl
                  ? 'bg-[#07C160] text-white hover:bg-[#06AD56]'
                  : 'bg-border text-muted cursor-not-allowed'
              }`}
            >
              📤 分享给好友
            </button>
          )}
          <button
            disabled={rendering || !imgUrl}
            onClick={handleDownload}
            className={`px-5 py-2.5 rounded-xl font-light tracking-wide transition-all duration-300 shadow-sm cursor-pointer ${
              imgUrl
                ? 'bg-gold text-cream hover:bg-gold/90'
                : 'bg-border text-muted cursor-not-allowed'
            }`}
          >
            📥 保存图片
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-border text-muted hover:border-gold/30 hover:text-gold transition-all cursor-pointer font-light bg-cream-light/50"
          >
            关闭
          </button>
        </div>
      </div>

      {/* ── Off-screen poster DOM for html-to-image capture ──────────────── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        overflow: 'hidden',
        zIndex: -1000,
        pointerEvents: 'none',
      }}>
        <div
          ref={posterRef}
          data-poster="true"
          style={{
            width: '375px',
            minHeight: '640px',
            backgroundColor: '#FAF8F5',
            padding: '20px 22px',
            boxSizing: 'border-box',
            fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, -apple-system, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Decorative outer border */}
          <div style={{
            position: 'absolute',
            inset: '6px',
            border: '2px solid rgba(223,177,91,0.15)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            inset: '10px',
            border: '1px solid rgba(223,177,91,0.10)',
            pointerEvents: 'none',
          }} />

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(107,97,85,0.2)',
            paddingBottom: '10px',
            marginBottom: '12px',
            position: 'relative',
            zIndex: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="#0B0C10" stroke="#DFB15B" strokeWidth="2"/>
                <path d="M 50 5 A 22.5 22.5 0 0 0 50 50 A 22.5 22.5 0 0 1 50 95 A 45 45 0 0 1 50 5 Z" fill="#DFB15B" />
                <circle cx="50" cy="27.5" r="6" fill="#DFB15B" />
                <circle cx="50" cy="72.5" r="6" fill="#0B0C10" stroke="#DFB15B" strokeWidth="1.5" />
              </svg>
              <span style={{ fontSize: '13px', color: '#1A1A1A', letterSpacing: '3px', fontWeight: 600 }}>小卦摊 · 知命</span>
            </div>
            <div style={{
              padding: '2px 8px',
              border: '1px solid rgba(179,57,37,0.3)',
              backgroundColor: 'rgba(179,57,37,0.08)',
              color: '#B33925',
              fontSize: '8px',
              fontWeight: 600,
              borderRadius: '4px',
              letterSpacing: '1px',
            }}>
              {typeLabel}
            </div>
          </div>

          {/* ── Question / Subject ─────────────────────────────────────────── */}
          {(type === 'ziwei' || (data.question && data.question.trim() !== '')) && (
            <div style={{ textAlign: 'center', marginBottom: '14px', position: 'relative', zIndex: 10 }}>
              <div style={{ fontSize: '9px', color: '#DFB15B', letterSpacing: '4px', marginBottom: '5px', fontWeight: 500 }}>
                {type === 'ziwei' ? '命 主 排 盘' : '求 占 问 事'}
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#1A1A1A',
                padding: '6px 16px',
                lineHeight: 1.6,
                backgroundColor: 'rgba(223,177,91,0.06)',
                borderRadius: '8px',
                display: 'inline-block',
                maxWidth: '280px',
                wordBreak: 'break-all' as const,
              }}>
                「{questionText}」
              </div>
            </div>
          )}

          {/* ── Divination Content ─────────────────────────────────────────── */}
          <div style={{ position: 'relative', zIndex: 10, flex: 1 }}>
            {renderPosterContent()}
          </div>

          {/* ── Liuyao Conclusion Card ─────────────────────────────────────── */}
          {type === 'liuyao' && (() => {
            const concl = extractLiuyaoConclusion(aiResult);
            if (!concl || (!concl.conclusion && !concl.confidence && !concl.timing)) return null;
            return (
              <div style={{
                border: '1px solid rgba(179,57,37,0.25)',
                borderRadius: '10px',
                padding: '8px 10px',
                backgroundColor: 'rgba(179,57,37,0.04)',
                marginBottom: '8px',
                fontSize: '9px',
                color: '#1A1A1A',
                lineHeight: 1.5,
                position: 'relative',
                zIndex: 10,
              }}>
                {concl.conclusion && (
                  <div style={{ display: 'flex', marginBottom: '3px' }}>
                    <span style={{ color: '#B33925', fontWeight: 600, width: '56px', flexShrink: 0 }}>占断结论：</span>
                    <span style={{ fontWeight: 600 }}>{concl.conclusion}</span>
                  </div>
                )}
                {concl.confidence && (
                  <div style={{ display: 'flex', marginBottom: '3px' }}>
                    <span style={{ color: '#6B6155', fontWeight: 600, width: '56px', flexShrink: 0 }}>置信程度：</span>
                    <span>{concl.confidence}</span>
                  </div>
                )}
                {concl.timing && (
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: '#DFB15B', fontWeight: 600, width: '56px', flexShrink: 0 }}>应期提示：</span>
                    <span>{concl.timing}</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── AI Summary (摊主一语) ──────────────────────────────────────── */}
          <div style={{
            border: '1px solid rgba(223,177,91,0.2)',
            borderRadius: '12px',
            padding: '12px 14px',
            margin: '10px 0',
            position: 'relative',
            zIndex: 10,
            backgroundColor: 'rgba(250,248,245,0.8)',
          }}>
            <span style={{
              position: 'absolute',
              top: '-8px',
              left: '14px',
              padding: '1px 8px',
              backgroundColor: '#FAF8F5',
              color: '#B33925',
              fontSize: '9px',
              letterSpacing: '2px',
              fontWeight: 600,
              border: '1px solid rgba(179,57,37,0.15)',
              borderRadius: '4px',
            }}>
              摊主一语
            </span>
            <p style={{
              fontSize: '10px',
              color: 'rgba(26,26,26,0.85)',
              lineHeight: 1.8,
              textAlign: 'justify' as const,
              marginTop: '4px',
              marginBottom: '0',
            }}>
              {summaryText}
            </p>
          </div>

          {/* ── Detail Sections (optional) ──────────────────────────────────── */}
          {detailSections.length > 0 && (
            <div style={{
              padding: '0 2px',
              marginBottom: '6px',
              position: 'relative',
              zIndex: 10,
            }}>
              {detailSections.map((section, idx) => (
                <p key={idx} style={{
                  fontSize: '9px',
                  color: 'rgba(107,97,85,0.8)',
                  lineHeight: 1.7,
                  textAlign: 'justify' as const,
                  margin: '4px 0',
                  paddingLeft: '8px',
                  borderLeft: '2px solid rgba(223,177,91,0.2)',
                }}>
                  {section}
                </p>
              ))}
            </div>
          )}

          {/* ── Footer with QR Code ────────────────────────────────────────── */}
          <div style={{
            borderTop: '1px solid rgba(107,97,85,0.2)',
            paddingTop: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: 10,
            marginTop: 'auto',
          }}>
            <div>
              <div style={{ fontSize: '10px', color: 'rgba(26,26,26,0.6)', fontWeight: 500 }}>小卦摊 · 易数变化在乎一心</div>
              <div style={{ fontSize: '9px', color: 'rgba(107,97,85,0.5)', marginTop: '3px' }}>扫码体验「小卦摊」→</div>
              <div style={{ fontSize: '8px', color: 'rgba(107,97,85,0.35)', marginTop: '2px' }}>{SITE_URL}</div>
            </div>
            <div style={{
              width: '58px',
              height: '58px',
              border: '1px solid rgba(223,177,91,0.3)',
              borderRadius: '6px',
              padding: '3px',
              backgroundColor: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR" style={{ width: '100%', height: '100%', borderRadius: '3px' }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
