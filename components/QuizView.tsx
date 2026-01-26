
import React, { useState, useEffect, useRef } from 'react';
import { Question, HistoryItem } from '../types';

interface QuizViewProps {
  questions: Question[];
  currentIndex: number;
  userAnswers: Record<number, string>;
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  isReviewMode: boolean;
  isHistoryReview: boolean;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  setUserAnswers: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  subjectId: number;
  onFinish: () => void;
  onExitHistory: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({
  questions, currentIndex, userAnswers, timeLeft, setTimeLeft,
  isReviewMode, isHistoryReview, setCurrentIndex, setUserAnswers,
  subjectId, onFinish, onExitHistory
}) => {
  const [showPalette, setShowPalette] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0 && !isHistoryReview && !isReviewMode) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleFinish(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeLeft, isHistoryReview, isReviewMode]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [currentIndex]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0 && (isReviewMode || isHistoryReview)) return "∞";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const handleChoose = (key: string) => {
    if (isHistoryReview) return;
    if (isReviewMode && userAnswers[currentIndex]) return;
    setUserAnswers(prev => ({ ...prev, [currentIndex]: key }));
  };

  const handleFinish = (force = false) => {
    if (!force && !window.confirm("Bạn có chắc chắn muốn nộp bài?")) return;
    
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct) correctCount++;
    });
    
    const score = ((correctCount / questions.length) * 10).toFixed(1);
    
    // Save history
    const historyKey = `history_sub_${subjectId}`;
    const history: HistoryItem[] = JSON.parse(localStorage.getItem(historyKey) || '[]');
    const newItem: HistoryItem = {
      date: new Date().toLocaleString('vi-VN'),
      mode: isReviewMode ? "Ôn tập" : "Thi thử",
      correct: correctCount,
      total: questions.length,
      score,
      questions,
      userAnswers
    };
    
    history.unshift(newItem);
    localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 20)));
    
    alert(`KẾT QUẢ:\n- Số câu đúng: ${correctCount}/${questions.length}\n- Điểm số: ${score}`);
    onFinish();
  };

  const q = questions[currentIndex];
  if (!q) return <div className="p-8 text-center">Đang chuẩn bị câu hỏi...</div>;

  const currentChoice = userAnswers[currentIndex];
  const isViewer = isReviewMode || isHistoryReview;
  const doneCount = Object.keys(userAnswers).length;

  return (
    <div className="flex-grow flex flex-col md:flex-row bg-white h-full overflow-hidden relative">
      <div className="flex-grow flex flex-col h-full relative md:border-r border-gray-200">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex justify-between items-center shadow-sm shrink-0 z-10 h-12">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Thời gian</span>
            <span className={`text-lg font-mono font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-700'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase">Câu</span>
            <span className="font-bold text-blue-600 text-lg">{currentIndex + 1}/{questions.length}</span>
          </div>
        </div>

        <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 md:p-8 bg-white pb-20">
          <div className="max-w-3xl mx-auto">
            <div className="text-lg md:text-2xl font-medium text-gray-800 leading-relaxed mb-6">
              Câu {currentIndex + 1}: {q.text}
            </div>

            <div className="space-y-3 md:space-y-4">
              {q.answers.map(ans => {
                let statusClass = "border-gray-200 hover:border-blue-300 bg-white text-gray-700";
                let icon = null;

                if (currentChoice) {
                  if (currentChoice === ans.key) {
                    statusClass = "border-blue-500 bg-blue-50 ring-1 ring-blue-500 text-blue-800 font-medium";
                  }
                  if (isViewer) {
                    if (ans.key === q.correct) {
                      statusClass = "border-green-500 bg-green-50 text-green-800 font-medium";
                      icon = <i className="fa-solid fa-circle-check text-green-600 text-xl mt-1"></i>;
                    } else if (currentChoice === ans.key && currentChoice !== q.correct) {
                      statusClass = "border-red-400 bg-red-50 text-red-800";
                      icon = <i className="fa-solid fa-circle-xmark text-red-600 text-xl mt-1"></i>;
                    }
                  }
                }

                return (
                  <label 
                    key={ans.key} 
                    className={`block w-full text-left p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-3 select-none text-base ${statusClass}`}
                    onClick={() => handleChoose(ans.key)}
                  >
                    <div className="mt-1">
                      <input 
                        type="radio" 
                        name={`answer_${currentIndex}`} 
                        checked={currentChoice === ans.key} 
                        readOnly
                        className="accent-blue-600 w-4 h-4" 
                      />
                    </div>
                    <div className="flex-grow text-sm md:text-base">
                      <span className="font-bold mr-1">{ans.key}.</span> {ans.text}
                    </div>
                    <div>{icon}</div>
                  </label>
                );
              })}
            </div>

            {isViewer && (currentChoice || isHistoryReview) && q.explanation && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 animate-fade-in">
                <strong><i className="fa-regular fa-lightbulb"></i> Giải thích:</strong> {q.explanation}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 p-2 md:p-4 bg-white flex justify-between items-center shrink-0 h-16 md:h-20">
          <button 
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            className="flex-1 md:flex-none px-2 md:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium mr-2 flex justify-center items-center gap-1 transition"
          >
            <i className="fa-solid fa-arrow-left"></i> <span className="hidden md:inline">Trước</span>
          </button>

          <button 
            onClick={() => setShowPalette(true)}
            className="flex-1 md:hidden px-2 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-bold mr-2 flex justify-center items-center gap-1"
          >
            <i className="fa-solid fa-table-cells"></i> DS Câu
          </button>

          {!isHistoryReview ? (
            <button 
              onClick={() => handleFinish()}
              className="hidden md:block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition"
            >
              {isReviewMode ? 'Kết thúc' : 'Nộp bài'}
            </button>
          ) : (
            <button 
              onClick={onExitHistory}
              className="hidden md:block px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold shadow-md transition"
            >
              Thoát xem lại
            </button>
          )}

          <button 
            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            className="flex-1 md:flex-none px-2 md:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium flex justify-center items-center gap-1 transition"
          >
            <span className="hidden md:inline">Sau</span> <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <div className={`
        ${showPalette ? 'flex' : 'hidden'} 
        fixed inset-0 z-[50] bg-white text-gray-800 
        md:flex md:static md:z-auto md:bg-gray-50 md:border-l md:border-gray-200 md:w-80 md:flex-col
      `}>
        <div className="md:hidden absolute top-0 left-0 right-0 h-14 bg-blue-600 text-white flex justify-between items-center px-4 shadow-md z-20">
          <span className="font-bold text-lg">Danh sách câu hỏi</span>
          <button onClick={() => setShowPalette(false)} className="text-white hover:bg-white/20 p-2 rounded-full">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="hidden md:flex p-3 bg-white border-b border-gray-200 font-bold text-gray-700 justify-between items-center shadow-sm h-12 shrink-0">
          <span><i className="fa-solid fa-table-cells"></i> Danh sách câu</span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{doneCount}/{questions.length}</span>
        </div>

        <div className="absolute top-14 bottom-20 left-0 right-0 overflow-y-auto bg-gray-50 p-3 md:static md:flex-1 md:bg-transparent">
          <div className="grid grid-cols-5 gap-3 md:gap-2">
            {questions.map((_, idx) => {
              let classes = "h-10 w-full rounded-md font-bold text-sm transition flex items-center justify-center border ";
              if (idx === currentIndex) classes += "border-blue-600 ring-2 ring-blue-300 text-blue-700 bg-white shadow-md z-10 scale-105";
              else if (userAnswers[idx]) {
                if (isHistoryReview) {
                  const isCorrect = userAnswers[idx] === questions[idx].correct;
                  classes += isCorrect ? "bg-green-500 border-green-600 text-white" : "bg-red-500 border-red-600 text-white";
                } else {
                  classes += "bg-blue-500 border-blue-600 text-white";
                }
              } else {
                classes += "bg-white border-gray-300 text-gray-600";
              }

              return (
                <button 
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    if (window.innerWidth < 768) setShowPalette(false);
                  }} 
                  className={classes}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:hidden absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 p-4 flex items-center z-20">
          {!isHistoryReview ? (
            <button onClick={() => handleFinish()} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg active:scale-95 transition">
              Nộp bài thi
            </button>
          ) : (
            <button onClick={onExitHistory} className="w-full py-3 bg-gray-600 text-white font-bold rounded-lg shadow-lg active:scale-95 transition">
              Thoát xem lại
            </button>
          )}
        </div>

        <div className="hidden md:block p-3 border-t border-gray-200 bg-white text-xs text-gray-500 space-y-2 shrink-0">
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded border border-gray-300 bg-white block"></span> Chưa làm</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-blue-500 block"></span> Đã làm</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded border-2 border-blue-600 block"></span> Đang xem</div>
          {isHistoryReview && (
            <>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-green-500 block"></span> Đúng</div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-500 block"></span> Sai</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizView;
