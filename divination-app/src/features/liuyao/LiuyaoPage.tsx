import { Routes, Route } from 'react-router-dom';
import { QuestionPage } from './QuestionPage';
import { ShakePage } from './ShakePage';
import { ResultPage } from './ResultPage';

export function LiuyaoPage() {
  return (
    <Routes>
      <Route index element={<QuestionPage />} />
      <Route path="shake" element={<ShakePage />} />
      <Route path="result" element={<ResultPage />} />
    </Routes>
  );
}
