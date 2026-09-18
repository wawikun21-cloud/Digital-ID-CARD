import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DigitalIdPage from './features/digital-id/pages/DigitalIdPage';
import DigitalIdViewPage from './features/digital-id/pages/DigitalIdViewPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DigitalIdPage />} />
        {/* Matches VERIFY_BASE_URL's shape in digitalIdUtils, so the QR
            code on the card back opens straight into this page. */}
        <Route path="/verify/:id" element={<DigitalIdViewPage />} />
      </Routes>
    </BrowserRouter>
  );
}
