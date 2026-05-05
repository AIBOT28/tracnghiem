import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, matchPath } from 'react-router-dom';
import { Subject, SessionData } from './types';
import { SESSION_KEY, CACHE_KEY_SUBJECTS } from './constants';
import * as signalR from '@microsoft/signalr';
import Header from './components/Header';
import Footer from './components/Footer';
import SubjectList from './components/SubjectList';
import ModeSelection from './components/ModeSelection';
import QuizWrapper from './components/QuizWrapper';
import HistoryView from './components/HistoryView';
import ChapterQuestionList from './components/ChapterQuestionList';
import HistoryDetailWrapper from './components/HistoryDetailWrapper';

const AppLayout: React.FC<{ children: React.ReactNod }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [totalVisitorCount, setTotalVisitorCount] = useState<string>('...');
  const [showRestoreToast, setShowRestoreToast] = useState(false);

  useEffect(() => {
    const updateTotalVisitorCount = async () => {
      try {
        const namespace = 'tracnghiem_nldk_project';
        const key = 'visits';
        const response = await fetch(`https://api.counterapi.dev/v1/${namespace}/${key}/up`);
        if (response.ok) {
          const data = await response.json();
          setTotalVisitorCount(data.count.toLocaleString());
        }
      } catch (error) {
        console.error("Visitor count error:", error);
        setTotalVisitorCount('err');
      }
    };
    updateTotalVisitorCount();
  }, []);



  // Session restoration
  useEffect(() => {
    const dataStr = localStorage.getItem(SESSION_KEY);
    if (dataStr && location.pathname === '/') {
      const data: SessionData = JSON.parse(dataStr);
      const now = new Date().getTime();
      if ((now - data.timestamp) / (1000 * 60 * 60) < 24) {
        if (window.confirm(`Khôi phục bài thi môn: ${data.subject.ten}?`)) {
          setShowRestoreToast(true);
          setTimeout(() => setShowRestoreToast(false), 3000);
          if (data.mode.startsWith('on_')) {
            navigate(`/on-tap/${data.subject.id}?mode=${data.mode}&restore=1`);
          } else {
            navigate(`/thi-thu/${data.subject.id}?restore=1`);
          }
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, [location.pathname, navigate]);

  let title = 'Trắc nghiệm Online';
  let showBack = location.pathname !== '/';

  let idStr = '';
  const matchMonHoc = matchPath('/monhoc/:id', location.pathname);
  const matchThiThu = matchPath('/thi-thu/:id', location.pathname);
  const matchOnTap = matchPath('/on-tap/:id', location.pathname);
  const matchHistory = matchPath('/history/:id', location.pathname);
  const matchDeCuong = matchPath('/de-cuong/:id/chuong/:chapterId', location.pathname);

  const match = matchMonHoc || matchThiThu || matchOnTap || matchHistory || matchDeCuong;
  if (match && match.params.id) {
    idStr = match.params.id;
    const cachedData = localStorage.getItem(CACHE_KEY_SUBJECTS);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      const subj = parsed.data.find((s: Subject) => s.id.toString() === idStr);
      if (subj) title = subj.ten;
    } else {
      title = 'Trắc nghiệm';
    }
  }

  const searchParams = new URLSearchParams(location.search);
  const isQuizFinished = searchParams.get('finished') === '1';
  const isQuizView = (location.pathname.includes('/thi-thu') || location.pathname.includes('/on-tap')) && !isQuizFinished;
  const isHistoryView = location.pathname.includes('/history');

  const handleBack = () => {
    if (isQuizView) {
      if (window.confirm("Thoát bài sẽ mất kết quả chưa lưu. Tiếp tục?")) {
        localStorage.removeItem(SESSION_KEY);
        navigate(`/monhoc/${idStr}`);
      }
    } else if (matchHistory || matchMonHoc) {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white relative">
      {showRestoreToast && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[90] bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <i className="fa-solid fa-circle-check text-green-400"></i>
          <span className="text-sm font-medium">Đã khôi phục bài làm cũ</span>
        </div>
      )}

      <Header
        title={title}
        showBack={showBack}
        onBack={handleBack}
        onShowHistory={() => idStr && navigate(`/history/${idStr}`)}
        disableHistory={!idStr || isQuizView || isHistoryView || !!matchDeCuong}
      />
      <main className="flex-grow overflow-hidden relative flex flex-col bg-gray-50">
        {children}
      </main>
      <Footer totalVisitorCount={totalVisitorCount} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<SubjectList onSelectSubject={() => { }} />} />
          <Route path="/monhoc/:id" element={<ModeSelection subject={{ id: 0, ten: '' }} onStart={() => { }} />} />
          <Route path="/thi-thu/:id" element={<QuizWrapper />} />
          <Route path="/on-tap/:id" element={<QuizWrapper />} />
          <Route path="/de-cuong/:id/chuong/:chapterId" element={<ChapterQuestionList />} />
          <Route path="/history/:id" element={<HistoryView />} />
          <Route path="/history/:id/detail" element={<HistoryDetailWrapper />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default App;
