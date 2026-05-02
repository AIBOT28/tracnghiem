import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Question } from '../types';
import { API_BASE_URL, API_HEADERS } from '../constants';
import { decryptData } from '../crypto';

const ChapterQuestionList: React.FC = () => {
  const { id, chapterId } = useParams<{ id: string, chapterId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/generate?subjectId=${id}&mode=on_chuong&chapterId=${chapterId}`, { headers: API_HEADERS });
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        
        if (data.encryptedData) {
            setQuestions(decryptData(data.encryptedData));
        } else {
            setQuestions(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [id, chapterId]);

  if (loading) {
     return <div className="flex-grow flex items-center justify-center text-gray-500 h-full"><i className="fa-solid fa-spinner fa-spin mr-2 text-2xl"></i>Đang tải danh sách câu hỏi...</div>;
  }

  return (
    <div className="flex-grow overflow-y-auto p-4 bg-gray-50 fade-in h-full">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-100 rounded-full transition shadow-sm">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Đề cương: Chương {chapterId}</h2>
        </div>
        <div className="space-y-6 pb-10">
          {questions.map((q, idx) => (
             <div key={idx} className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Câu {idx + 1}: {q.text}</h3>
                <div className="space-y-3">
                  {q.answers.map((ans, ansIdx) => {
                    const displayLetter = String.fromCharCode(65 + ansIdx);
                    return (
                      <div key={ans.key} className={`p-4 rounded-lg border-2 ${ans.key === q.correct ? 'bg-green-50 border-green-500 text-green-800 font-medium' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                        <span className="font-bold mr-2">{displayLetter}.</span> {ans.text}
                        {ans.key === q.correct && <i className="fa-solid fa-circle-check ml-2 text-green-600 text-lg float-right"></i>}
                      </div>
                    );
                  })}
                </div>
                {q.explanation && (
                  <div className="mt-4 text-sm text-yellow-800 bg-yellow-50/50 p-4 rounded-lg border border-yellow-100">
                    <strong><i className="fa-regular fa-lightbulb text-yellow-500 mr-1"></i> Giải thích:</strong> {q.explanation}
                  </div>
                )}
             </div>
          ))}
          {questions.length === 0 && (
            <div className="text-center text-gray-500 py-10 bg-white rounded-xl border border-gray-200">
              <i className="fa-solid fa-inbox text-4xl mb-3 block text-gray-300"></i>
              Không có câu hỏi nào trong chương này.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterQuestionList;
