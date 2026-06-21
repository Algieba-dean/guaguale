import { Routes, Route, Navigate } from 'react-router-dom';
import { MeihuaInputPage } from './MeihuaInputPage';
import { MeihuaResultPage } from './MeihuaResultPage';

export function MeihuaPage() {
  return (
    <Routes>
      <Route index element={<MeihuaInputPage />} />
      <Route path="result" element={<MeihuaResultPage />} />
      <Route path="*" element={<Navigate to="/meihua" replace />} />
    </Routes>
  );
}
