import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import QuizView from './QuizView';

const HistoryDetailWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item;
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!item) {
    return (
      <div className="p-8 text-center text-red-500">
        Lỗi: Không tìm thấy dữ liệu lịch sử. 
        <br/><br/>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded">Quay lại</button>
      </div>
    );
  }

  return (
    <QuizView
      questions={item.questions}
      currentIndex={currentIndex}
      userAnswers={item.userAnswers}
      timeLeft={0}
      setTimeLeft={() => {}}
      isReviewMode={false}
      isHistoryReview={true}
      setCurrentIndex={setCurrentIndex}
      setUserAnswers={() => {}}
      subjectId={parseInt(id || '0')}
      onFinish={() => {}}
      onExitHistory={() => navigate(-1)}
    />
  );
};

export default HistoryDetailWrapper;
