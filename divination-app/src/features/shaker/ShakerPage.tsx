import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../../components/shared/PageTransition';
import { Button } from '../../components/shared/Button';
import { useDeviceShake, isShakeAvailable } from '../../hooks/useDeviceShake';
import { builtInPools, type ShakerStick, type ShakerPool } from '../../data/shakerPools';
import { saveRecord, type DivinationRecord } from '../../utils/storage';
import { v4 as uuidv4 } from 'uuid';
import { useSEO } from '../../hooks/useSEO';

const CUSTOM_POOLS_KEY = 'guaguale-custom-shaker-pools';

// Traditional Chinese Shaking Phone SVG Icon
function ShakingPhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M12 18h.01" strokeWidth="2" />
      {/* Wave lines to denote shaking */}
      <path d="M2 9c.7-1.3 1.8-2 3-2M22 9c-.7-1.3-1.8-2-3-2M2 15c.7 1.3 1.8 2 3 2M22 15c-.7 1.3-1.8 2-3 2" />
    </svg>
  );
}

// Bamboo/Wooden Shaker Cylinder SVG
function ShakerCylinderSVG({ isShaking, style }: { isShaking: boolean; style?: any }) {
  return (
    <div className="relative w-40 h-56 flex justify-center items-end" style={style}>
      {/* Shaking wood cylinder container */}
      <motion.div
        className="relative w-32 h-44 origin-bottom"
        animate={isShaking ? {
          rotate: [-14, 14, -12, 12, -14, 14, -8, 8, 0],
          y: [0, -10, 5, -8, 4, -5, 0],
          x: [0, -5, 5, -4, 4, -2, 0]
        } : {
          y: [0, -4, 0]
        }}
        transition={isShaking ? {
          duration: 1.5,
          ease: 'easeInOut'
        } : {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {/* Bamboo Sticks peeking out */}
        <div className="absolute top-[-30px] left-3 right-3 h-20 overflow-visible flex justify-between px-1">
          {[...Array(9)].map((_, i) => {
            const rot = -18 + i * 4.5 + (isShaking ? Math.sin(i + Date.now()) * 5 : 0);
            const h = 50 + (i % 3) * 6 + (isShaking ? Math.sin(i * 10) * 12 : 0);
            return (
              <motion.div
                key={i}
                className="w-1.5 rounded-t-sm border border-gold/25"
                style={{
                  height: `${h}px`,
                  backgroundColor: 'var(--color-gold-tint)',
                  transform: `rotate(${rot}deg)`,
                  transformOrigin: 'bottom center',
                  borderColor: 'rgba(184, 146, 46, 0.4)'
                }}
                animate={isShaking ? {
                  y: [0, -15, 0, -12, 0],
                } : {}}
                transition={{
                  duration: 1.5,
                  delay: i * 0.03,
                  ease: 'easeInOut'
                }}
              />
            );
          })}
        </div>

        {/* Cylinder Body (Cinnabar/Rosewood colors based on theme) */}
        <div className="absolute inset-0 rounded-2xl border-2 border-gold/30 bg-gradient-to-b from-[#3E2723] to-[#1A0C08] shadow-[0_8px_16px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col justify-between p-4">
          {/* Inner Light Theme variant filter */}
          <div className="absolute inset-0 bg-gold/5 mix-blend-overlay pointer-events-none" />
          
          {/* Top cylinder rim */}
          <div className="h-2 w-full rounded-full border border-gold/25 bg-gold/15 shadow-inner" />
          
          {/* Traditional patterns on the body */}
          <div className="flex-1 flex flex-col items-center justify-center border border-gold/10 rounded-lg my-2 opacity-80">
            <span className="text-[10px] text-gold/80 font-sans tracking-widest leading-none">小卦摊</span>
            <div className="w-6 h-[1px] bg-gold/30 my-1.5" />
            <span className="text-xl font-serif text-gold font-light leading-none tracking-widest" style={{ writingMode: 'vertical-rl' }}>
              靈籤筒
            </span>
          </div>
          
          {/* Bottom rim */}
          <div className="h-1.5 w-full rounded-full bg-gold/20" />
        </div>
      </motion.div>
    </div>
  );
}

export function ShakerPage() {
  const navigate = useNavigate();

  useSEO({
    title: '摇签筒快速决定 | 灵签起卦',
    description: '小卦摊摇签筒快速决定占卜，支持手机晃动传感器（DeviceMotion）进行物理摇签，提供今日运势、午餐决定、行止决策等预设签池，亦可自定义签池解答日常纠结。',
    keywords: '摇签, 摇签筒, 快速决定, 中午吃什么, 今日运势, 手机摇一摇, 占卜, AI解卦'
  });

  const [activePool, setActivePool] = useState<ShakerPool>(builtInPools[0]);
  const [customPools, setCustomPools] = useState<ShakerPool[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [drawnStick, setDrawnStick] = useState<ShakerStick | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [shakeFlash, setShakeFlash] = useState(false);
  
  // Custom pool editor states
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [newPoolName, setNewPoolName] = useState('');
  const [newStickInputs, setNewStickInputs] = useState<string[]>(['', '', '']);

  // Load custom pools from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_POOLS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ShakerPool[];
        setCustomPools(parsed);
      }
    } catch (e) {
      console.error('Failed to parse custom pools:', e);
    }
  }, []);

  // Trigger Shake Divination
  const handleShaking = useCallback(() => {
    if (isShaking || showResult || activePool.sticks.length === 0) return;

    setIsShaking(true);
    setDrawnStick(null);
    setShowResult(false);
    
    // Play haptic trigger
    if (navigator.vibrate) {
      navigator.vibrate([80, 50, 80]);
    }

    // Shaking Animation Flash
    setShakeFlash(true);
    setTimeout(() => setShakeFlash(false), 300);

    // Pick a stick randomly
    const sticks = activePool.sticks;
    const randomIndex = Math.floor(Math.random() * sticks.length);
    const selected = sticks[randomIndex];

    setTimeout(() => {
      setDrawnStick(selected);
      setIsShaking(false);
      setShowResult(true);

      // Save record to LocalStorage
      const record: DivinationRecord = {
        id: uuidv4(),
        timestamp: Date.now(),
        type: 'shaker',
        question: `求问：【${activePool.name}】`,
        data: {
          shakerData: {
            poolName: activePool.name,
            stickTitle: selected.title,
            stickFortune: selected.fortune || '平',
            stickExplanation: selected.explanation
          }
        }
      };
      saveRecord(record);
    }, 1600);
  }, [isShaking, showResult, activePool]);

  // Hook sensor binding (always on, triggers when enabled)
  const { requestPermission, permissionGranted } = useDeviceShake({
    onShake: handleShaking,
    threshold: 15,
    enabled: !isShaking && !showResult && !showCustomModal
  });

  const showShakeUI = isShakeAvailable();

  // Create custom pool handler
  const handleCreatePool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoolName.trim()) {
      alert('请输入签池名称');
      return;
    }
    const cleanSticks = newStickInputs
      .map(s => s.trim())
      .filter(s => s !== '')
      .map((title, idx) => ({
        id: idx + 1,
        title,
        fortune: '灵签',
        explanation: `小卦摊摊主觉得【${title}】这个选择非常妙！世间抉择万千，心之所向即是坦途，放手去做吧！`
      }));

    if (cleanSticks.length < 2) {
      alert('请至少输入 2 个有效的选项');
      return;
    }

    const newPool: ShakerPool = {
      id: `custom-${Date.now()}`,
      name: newPoolName,
      isCustom: true,
      sticks: cleanSticks
    };

    const updated = [...customPools, newPool];
    setCustomPools(updated);
    localStorage.setItem(CUSTOM_POOLS_KEY, JSON.stringify(updated));
    setActivePool(newPool);
    
    // Reset form states
    setNewPoolName('');
    setNewStickInputs(['', '', '']);
    setShowCustomModal(false);
  };

  // Delete custom pool handler
  const handleDeletePool = (poolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个自定义签池吗？')) return;
    const updated = customPools.filter(p => p.id !== poolId);
    setCustomPools(updated);
    localStorage.setItem(CUSTOM_POOLS_KEY, JSON.stringify(updated));
    if (activePool.id === poolId) {
      setActivePool(builtInPools[0]);
    }
  };

  const addStickInput = () => {
    setNewStickInputs([...newStickInputs, '']);
  };

  const removeStickInput = (index: number) => {
    if (newStickInputs.length <= 2) return;
    setNewStickInputs(newStickInputs.filter((_, i) => i !== index));
  };

  const handleStickInputChange = (index: number, val: string) => {
    const updated = [...newStickInputs];
    updated[index] = val;
    setNewStickInputs(updated);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-cream flex flex-col justify-center items-center px-4 py-16 relative">
        {/* Flash screen overlay during shake */}
        <AnimatePresence>
          {shakeFlash && (
            <motion.div
              className="fixed inset-0 z-50 pointer-events-none bg-gold-tint/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        <div className="max-w-xl w-full space-y-8 relative z-10 text-center flex flex-col items-center">
          {/* Header */}
          <div className="space-y-3">
            <div className="inline-block px-4 py-1 rounded-full border border-gold/20 bg-gold-tint text-gold text-xs font-sans tracking-widest uppercase">
              快速决定 · 摇签占卜
            </div>
            <h1 className="text-3xl font-serif text-ink tracking-wide">
              灵签解千愁，<span className="text-gold font-calligraphy text-4xl">签筒定去留</span>
            </h1>
            <p className="text-muted font-sans font-light text-xs max-w-sm mx-auto leading-relaxed">
              摆脱日常选择纠结。左右滑动选择签池，物理摇晃手机或点击签筒开始求签。
            </p>
          </div>

          {/* Shaker Sandbox Panel */}
          <div className="w-full bg-cream-light/60 backdrop-blur-md rounded-3xl border border-border p-6 flex flex-col items-center space-y-6">
            
            {/* Shaker Pool Selection */}
            <div className="w-full flex items-center justify-between gap-2 border-b border-border/40 pb-4">
              <span className="text-xs text-muted font-sans font-light">选择签池：</span>
              <div className="flex-1 flex gap-2 overflow-x-auto scrollbar-none py-1 justify-end">
                {[...builtInPools, ...customPools].map((pool) => (
                  <button
                    key={pool.id}
                    onClick={() => {
                      if (!isShaking && !showResult) {
                        setActivePool(pool);
                      }
                    }}
                    className={`shrink-0 px-3 py-1 rounded-full border text-[11px] font-sans font-light transition-all duration-300 relative flex items-center gap-1.5 cursor-pointer ${
                      activePool.id === pool.id
                        ? 'bg-gold border-gold text-cream font-normal'
                        : 'border-border/60 text-muted hover:border-gold/30 hover:text-gold'
                    }`}
                  >
                    <span>{pool.name}</span>
                    {pool.isCustom && (
                      <span
                        onClick={(e) => handleDeletePool(pool.id, e)}
                        className="text-[10px] hover:text-red-500 font-bold opacity-80 cursor-pointer"
                        title="删除自定义签池"
                      >
                        ✕
                      </span>
                    )}
                  </button>
                ))}
                
                <button
                  onClick={() => setShowCustomModal(true)}
                  className="shrink-0 px-3 py-1 rounded-full border border-gold/40 border-dashed text-gold text-[11px] font-sans font-light hover:bg-gold-tint transition-all duration-300 cursor-pointer"
                >
                  ➕ 自定义签池
                </button>
              </div>
            </div>

            {/* Shaker SVG and Click Animation Box */}
            <div 
              className="relative w-full h-64 flex justify-center items-center cursor-pointer select-none group"
              onClick={() => {
                if (!isShaking && !showResult) {
                  handleShaking();
                }
              }}
            >
              <ShakerCylinderSVG isShaking={isShaking} />

              {!isShaking && !showResult && (
                <div className="absolute bottom-2 bg-cream-light/80 border border-border/80 px-4 py-1 rounded-full text-[10px] text-gold font-sans font-light shadow-sm group-hover:scale-105 transition-transform">
                  点击签筒或摇晃手机求签
                </div>
              )}
            </div>

            {/* Shake sensor UI guide */}
            {showShakeUI && !showResult && (
              <div className="w-full flex justify-center">
                {!permissionGranted ? (
                  <button
                    onClick={requestPermission}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gold/10 border border-gold/25 text-gold text-xs font-sans transition-all duration-300 hover:bg-gold/20 active:scale-95 cursor-pointer"
                  >
                    <ShakingPhoneIcon className="w-4 h-4" />
                    <span>启用手机“摇一摇”求签</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-gold/80 text-[11px] font-sans font-light">
                    <motion.div
                      animate={!isShaking ? {
                        rotate: [-8, 8, -8],
                        x: [-1, 1, -1]
                      } : {}}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                    >
                      <ShakingPhoneIcon className="w-4 h-4" />
                    </motion.div>
                    <span>📱 晃动手机即可甩出灵签</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stick result display overlay container */}
          <AnimatePresence>
            {showResult && drawnStick && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Traditional Parchment (宣纸) Card */}
                <motion.div
                  className="w-full max-w-sm rounded-3xl p-8 border-3 border-gold/65 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden text-center flex flex-col items-center"
                  style={{
                    background: 'var(--color-cream-light)',
                    borderColor: 'var(--color-gold)'
                  }}
                  initial={{ scale: 0.85, y: 30, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.85, y: 30, opacity: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 120 }}
                >
                  {/* Cinnabar stamp background decor */}
                  <div className="absolute top-4 right-4 w-12 h-12 border border-dashed border-terracotta/30 text-terracotta/40 font-serif flex items-center justify-center text-xs opacity-50 rounded-sm" style={{ writingMode: 'vertical-rl' }}>
                    小卦摊主印
                  </div>

                  {/* Red/Gold Frame Border */}
                  <div className="absolute inset-2 border border-gold/15 pointer-events-none rounded-2xl" />

                  {/* Fortune Header */}
                  {drawnStick.fortune && (
                    <div className="px-4 py-1 rounded bg-terracotta text-cream text-xs font-serif font-light tracking-widest uppercase mb-4 shadow-sm shadow-terracotta/20 animate-pulse">
                      {drawnStick.fortune}
                    </div>
                  )}

                  {/* Stick Title */}
                  <h2 className="text-2xl font-serif text-ink tracking-wide font-normal mb-2 mt-2 px-2">
                    {drawnStick.title}
                  </h2>

                  {/* Poetry Sign (if present) */}
                  {drawnStick.poetry && (
                    <div className="w-full py-2 my-2 border-t border-b border-border/40 font-serif text-sm text-gold tracking-widest leading-relaxed italic">
                      「 {drawnStick.poetry} 」
                    </div>
                  )}

                  {/* Explanation body */}
                  <p className="text-sm text-muted font-sans font-light leading-relaxed my-4 px-2 text-justify">
                    {drawnStick.explanation}
                  </p>

                  <div className="w-12 h-[1px] bg-border my-3" />

                  {/* Bottom details */}
                  <p className="text-[10px] text-muted font-sans font-light tracking-widest uppercase opacity-75">
                    摊主已存盘 · 随时可归置首页查看印记
                  </p>

                  {/* Control buttons */}
                  <div className="w-full flex gap-3 mt-6 relative z-10">
                    <Button
                      onClick={() => {
                        setShowResult(false);
                        handleShaking();
                      }}
                      variant="primary"
                      className="flex-1 text-xs"
                      size="sm"
                    >
                      重新求签
                    </Button>
                    <Button
                      onClick={() => setShowResult(false)}
                      variant="secondary"
                      className="flex-1 text-xs"
                      size="sm"
                    >
                      安然收起
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom Pool Creation Modal */}
          <AnimatePresence>
            {showCustomModal && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="w-full max-w-md bg-cream border border-border p-6 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col space-y-4 max-h-[85vh] overflow-y-auto"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex justify-between items-center border-b border-border/40 pb-2.5">
                    <h3 className="text-lg font-serif text-ink">自定义决策签池</h3>
                    <button
                      onClick={() => setShowCustomModal(false)}
                      className="text-muted hover:text-gold text-lg cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleCreatePool} className="space-y-4 font-sans text-xs sm:text-sm text-left">
                    <div>
                      <label className="block text-ink font-light mb-1.5">签池名称 (如：今天谁洗碗)</label>
                      <input
                        type="text"
                        value={newPoolName}
                        onChange={(e) => setNewPoolName(e.target.value)}
                        placeholder="输入签池名"
                        className="w-full px-4 py-2.5 rounded-2xl border border-border bg-cream/60 text-ink placeholder-muted/65 focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-ink font-light">签条选项 (至少输入两个)</label>
                      {newStickInputs.map((input, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={input}
                            onChange={(e) => handleStickInputChange(idx, e.target.value)}
                            placeholder={`选项 ${idx + 1}`}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-cream/40 text-ink placeholder-muted/65 focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold transition-all"
                            required={idx < 2}
                          />
                          {newStickInputs.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeStickInput(idx)}
                              className="text-red-500 hover:text-red-600 font-bold px-2 py-1 text-sm cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addStickInput}
                        className="mt-1 flex items-center gap-1 text-gold text-xs font-light hover:underline cursor-pointer"
                      >
                        ➕ 增加选项
                      </button>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                      >
                        生成新签池
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowCustomModal(false)}
                        variant="secondary"
                        className="flex-1"
                      >
                        取消
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons to Go Back */}
          <div className="w-full flex justify-center">
            <Button
              onClick={() => navigate('/')}
              variant="secondary"
              className="text-xs max-w-[150px] w-full"
            >
              返回首页
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
