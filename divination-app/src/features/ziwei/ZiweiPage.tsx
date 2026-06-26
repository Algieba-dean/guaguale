import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../../components/shared/PageTransition';
import { Button } from '../../components/shared/Button';
import { saveRecord, type DivinationRecord } from '../../utils/storage';
import { v4 as uuidv4 } from 'uuid';
import { AIInterpretation } from '../../components/shared/AIInterpretation';
import { useSEO } from '../../hooks/useSEO';
import { SharePosterModal } from '../../components/shared/SharePosterModal';

interface BirthProfile {
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
  birthHour: string;
}

interface PalaceData {
  branch: string;
  name: string;
  majorStars: string[];
  minorStars: string[];
  luckRange: string;
  desc: string;
  gridClass: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  label: string;
  className?: string;
}

function CustomDropdown({ value, onChange, options, label, className = '' }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeItem = listRef.current.querySelector('[data-active="true"]');
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'instant' as ScrollBehavior });
      }
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-2.5 sm:px-4 py-3 rounded-2xl border border-border bg-cream/60 text-ink focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold transition-all duration-300 text-xs sm:text-sm font-sans"
      >
        <span className="truncate">{value}{label}</span>
        <svg
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold transition-transform duration-300 flex-shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-2xl border border-border bg-cream-light/95 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] py-2"
            ref={listRef}
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                data-active={opt === value}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs sm:text-sm transition-all duration-200 ${
                  opt === value
                    ? 'bg-gold-tint/20 text-gold font-medium border-l-2 border-gold'
                    : 'text-ink hover:bg-gold-tint/10 hover:text-gold'
                }`}
              >
                {opt}{label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ZiweiPage() {
  const navigate = useNavigate();

  useSEO({
    title: '紫微斗数排盘',
    description: '紫微斗数在线天星排盘，依据出生日期与地支时辰快速定位十二宫垣，详尽排布十四主星、吉凶诸曜，支持AI智能全局运势解说。',
    keywords: '紫微斗数, 星盘, 排盘, 十二宫, 命格, 运势, AI命理, 天星排盘'
  });

  const [profile, setProfile] = useState<BirthProfile>({
    name: '',
    gender: 'male',
    birthDate: '1995-05-18',
    birthHour: '子时 (23:00-01:00)',
  });
  const [showChart, setShowChart] = useState(false);
  const [hoveredPalace, setHoveredPalace] = useState<PalaceData | null>(null);
  const [saved, setSaved] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1930 + 1 }, (_, i) => String(currentYear - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));

  const [birthYear, setBirthYear] = useState('1995');
  const [birthMonth, setBirthMonth] = useState('5');
  const [birthDay, setBirthDay] = useState('18');

  // Compute days dynamically based on selected year and month
  const maxDays = new Date(parseInt(birthYear, 10), parseInt(birthMonth, 10), 0).getDate();
  const days = Array.from({ length: maxDays }, (_, i) => String(i + 1));

  // Correct out-of-bounds days
  useEffect(() => {
    const currentDayNum = parseInt(birthDay, 10) || 1;
    if (currentDayNum > maxDays) {
      setBirthDay(String(maxDays));
    }
  }, [birthYear, birthMonth, maxDays, birthDay]);

  // Sync to profile.birthDate
  useEffect(() => {
    const formattedMonth = birthMonth.padStart(2, '0');
    const formattedDay = birthDay.padStart(2, '0');
    setProfile(prev => ({
      ...prev,
      birthDate: `${birthYear}-${formattedMonth}-${formattedDay}`
    }));
  }, [birthYear, birthMonth, birthDay]);

  const hours = [
    '子时 (23:00-01:00)', '丑时 (01:00-03:00)', '寅时 (03:00-05:00)',
    '卯时 (05:00-07:00)', '辰时 (07:00-09:00)', '巳时 (09:00-11:00)',
    '午时 (11:00-13:00)', '未时 (13:00-15:00)', '申时 (15:00-17:00)',
    '酉时 (17:00-19:00)', '戌时 (19:00-21:00)', '亥时 (21:00-23:00)'
  ];

  // Simulated chart data generation based on input name/date to give stable readings
  const generateChartData = (profile: BirthProfile): PalaceData[] => {
    // We use a simple hash of the name/birth date to align the Ming Gong (命宫) position and stars
    const hash = (profile.name + profile.birthDate).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mingGongIndex = hash % 12;

    const palaceNames = [
      '命宫', '兄弟宫', '夫妻宫', '子女宫', 
      '财帛宫', '疾厄宫', '迁移宫', '交友宫', 
      '官禄宫', '田宅宫', '福德宫', '父母宫'
    ];

    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    // Grid positions corresponding to the perimeter of a 4x4 grid (clockwise starting from left-top 巳)
    const gridPositions = [
      'col-start-3 row-start-4', // 子
      'col-start-2 row-start-4', // 丑
      'col-start-1 row-start-4', // 寅
      'col-start-1 row-start-3', // 卯
      'col-start-1 row-start-2', // 辰
      'col-start-1 row-start-1', // 巳
      'col-start-2 row-start-1', // 午
      'col-start-3 row-start-1', // 未
      'col-start-4 row-start-1', // 申
      'col-start-4 row-start-2', // 酉
      'col-start-4 row-start-3', // 戌
      'col-start-4 row-start-4', // 亥
    ];

    // Star distributions
    const starSets = [
      { major: ['紫微', '天府'], minor: ['左辅', '右弼', '天魁'], desc: '主一生富贵尊荣，格局宏大，多得贵人相助，具有卓越的领导才能。' },
      { major: ['武曲', '七杀'], minor: ['陀罗', '火星', '天马'], desc: '刚毅果决，财源广进，宜白手起家。需防脾气急躁，多动少静。' },
      { major: ['太阳', '巨门'], minor: ['文昌', '文曲', '禄存'], desc: '善于辞令，名声在外，利于外交或学问研究。一生贵大于富。' },
      { major: ['天机', '天梁'], minor: ['擎羊', '化科', '天喜'], desc: '心慈性温，智慧超群，擅策划分析，逢凶化吉。利于专业技术研发。' },
      { major: ['廉贞', '贪狼'], minor: ['地劫', '地空', '红鸾'], desc: '感情丰富，多才多艺，善于社交，桃花运旺盛。宜从事艺术或商业开拓。' },
      { major: ['太阴'], minor: ['天钺', '化禄', '三台'], desc: '性格温柔细致，一生财源平稳，多得女性相助。思想高雅浪漫。' },
      { major: ['天同', '天梁'], minor: ['化权', '孤辰', '八座'], desc: '主享福清闲，福泽深厚，人缘极佳，有极强的化解困难能力。' },
      { major: ['破军'], minor: ['化忌', '铃星', '天哭'], desc: '一生多波动开拓，性格敢作敢当，勇于改革创新，宜开创独立事业。' },
      { major: ['天相'], minor: ['台辅', '封诰', '华盖'], desc: '为人敦厚诚实，乐于助人，一生衣食无忧，多任职管理协理岗位。' },
      { major: ['七杀'], minor: ['大耗', '破碎', '咸池'], desc: '性格独立刚强，志向远大，作风雷厉风行，宜军警或冒险性行业。' },
      { major: ['天府'], minor: ['天寿', '龙池', '凤阁'], desc: '主财库充盈，性格沉稳保守，注重生活品质，一生衣食丰足。' },
      { major: ['天同'], minor: ['化科', '天德', '月德'], desc: '性格温和，知足常乐，主福寿，感情平稳。需防做事缺乏恒心。' }
    ];

    const list: PalaceData[] = [];
    for (let i = 0; i < 12; i++) {
      // Rotate the palace sequence in counter-clockwise direction based on mingGongIndex
      const nameIndex = (mingGongIndex - i + 12) % 12;
      const starIndex = (i + hash) % 12;

      list.push({
        branch: branches[i],
        name: palaceNames[nameIndex],
        majorStars: starSets[starIndex].major,
        minorStars: starSets[starIndex].minor,
        luckRange: `${(i * 10) + 2}-${(i * 10) + 11} 岁`,
        desc: `【${palaceNames[nameIndex]}】落在【${branches[i]}】宫。${starSets[starIndex].desc}`,
        gridClass: gridPositions[i]
      });
    }

    return list;
  };

  const chartData = generateChartData(profile);
  const mingGongData = chartData.find(p => p.name === '命宫') || chartData[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name) {
      alert('请填写姓名');
      return;
    }
    setShowChart(true);
  };

  const handleSave = () => {
    const [year, month, day] = profile.birthDate.split('-').map(Number);
    const hourIndex = hours.indexOf(profile.birthHour);
    const hourValue = hourIndex === -1 ? 0 : hourIndex * 2;

    const record: DivinationRecord = {
      id: uuidv4(),
      timestamp: Date.now(),
      type: 'ziwei',
      question: `${profile.name}的紫微命盘排盘`,
      data: {
        birthInfo: {
          year,
          month,
          day,
          hour: hourValue,
          gender: profile.gender
        },
        chartData: {
          name: profile.name,
          mingGongStars: mingGongData.majorStars
        }
      }
    };

    const success = saveRecord(record);
    if (success) {
      setSaved(true);
    }
  };

  const ziweiData = {
    profile: {
      name: profile.name,
      gender: profile.gender,
      birthDate: profile.birthDate,
      birthHour: profile.birthHour
    },
    mingGongData: {
      majorStars: mingGongData.majorStars,
      minorStars: mingGongData.minorStars,
      desc: mingGongData.desc,
      luckRange: mingGongData.luckRange,
      branch: mingGongData.branch
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl w-full space-y-8 relative z-10">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-block px-4 py-1.5 rounded-full border border-gold/20 bg-gold-tint text-gold text-xs font-sans tracking-widest uppercase">
              紫微斗数 · Ziwei Dou Shu
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-ink tracking-wide">
              天星排盘，<span className="text-gold italic font-calligraphy">命理乾坤</span>
            </h1>
            <p className="text-muted font-sans font-light leading-relaxed text-sm max-w-lg mx-auto">
              排演天干地支，定位十二宫垣。洞察本命星宿分布，解构先天格局与运势。
            </p>
          </div>

          {!showChart ? (
            /* Input Form */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="bg-cream-light/60 backdrop-blur-md rounded-3xl border border-border p-6 sm:p-8 max-w-xl mx-auto space-y-6"
            >
              <h2 className="text-lg font-serif text-gold border-l-2 border-gold pl-2">输入命主档案</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
                <div>
                  <label className="block text-ink font-light mb-2">姓名</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-cream/60 text-ink placeholder-muted/65 focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold transition-all duration-300"
                    placeholder="输入姓名"
                    required
                  />
                </div>

                <div>
                  <label className="block text-ink font-light mb-2">性别</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, gender: 'male' })}
                      className={`flex-1 py-2.5 rounded-full border transition-all duration-300 ${
                        profile.gender === 'male'
                          ? 'bg-gold text-cream font-medium border-gold'
                          : 'bg-cream/40 text-muted border-border/80 hover:text-gold hover:border-gold/30'
                      }`}
                    >
                      🚹 乾造 (男)
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, gender: 'female' })}
                      className={`flex-1 py-2.5 rounded-full border transition-all duration-300 ${
                        profile.gender === 'female'
                          ? 'bg-gold text-cream font-medium border-gold'
                          : 'bg-cream/40 text-muted border-border/80 hover:text-gold hover:border-gold/30'
                      }`}
                    >
                      🚺 坤造 (女)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-ink font-light mb-2">出生日期 (公历)</label>
                  <div className="grid grid-cols-3 gap-2">
                    <CustomDropdown
                      value={birthYear}
                      onChange={setBirthYear}
                      options={years}
                      label="年"
                    />
                    <CustomDropdown
                      value={birthMonth}
                      onChange={setBirthMonth}
                      options={months}
                      label="月"
                    />
                    <CustomDropdown
                      value={birthDay}
                      onChange={setBirthDay}
                      options={days}
                      label="日"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-ink font-light mb-2">出生时辰 (地支)</label>
                  <CustomDropdown
                    value={profile.birthHour}
                    onChange={(val) => setProfile({ ...profile, birthHour: val })}
                    options={hours}
                    label=""
                    className="w-full"
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" fullWidth>
                    排定紫微命盘
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : (
            /* Astrological 12-Palace Grid Layout */
            <div className="space-y-6">
              
              {/* Outer Grid Panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="grid grid-cols-4 grid-rows-4 gap-1.5 sm:gap-2 bg-cream-light/45 backdrop-blur-md rounded-3xl border border-border p-2 sm:p-4 aspect-square max-w-2xl mx-auto overflow-hidden"
              >
                
                {/* 12 Palaces mapping */}
                {chartData.map((palace, index) => {
                  const isHovered = hoveredPalace?.name === palace.name;
                  const isMingGong = palace.name === '命宫';

                  return (
                    <motion.div
                      key={palace.branch}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        type: 'spring',
                        stiffness: 80,
                        damping: 12,
                        delay: index * 0.04 
                      }}
                      onMouseEnter={() => setHoveredPalace(palace)}
                      onMouseLeave={() => setHoveredPalace(null)}
                      onClick={() => setHoveredPalace(palace === hoveredPalace ? null : palace)}
                      className={`rounded-2xl border p-1.5 sm:p-3 flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-sm ${palace.gridClass} ${
                        isHovered 
                          ? 'border-gold bg-gold-tint/20 shadow-[0_8px_20px_rgba(223,177,91,0.2)] scale-[1.03] -translate-y-0.5 z-20' 
                          : isMingGong 
                            ? 'border-terracotta/70 bg-terracotta-tint/15 shadow-inner' 
                            : 'border-border/60 bg-cream/35 hover:border-gold/30 hover:shadow-[0_4px_10px_rgba(223,177,91,0.06)]'
                      }`}
                    >
                      {/* Palace Title Header */}
                      <div className="flex justify-between items-start">
                        <span className={`text-[8px] sm:text-[10px] font-sans font-light px-1 sm:px-1.5 py-0.5 rounded ${
                          isMingGong ? 'bg-terracotta text-cream' : 'bg-border/30 text-gold'
                        }`}>
                          {palace.name}
                        </span>
                        <span className="text-[8px] sm:text-[10px] text-muted font-sans font-light">
                          {palace.branch}宫
                        </span>
                      </div>

                      {/* Stars Center */}
                      <div className="my-0.5 sm:my-1 space-y-0.5">
                        {palace.majorStars.map(star => (
                          <div key={star} className="text-[10px] sm:text-xs font-serif font-medium text-ink flex items-center gap-0.5 sm:gap-1 justify-center">
                            <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-gold inline-block" />
                            {star}
                          </div>
                        ))}
                      </div>

                      {/* Luck range footer */}
                      <div className="flex justify-between items-center text-[7px] sm:text-[8px] text-muted/80 font-sans font-light">
                        <span className="truncate">{palace.luckRange}</span>
                        <span className="opacity-40 truncate">{palace.minorStars[0]}</span>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Central Combined block (grid position col 2-3, row 2-3) */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  onClick={() => setHoveredPalace(null)}
                  className="col-start-2 col-end-4 row-start-2 row-end-4 bg-cream/70 border border-border/80 rounded-2xl p-2 sm:p-4 flex flex-col justify-between text-center overflow-y-auto cursor-pointer"
                >
                  <AnimatePresence mode="wait">
                    {hoveredPalace ? (
                      <motion.div
                        key={hoveredPalace.name}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2 sm:space-y-3 my-auto"
                      >
                        <div className="space-y-0.5 sm:space-y-1">
                          <span className="text-[8px] sm:text-[9px] text-gold tracking-widest font-sans uppercase">宫位研判</span>
                          <h3 className="text-sm sm:text-xl font-serif text-ink">{hoveredPalace.name} ({hoveredPalace.branch}宫)</h3>
                        </div>
                        <div className="flex gap-1 sm:gap-2 justify-center flex-wrap">
                          {hoveredPalace.majorStars.map(s => (
                            <span key={s} className="px-1.5 sm:px-2 py-0.5 rounded bg-gold-tint text-gold text-[9px] sm:text-[10px] border border-gold/10 font-sans font-light">{s}</span>
                          ))}
                          {hoveredPalace.minorStars.slice(0, 2).map(s => (
                            <span key={s} className="px-1.5 sm:px-2 py-0.5 rounded bg-border/20 text-muted text-[9px] sm:text-[10px] font-sans font-light">{s}</span>
                          ))}
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-muted font-sans font-light leading-relaxed text-left">
                          {hoveredPalace.desc}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-1.5 sm:space-y-2 my-auto font-sans"
                      >
                        <span className="text-[8px] sm:text-[9px] text-gold tracking-widest uppercase">命主格局盘志</span>
                        <h3 className="text-sm sm:text-lg font-serif text-ink">{profile.name} 的紫微盘</h3>
                        <div className="text-[10px] sm:text-[11px] text-muted space-y-0.5 sm:space-y-1 font-light leading-relaxed">
                          <p>性别：{profile.gender === 'male' ? '乾造 (男)' : '坤造 (女)'}</p>
                          <p>诞辰：{profile.birthDate}</p>
                          <p>时辰：{profile.birthHour}</p>
                          <p className="text-gold mt-1 pt-1 border-t border-border/20">💡 提示：点击或滑动宫位查看断语</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              {/* AI Interpretation */}
              <AIInterpretation type="ziwei" data={ziweiData} onResultLoaded={setAiResult} />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
                <Button onClick={handleSave} disabled={saved} variant="primary" className="flex-1">
                  {saved ? '✓ 已保存排盘' : '保存此命盘'}
                </Button>
                <Button
                  onClick={() => setShareModalOpen(true)}
                  variant="secondary"
                  className="flex-1"
                >
                  🌌 分享海报
                </Button>
                <Button
                  onClick={() => {
                    setShowChart(false);
                    setSaved(false);
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  重新排盘
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="ghost"
                  className="flex-1"
                >
                  返回首页
                </Button>
              </div>
              <SharePosterModal
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                type="ziwei"
                data={ziweiData}
                aiResult={aiResult}
              />
            </div>
          )}

        </div>
      </div>
    </PageTransition>
  );
}
