import { Routes, Route } from 'react-router-dom';
import { QuestionPage } from './QuestionPage';
import { ShakePage } from './ShakePage';
import { ResultPage } from './ResultPage';
import { useSEO } from '../../hooks/useSEO';

export function LiuyaoPage() {
  useSEO({
    title: '周易六爻占卜',
    description: '周易六爻金钱课占卜排盘，支持手动模拟摇卦及电脑起卦，解读本卦、变卦爻辞，支持AI智能一键爻辞解卦。',
    keywords: '六爻, 占卜, 金钱卦, 易经, 爻辞, 摇卦, AI解卦, 爻位, 断卦'
  });

  return (
    <Routes>
      <Route index element={<QuestionPage />} />
      <Route path="shake" element={<ShakePage />} />
      <Route path="result" element={<ResultPage />} />
    </Routes>
  );
}
