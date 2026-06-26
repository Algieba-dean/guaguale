import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../../components/shared/PageTransition';
import { Button } from '../../components/shared/Button';
import {
  getHistory,
  deleteRecord,
  clearAllHistory,
  updateRecord,
  type DivinationRecord,
  getStorageStats,
} from '../../utils/storage';
import { getHexagramById } from '../../utils/hexagram';
import { useSEO } from '../../hooks/useSEO';

export function HistoryPage() {
  const navigate = useNavigate();

  useSEO({
    title: '历史卦印',
    description: '小卦摊历史记录，本地安全存储您的每一次占卜六爻、梅花易数以及紫微斗数排盘，方便随时回顾与AI解卦历史。',
    keywords: '占卜历史, 排盘记录, 卦印, 命盘保存'
  });

  const [history, setHistory] = useState<DivinationRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<DivinationRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [storageStats, setStorageStats] = useState({ count: 0, percentageFull: 0, shouldWarn: false });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const records = getHistory();
    // 按时间倒序排列（最新的在前）
    const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);
    setHistory(sorted);
    setStorageStats(getStorageStats());
  };

  const handleDelete = (record: DivinationRecord) => {
    setSelectedRecord(record);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedRecord) {
      deleteRecord(selectedRecord.id);
      loadHistory();
      setShowDeleteConfirm(false);
      setSelectedRecord(null);
    }
  };

  const handleClearAll = () => {
    setShowClearAllConfirm(true);
  };

  const confirmClearAll = () => {
    clearAllHistory();
    loadHistory();
    setShowClearAllConfirm(false);
  };

  const handleAccuracyMark = (record: DivinationRecord, accurate: boolean) => {
    updateRecord(record.id, { accuracy: accurate });
    loadHistory();
  };

  const handleNoteUpdate = (record: DivinationRecord, note: string) => {
    updateRecord(record.id, { userNote: note });
    loadHistory();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRecordTitle = (record: DivinationRecord) => {
    if (record.type === 'liuyao') {
      const hexagram = record.data.mainHexagram
        ? getHexagramById(record.data.mainHexagram)
        : null;
      return hexagram ? `${hexagram.name}卦` : '六爻占卜';
    }

    if (record.type === 'meihua') {
      const hexagram = record.data.hexagram
        ? getHexagramById(record.data.hexagram)
        : null;
      return hexagram ? `${hexagram.name}卦` : '梅花易数';
    }

    if (record.type === 'ziwei') {
      return '紫微斗数';
    }

    if (record.type === 'shaker') {
      return record.data.shakerData?.stickTitle || '快速求签';
    }

    return '占卜记录';
  };

  const getRecordSubtitle = (record: DivinationRecord) => {
    if (record.type === 'liuyao') {
      return '六爻占卜';
    }
    if (record.type === 'meihua') {
      return record.data.method === 'number' ? '梅花 · 数字' : '梅花 · 时间';
    }
    if (record.type === 'ziwei') {
      return '紫微斗数';
    }
    if (record.type === 'shaker') {
      return `摇签 · ${record.data.shakerData?.poolName || '快速决定'}`;
    }
    return '';
  };

  return (
    <PageTransition>
      <div className="min-h-screen px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <div className="inline-block px-4 py-1.5 rounded-full border border-gold/20 bg-gold-tint text-gold text-xs font-sans tracking-widest uppercase">
              起卦历史记录
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-ink tracking-wide">
              历史易印
            </h1>
            <p className="text-muted font-sans font-light leading-relaxed text-sm max-w-lg mx-auto">
              归档过往占问，以照来日变爻。印证卦验，积累易学之悟。
            </p>
          </div>

          {/* Storage Stats */}
          {storageStats.count > 0 && (
            <div className="bg-cream-light/60 backdrop-blur-md border border-border rounded-3xl p-5">
              <div className="flex items-center justify-between font-sans text-xs">
                <div className="text-muted font-light tracking-wide">
                  当前存储：共 <strong className="text-gold font-normal">{storageStats.count}</strong> 条占卜印记
                  {storageStats.shouldWarn && (
                    <span className="ml-2 text-terracotta">
                      （空间已使用 {Math.round(storageStats.percentageFull)}%）
                    </span>
                  )}
                </div>
                {history.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-muted hover:text-terracotta transition-colors tracking-widest uppercase font-light text-[11px]"
                  >
                    🧹 清空全部
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {history.length === 0 && (
            <div className="bg-cream-light/60 backdrop-blur-md border border-border rounded-3xl p-12 text-center space-y-6">
              <div className="text-6xl mb-4">📜</div>
              <h2 className="text-2xl font-serif text-ink mb-2">
                暂无卦记
              </h2>
              <p className="text-muted font-sans font-light text-sm max-w-xs mx-auto">
                尘虑暂消，去起你的第一卦吧。
              </p>
              <Button onClick={() => navigate('/')} variant="primary">
                去占一卦
              </Button>
            </div>
          )}

          {/* History List */}
          <div className="space-y-4">
            {history.map((record) => (
              <HistoryRecordCard
                key={record.id}
                record={record}
                title={getRecordTitle(record)}
                subtitle={getRecordSubtitle(record)}
                formatDate={formatDate}
                onDelete={() => handleDelete(record)}
                onAccuracyMark={handleAccuracyMark}
                onNoteUpdate={handleNoteUpdate}
              />
            ))}
          </div>

          {/* Back Button */}
          {history.length > 0 && (
            <div className="pt-8 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-muted hover:text-gold transition-colors text-xs font-sans font-light"
              >
                ← 返回首页
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <ConfirmModal
            title="删除卦记"
            message="确定要删除这条占卜印记吗？此操作无法撤销。"
            onConfirm={confirmDelete}
            onCancel={() => {
              setShowDeleteConfirm(false);
              setSelectedRecord(null);
            }}
          />
        )}

        {/* Clear All Confirmation Modal */}
        {showClearAllConfirm && (
          <ConfirmModal
            title="清空全部卦记"
            message={`确定要清空全部 ${history.length} 条记录吗？尘归尘，土归土，此操作无法撤销。`}
            onConfirm={confirmClearAll}
            onCancel={() => setShowClearAllConfirm(false)}
          />
        )}
      </div>
    </PageTransition>
  );
}

interface HistoryRecordCardProps {
  record: DivinationRecord;
  title: string;
  subtitle: string;
  formatDate: (timestamp: number) => string;
  onDelete: () => void;
  onAccuracyMark: (record: DivinationRecord, accurate: boolean) => void;
  onNoteUpdate: (record: DivinationRecord, note: string) => void;
}

function HistoryRecordCard({
  record,
  title,
  subtitle,
  formatDate,
  onDelete,
  onAccuracyMark,
  onNoteUpdate,
}: HistoryRecordCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [noteText, setNoteText] = useState(record.userNote || '');
  const [isEditingNote, setIsEditingNote] = useState(false);

  const handleNoteSave = () => {
    onNoteUpdate(record, noteText);
    setIsEditingNote(false);
  };

  const handleNoteCancel = () => {
    setNoteText(record.userNote || '');
    setIsEditingNote(false);
  };

  return (
    <div className="bg-cream-light/60 backdrop-blur-md rounded-3xl border border-border overflow-hidden transition-all duration-300">
      {/* Card Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left hover:bg-cream-light transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <span className="inline-block bg-terracotta-tint border border-terracotta/20 text-terracotta text-[10px] font-sans px-2.5 py-0.5 rounded-full font-light uppercase tracking-wider">
                {subtitle}
              </span>
              {record.accuracy === true && (
                <span className="text-[11px] text-emerald-400 font-sans">✓ 准确</span>
              )}
              {record.accuracy === false && (
                <span className="text-[11px] text-rose-400 font-sans">✗ 不准</span>
              )}
            </div>
            <h3 className="text-2xl font-serif text-ink tracking-wide">
              {title}
            </h3>
            {record.question && (
              <p className="text-sm text-muted font-sans font-light leading-relaxed">
                问：{record.question}
              </p>
            )}
            <p className="text-[10px] text-muted font-sans font-light">
              时间：{formatDate(record.timestamp)}
            </p>
          </div>
          <div className="text-muted/60 pl-2 text-xs font-sans mt-1">
            {isExpanded ? '收起 ▲' : '展开 ▼'}
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-border/80 space-y-6 pt-4 font-sans text-xs">
          {/* Shaker stick details */}
          {record.type === 'shaker' && record.data.shakerData && (
            <div className="bg-cream-light/80 border border-border/70 p-4 rounded-2xl space-y-2 relative overflow-hidden font-sans">
              <div className="absolute top-2 right-2 border border-dashed border-terracotta/20 text-terracotta/30 text-[8px] px-1 py-0.5 rounded-sm" style={{ writingMode: 'vertical-rl' }}>
                小卦摊主印
              </div>
              <div className="flex justify-between items-center border-b border-border/30 pb-1.5 pr-8">
                <span className="font-serif text-[13px] text-gold font-normal">求得签条：{record.data.shakerData.stickTitle}</span>
                <span className="px-1.5 py-0.5 rounded bg-terracotta text-cream text-[9px] font-serif font-light">{record.data.shakerData.stickFortune}</span>
              </div>
              <p className="text-muted leading-relaxed font-light text-xs pt-1.5 text-justify">
                {record.data.shakerData.stickExplanation}
              </p>
            </div>
          )}

          {/* Accuracy Marking */}
          <div className="space-y-2">
            <p className="text-xs text-muted font-light">验证准确度（标记反馈）：</p>
            <div className="flex gap-3">
              <button
                onClick={() => onAccuracyMark(record, true)}
                className={`px-4 py-2 rounded-full text-xs font-light transition-all duration-300 ${
                  record.accuracy === true
                    ? 'bg-emerald-600 text-cream font-medium shadow-md shadow-emerald-600/10'
                    : 'bg-cream/40 text-muted border border-border/80 hover:border-emerald-500/20 hover:text-emerald-400'
                }`}
              >
                ✓ 准确符合
              </button>
              <button
                onClick={() => onAccuracyMark(record, false)}
                className={`px-4 py-2 rounded-full text-xs font-light transition-all duration-300 ${
                  record.accuracy === false
                    ? 'bg-rose-600 text-cream font-medium shadow-md shadow-rose-600/10'
                    : 'bg-cream/40 text-muted border border-border/80 hover:border-rose-500/20 hover:text-rose-400'
                }`}
              >
                ✗ 不准不符
              </button>
            </div>
          </div>

          {/* Note Section */}
          <div className="space-y-2">
            <p className="text-xs text-muted font-light">卦义备注与反思记录：</p>
            {isEditingNote ? (
              <div className="space-y-3">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-cream/60 text-ink placeholder-muted/65 focus:outline-none focus:ring-1 focus:ring-gold/40 focus:border-gold transition-all duration-300 resize-none"
                  rows={3}
                  placeholder="添加一些事情后来的演变和你的验证..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleNoteSave}
                    className="px-4 py-2 bg-gold text-cream rounded-full hover:bg-gold-dark transition-all duration-300 font-medium"
                  >
                    保存备注
                  </button>
                  <button
                    onClick={handleNoteCancel}
                    className="px-4 py-2 bg-cream text-muted border border-border/80 rounded-full hover:bg-border transition-colors font-light"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {record.userNote ? (
                  <p className="text-xs text-ink bg-cream/40 border border-border/10 p-3 rounded-2xl leading-relaxed">
                    {record.userNote}
                  </p>
                ) : (
                  <p className="text-xs text-muted/65 italic">
                    暂无备注印记
                  </p>
                )}
                <button
                  onClick={() => setIsEditingNote(true)}
                  className="text-xs text-gold hover:text-terracotta transition-colors font-light"
                >
                  {record.userNote ? '✏️ 编辑备注' : '＋ 添加备注'}
                </button>
              </div>
            )}
          </div>

          {/* Delete Button */}
          <div className="pt-4 border-t border-border/80">
            <button
              onClick={onDelete}
              className="text-xs text-rose-500 hover:text-rose-400 transition-colors font-light"
            >
              🗑️ 删除此卦
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ title, message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
      <div className="bg-cream-light border border-border rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <h2 className="text-2xl font-serif text-ink tracking-wide">
          {title}
        </h2>
        <p className="text-sm text-muted font-sans font-light leading-relaxed">
          {message}
        </p>
        <div className="flex gap-4 pt-2">
          <Button onClick={onConfirm} variant="primary" className="flex-1">
            确认
          </Button>
          <Button onClick={onCancel} variant="secondary" className="flex-1">
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}
