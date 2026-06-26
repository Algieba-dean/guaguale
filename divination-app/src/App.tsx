import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { HomePage } from './features/home/HomePage';
import { LiuyaoPage } from './features/liuyao/LiuyaoPage';
import { MeihuaPage } from './features/meihua/MeihuaPage';
import { ZiweiPage } from './features/ziwei/ZiweiPage';
import { ShakerPage } from './features/shaker/ShakerPage';
import { HistoryPage } from './features/history/HistoryPage';
import { BackgroundDecoration } from './components/shared/BackgroundDecoration';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-cream text-ink relative z-10">
        <BackgroundDecoration />
        <Header />
        <main className="flex-1 pb-20 md:pb-0 relative z-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/liuyao/*" element={<LiuyaoPage />} />
            <Route path="/meihua/*" element={<MeihuaPage />} />
            <Route path="/ziwei" element={<ZiweiPage />} />
            <Route path="/shaker" element={<ShakerPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </BrowserRouter>
  );
}

export default App;
