import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, matchPath } from 'react-router-dom';
import { Subject, SessionData } from './types';
import { SESSION_KEY, CACHE_KEY_SUBJECTS } from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import SubjectList from './components/SubjectList';
import ModeSelection from './components/ModeSelection';
import QuizWrapper from './components/QuizWrapper';
import HistoryView from './components/HistoryView';
import ChapterQuestionList from './components/ChapterQuestionList';
import HistoryDetailWrapper from './components/HistoryDetailWrapper';

import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminSubjects from './components/AdminSubjects';
import AdminChapters from './components/AdminChapters';
import AdminQuestions from './components/AdminQuestions';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [totalVisitorCount, setTotalVisitorCount] = useState<string>(localStorage.getItem('cached_visitor_count') || '...');
  const [showRestoreToast, setShowRestoreToast] = useState(false);

  // Check if we are in admin area
  const isAdminArea = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Only update visitor count on public pages
    if (isAdminArea) return;

    const updateTotalVisitorCount = async () => {
      try {
        const workspace = 'tracnghiemhuit';
        const counterName = 'first-counter-3695';
        const sessionKey = `counted_${workspace}_${counterName}`;
        const hasIncremented = sessionStorage.getItem(sessionKey);

        let url = `https://api.counterapi.dev/v2/${workspace}/${counterName}`;
        if (!hasIncremented) {
          url += '/up';
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const countValue = data.data?.up_count ?? data.value ?? data.count ?? 0;
          const count = countValue.toLocaleString();
          setTotalVisitorCount(count);
          localStorage.setItem('cached_visitor_count', count);
          if (!hasIncremented) {
            sessionStorage.setItem(sessionKey, 'true');
          }
        }
      } catch (error) {
        console.error("Visitor count error:", error);
      }
    };
    updateTotalVisitorCount();
  }, [isAdminArea]);



  // Session restoration
  useEffect(() => {
    if (isAdminArea) return;

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
  }, [location.pathname, navigate, isAdminArea]);

  let title = 'Trắc nghiệm Online';
  let showBack = location.pathname !== '/' && !isAdminArea;

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

      {!isAdminArea && (
        <Header
          title={title}
          showBack={showBack}
          onBack={handleBack}
          onShowHistory={() => idStr && navigate(`/history/${idStr}`)}
          disableHistory={!idStr || isQuizView || isHistoryView || !!matchDeCuong}
        />
      )}
      <main className="flex-grow overflow-hidden relative flex flex-col bg-gray-50">
        {children}
      </main>
      {!isAdminArea && <Footer totalVisitorCount={totalVisitorCount} />}
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
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/subjects" element={<AdminSubjects />} />
          <Route path="/admin/chapters" element={<AdminChapters />} />
          <Route path="/admin/questions" element={<AdminQuestions />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};

export default App;
