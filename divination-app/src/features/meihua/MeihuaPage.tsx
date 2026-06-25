import { Routes, Route, Navigate } from 'react-router-dom';
import { MeihuaInputPage } from './MeihuaInputPage';
import { MeihuaResultPage } from './MeihuaResultPage';
import { useSEO } from '../../hooks/useSEO';

export function MeihuaPage() {
  useSEO({
    title: '梅花易数起卦',
    description: '梅花易数占卜起卦，支持公历/农历时间起卦、数理起卦、汉字起卦等多种起卦方式，快速推算体用互变卦象，支持AI一键断卦。',
    keywords: '梅花易数, 起卦, 互卦, 变卦, 体用, 占卜, 易理, AI断卦, 邵康节'
  });

  return (
    <Routes>
      <Route index element={<MeihuaInputPage />} />
      <Route path="result" element={<MeihuaResultPage />} />
      <Route path="*" element={<Navigate to="/meihua" replace />} />
    </Routes>
  );
}
