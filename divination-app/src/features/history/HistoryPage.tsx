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

export function HistoryPage() {
  const navigate = useNavigate();
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

    return '占卜记录';
  };

  const getRecordSubtitle = (record: DivinationRecord) => {
    if (record.type === 'liuyao') {
      return '六爻占卜';
    }
    if (record.type === 'meihua') {
      return record.data.method === 'number' ? '梅花易数 · 数字起卦' : '梅花易数 · 时间起卦';
    }
    if (record.type === 'ziwei') {
      return '紫微斗数';
    }
    return '';
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F7F4EF] px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-serif text-[#1F2421] mb-3">
              历史记录
            </h1>
            <p className="text-[#5C635D] text-lg">
              Divination History
            </p>
          </div>

          {/* Storage Stats */}
          {storageStats.count > 0 && (
            <div className="bg-white rounded-3xl shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-[#5C635D]">
                  共 <strong className="text-[#1F2421]">{storageStats.count}</strong> 条记录
                  {storageStats.shouldWarn && (
                    <span className="ml-2 text-[#C4612F]">
                      （已使用 {Math.round(storageStats.percentageFull)}%）
                    </span>
                  )}
                </div>
                {history.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-[#5C635D] hover:text-[#C4612F] transition-colors"
                  >
                    清空全部
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {history.length === 0 && (
            <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📜</div>
              <h2 className="text-2xl font-serif text-[#1F2421] mb-2">
                暂无记录
              </h2>
              <p className="text-[#5C635D] mb-6">
                开始你的第一次占卜吧
              </p>
              <Button onClick={() => navigate('/')}>
                返回首页
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
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-[#5C635D] hover:text-[#C4612F] transition-colors text-sm"
              >
                ← 返回首页
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <ConfirmModal
            title="删除记录"
            message="确定要删除这条记录吗？此操作无法撤销。"
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
            title="清空全部记录"
            message={`确定要删除全部 ${history.length} 条记录吗？此操作无法撤销。`}
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
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
      {/* Card Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left hover:bg-[#F7F4EF] transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block bg-[#F2E3D6] text-[#C4612F] text-xs font-medium px-2 py-1 rounded-full">
                {subtitle}
              </span>
              {record.accuracy === true && (
                <span className="text-xs text-green-600">✓ 准确</span>
              )}
              {record.accuracy === false && (
                <span className="text-xs text-gray-400">✗ 不准</span>
              )}
            </div>
            <h3 className="text-xl font-serif text-[#1F2421] mb-1">
              {title}
            </h3>
            {record.question && (
              <p className="text-sm text-[#5C635D] mb-2">
                问：{record.question}
              </p>
            )}
            <p className="text-xs text-[#5C635D]">
              {formatDate(record.timestamp)}
            </p>
          </div>
          <div className="text-[#5C635D]">
            {isExpanded ? '▲' : '▼'}
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-[#E7E1D7]">
          {/* Accuracy Marking */}
          <div className="mt-4 mb-4">
            <p className="text-sm text-[#5C635D] mb-2">标记准确度：</p>
            <div className="flex gap-2">
              <button
                onClick={() => onAccuracyMark(record, true)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  record.accuracy === true
                    ? 'bg-green-600 text-white'
                    : 'bg-[#F7F4EF] text-[#5C635D] hover:bg-green-50'
                }`}
              >
                ✓ 准确
              </button>
              <button
                onClick={() => onAccuracyMark(record, false)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  record.accuracy === false
                    ? 'bg-gray-400 text-white'
                    : 'bg-[#F7F4EF] text-[#5C635D] hover:bg-gray-50'
                }`}
              >
                ✗ 不准
              </button>
            </div>
          </div>

          {/* Note Section */}
          <div className="mb-4">
            <p className="text-sm text-[#5C635D] mb-2">备注：</p>
            {isEditingNote ? (
              <div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E7E1D7] rounded-2xl focus:outline-none focus:border-[#C4612F] transition-colors resize-none"
                  rows={3}
                  placeholder="添加备注..."
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleNoteSave}
                    className="px-4 py-2 bg-[#C4612F] text-white rounded-full text-sm hover:bg-[#A94E22] transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleNoteCancel}
                    className="px-4 py-2 bg-[#F7F4EF] text-[#5C635D] rounded-full text-sm hover:bg-[#E7E1D7] transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {record.userNote ? (
                  <p className="text-sm text-[#1F2421] bg-[#F7F4EF] p-3 rounded-2xl mb-2">
                    {record.userNote}
                  </p>
                ) : (
                  <p className="text-sm text-[#5C635D] italic mb-2">
                    暂无备注
                  </p>
                )}
                <button
                  onClick={() => setIsEditingNote(true)}
                  className="text-sm text-[#C4612F] hover:underline"
                >
                  {record.userNote ? '编辑备注' : '添加备注'}
                </button>
              </div>
            )}
          </div>

          {/* Delete Button */}
          <div className="pt-4 border-t border-[#E7E1D7]">
            <button
              onClick={onDelete}
              className="text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              删除记录
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-serif text-[#1F2421] mb-3">
          {title}
        </h2>
        <p className="text-[#5C635D] mb-6">
          {message}
        </p>
        <div className="flex gap-3">
          <Button onClick={onConfirm} variant="primary" fullWidth>
            确认
          </Button>
          <Button onClick={onCancel} variant="secondary" fullWidth>
            取消
          </Button>
        </div>
      </div>
    </div>
  );
}
