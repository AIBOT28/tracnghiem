import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Subject, ExamMode, Question, SessionData } from '../types';
import { API_BASE_URL, API_HEADERS, SESSION_KEY, CACHE_KEY_SUBJECTS, smartFetch } from '../constants';
import QuizView from './QuizView';
import { decryptData } from '../crypto';

const QuizWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const isThiThu = window.location.pathname.startsWith('/thi-thu');
  const mode = isThiThu ? ExamMode.THI_THU : (searchParams.get('mode') as ExamMode || ExamMode.ON_NGAU_NHIEN);
  const chapterId = searchParams.get('chapterId');
  const isRestore = searchParams.get('restore') === '1';

  const [subject, setSubject] = useState<Subject | null>(null);
  const [questionList, setQuestionList] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryReview, setIsHistoryReview] = useState(false);

  useEffect(() => {
    const fetchSubject = async () => {
      let subj: Subject | null = null;
      const cached = localStorage.getItem(CACHE_KEY_SUBJECTS);
      if (cached) {
        const parsed = JSON.parse(cached);
        subj = parsed.data.find((s: Subject) => s.id.toString() === id);
      }
      if (!subj) {
        try {
          const response = await smartFetch(`${API_BASE_URL}/subjects`, { headers: API_HEADERS });
          if (response.ok) {
             const data = await response.json();
             subj = data.find((s: Subject) => s.id.toString() === id);
          }
        } catch (e) {
          console.error(e);
        }
      }
      setSubject(subj || { id: parseInt(id || '0'), ten: 'Môn học' });
    };
    fetchSubject();
  }, [id]);

  useEffect(() => {
    if (!subject) return;

    if (isRestore) {
      const dataStr = localStorage.getItem(SESSION_KEY);
      if (dataStr) {
        const data: SessionData = JSON.parse(dataStr);
        setQuestionList(data.questions);
        setCurrentIndex(data.index);
        setUserAnswers(data.answers);
        setTimeLeft(data.timeLeft);
        setIsReviewMode(data.isReviewMode);
        setIsLoading(false);
        return;
      }
    }

    const fetchQuestions = async () => {
      setIsLoading(true);
      setIsReviewMode(mode.startsWith('on_'));
      let url = `${API_BASE_URL}/generate?subjectId=${id}&mode=${mode}`;
      if (mode === ExamMode.ON_CHUONG && chapterId) {
        url += `&chapterId=${chapterId}`;
      }
      try {
        const res = await smartFetch(url, { headers: API_HEADERS });
        if (!res.ok) throw new Error("Lỗi tải đề thi");
        const data = await res.json();
        
        let questionsToSet = data;
        if (data.encryptedData) {
            questionsToSet = decryptData(data.encryptedData);
        }
        
        setQuestionList(questionsToSet);
        setTimeLeft(mode === ExamMode.THI_THU ? 60 * 60 : 0);
      } catch (error) {
        alert("Lỗi: " + (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [subject, isRestore, id, mode, chapterId]);

  // Persist session
  useEffect(() => {
    if (!isLoading && !isHistoryReview && subject && questionList.length > 0) {
      const sessionData: SessionData = {
        subject,
        mode,
        questions: questionList,
        index: currentIndex,
        answers: userAnswers,
        timeLeft: timeLeft,
        isReviewMode: isReviewMode,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    }
  }, [isLoading, isHistoryReview, currentIndex, userAnswers, timeLeft, subject, mode, questionList, isReviewMode]);

  if (isLoading) {
    return (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm fade-in">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fa-solid fa-bolt text-blue-600 animate-pulse"></i>
            </div>
          </div>
          <p className="mt-4 text-gray-700 font-bold text-lg animate-pulse">Đang tải đề thi...</p>
          <p className="text-gray-500 text-sm">Vui lòng đợi trong giây lát</p>
        </div>
    );
  }

  return (
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
      subjectId={parseInt(id || '0')}
      onFinish={() => {
        localStorage.removeItem(SESSION_KEY);
        setIsHistoryReview(true);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('finished', '1');
        navigate(`${window.location.pathname}?${newSearchParams.toString()}`, { replace: true });
      }}
      onExitHistory={() => {
        setIsHistoryReview(false);
        navigate('/');
      }}
    />
  );
};

export default QuizWrapper;
