
import React, { useState, useEffect, useCallback } from 'react';
import { View, Subject, ExamMode, Question, SessionData, HistoryItem } from './types';
import { SESSION_KEY, API_BASE_URL } from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import SubjectList from './components/SubjectList';
import ModeSelection from './components/ModeSelection';
import QuizView from './components/QuizView';
import HistoryView from './components/HistoryView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('subjects');
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [currentMode, setCurrentMode] = useState<ExamMode | null>(null);
  const [questionList, setQuestionList] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isHistoryReview, setIsHistoryReview] = useState(false);
  const [visitorCount, setVisitorCount] = useState<string>('...');
  const [showRestoreToast, setShowRestoreToast] = useState(false);

  // Visitor counter
  useEffect(() => {
    const updateVisitorCount = async () => {
      try {
        const namespace = 'tracnghiem_nldk_project';
        const key = 'visits';
        const response = await fetch(`https://api.counterapi.dev/v1/${namespace}/${key}/up`);
        if (response.ok) {
          const data = await response.json();
          setVisitorCount(data.count.toLocaleString());
        }
      } catch (error) {
        console.error("Visitor count error:", error);
        setVisitorCount('err');
      }
    };
    updateVisitorCount();
  }, []);

  // Session restoration
  useEffect(() => {
    const dataStr = localStorage.getItem(SESSION_KEY);
    if (dataStr) {
      const data: SessionData = JSON.parse(dataStr);
      const now = new Date().getTime();
      if ((now - data.timestamp) / (1000 * 60 * 60) < 24) {
        if (window.confirm(`Khôi phục bài thi môn: ${data.subject.ten}?`)) {
          setCurrentSubject(data.subject);
          setCurrentMode(data.mode);
          setQuestionList(data.questions);
          setCurrentIndex(data.index);
          setUserAnswers(data.answers);
          setTimeLeft(data.timeLeft);
          setIsReviewMode(data.isReviewMode);
          setIsHistoryReview(false);
          setCurrentView('quiz');
          setShowRestoreToast(true);
          setTimeout(() => setShowRestoreToast(false), 3000);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  // Persist session
  useEffect(() => {
    if (currentView === 'quiz' && !isHistoryReview && currentSubject && currentMode) {
      const sessionData: SessionData = {
        subject: currentSubject,
        mode: currentMode,
        questions: questionList,
        index: currentIndex,
        answers: userAnswers,
        timeLeft: timeLeft,
        isReviewMode: isReviewMode,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    }
  }, [currentView, isHistoryReview, currentIndex, userAnswers, timeLeft, currentSubject, currentMode, questionList, isReviewMode]);

  const handleSelectSubject = (subject: Subject) => {
    setCurrentSubject(subject);
    setCurrentView('modes');
  };

  const handleBack = () => {
    if (currentView === 'quiz') {
      if (isHistoryReview) {
        setIsHistoryReview(false);
        setCurrentView('history');
        return;
      }
      if (window.confirm("Thoát bài sẽ mất kết quả chưa lưu. Tiếp tục?")) {
        localStorage.removeItem(SESSION_KEY);
        setCurrentView('modes');
      }
    } else if (currentView === 'modes') {
      setCurrentSubject(null);
      setCurrentView('subjects');
    } else if (currentView === 'history') {
      setCurrentView(currentSubject ? 'modes' : 'subjects');
    }
  };

  const startExam = async (mode: ExamMode, chapterId?: string) => {
    if (!currentSubject) return;
    
    setCurrentMode(mode);
    setIsReviewMode(mode.startsWith('on_'));
    setIsHistoryReview(false);
    setCurrentIndex(0);
    setUserAnswers({});
    setCurrentView('quiz');

    let url = `${API_BASE_URL}/generate?subjectId=${currentSubject.id}&mode=${mode}`;
    if (mode === ExamMode.ON_CHUONG && chapterId) {
      url += `&chapterId=${chapterId}`;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Lỗi tải đề thi");
      const data: Question[] = await res.json();
      if (data.length === 0) {
        alert("Không tìm thấy câu hỏi!");
        setCurrentView('modes');
        return;
      }
      setQuestionList(data);
      setTimeLeft(mode === ExamMode.THI_THU ? 60 * 60 : 0);
    } catch (error) {
      alert("Lỗi: " + (error as Error).message);
      setCurrentView('modes');
    }
  };

  const handleViewHistoryDetail = (item: HistoryItem) => {
    setQuestionList(item.questions);
    setUserAnswers(item.userAnswers);
    setCurrentIndex(0);
    setIsHistoryReview(true);
    setCurrentView('quiz');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white relative">
      {showRestoreToast && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <i className="fa-solid fa-circle-check text-green-400"></i>
          <span className="text-sm font-medium">Đã khôi phục bài làm cũ</span>
        </div>
      )}

      <Header 
        title={currentView === 'subjects' ? 'Trắc nghiệm Online' : (currentSubject?.ten || 'Trắc nghiệm')}
        onBack={handleBack}
        showBack={currentView !== 'subjects'}
        onShowHistory={() => currentSubject && setCurrentView('history')}
        disableHistory={!currentSubject}
      />

      <main className="flex-grow overflow-hidden relative flex flex-col bg-gray-50">
        {currentView === 'subjects' && (
          <SubjectList onSelectSubject={handleSelectSubject} />
        )}
        
        {currentView === 'modes' && currentSubject && (
          <ModeSelection subject={currentSubject} onStart={startExam} />
        )}

        {currentView === 'quiz' && (
          <QuizView 
            questions={questionList}
            currentIndex={currentIndex}
            userAnswers={userAnswers}
            timeLeft={timeLeft}
            setTimeLeft={setTimeLeft}
            isReviewMode={isReviewMode}
            isHistoryReview={isHistoryReview}
            setCurrentIndex={setCurrentIndex}
            setUserAnswers={setUserAnswers}
            subjectId={currentSubject?.id || 0}
            onFinish={() => {
                localStorage.removeItem(SESSION_KEY);
                setCurrentView('history');
            }}
            onExitHistory={() => {
                setIsHistoryReview(false);
                setCurrentView('history');
            }}
          />
        )}

        {currentView === 'history' && currentSubject && (
          <HistoryView 
            subject={currentSubject} 
            onViewDetail={handleViewHistoryDetail} 
          />
        )}
      </main>

      <Footer visitorCount={visitorCount} />
    </div>
  );
};

export default App;
