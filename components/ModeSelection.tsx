
import React, { useState, useEffect } from 'react';
import { Subject, ExamMode, Chapter } from '../types';
import { API_BASE_URL } from '../constants';

interface ModeSelectionProps {
  subject: Subject;
  onStart: (mode: ExamMode, chapterId?: string) => void;
}

const ModeSelection: React.FC<ModeSelectionProps> = ({ subject, onStart }) => {
  const [showReviewOptions, setShowReviewOptions] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [loadingChapters, setLoadingChapters] = useState(false);

  useEffect(() => {
    const fetchChapters = async () => {
      setLoadingChapters(true);
      try {
        const res = await fetch(`${API_BASE_URL}/chapters/${subject.id}`, { headers: API_HEADERS });
        const data = await res.json();
        setChapters(data);
        if (data.length > 0) setSelectedChapter(data[0].name);
      } catch (e) {
        console.error("Chapters load error", e);
      } finally {
        setLoadingChapters(false);
      }
    };
    fetchChapters();
  }, [subject.id]);

  return (
    <div className="flex-grow overflow-y-auto p-4 bg-gray-50 fade-in">
      <div className="max-w-lg mx-auto mt-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Môn: <span className="text-blue-600">{subject.ten}</span></h2>
        </div>

        <div className="space-y-4">
          <div 
            onClick={() => onStart(ExamMode.THI_THU)}
            className="group bg-white border border-gray-200 p-5 rounded-xl cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all flex items-center justify-between relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 w-1 h-full bg-red-500 group-hover:h-full transition-all"></div>
            <div className="pl-4">
              <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition">Thi Thử</h3>
              <p className="text-gray-500 text-sm mt-1">40 câu / 60 phút.</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
            <div 
              onClick={() => setShowReviewOptions(!showReviewOptions)}
              className="p-5 cursor-pointer hover:bg-gray-50 flex items-center justify-between relative"
            >
              <div className="absolute left-0 top-0 w-1 h-full bg-green-500"></div>
              <div className="pl-4">
                <h3 className="font-bold text-gray-800 text-lg text-green-700">Ôn Tập</h3>
                <p className="text-gray-500 text-sm mt-1">Hiện đáp án ngay.</p>
              </div>
              <i className={`fa-solid fa-chevron-down text-gray-400 transition-transform ${showReviewOptions ? 'rotate-180' : ''}`}></i>
            </div>

            {showReviewOptions && (
              <div className="bg-gray-50 border-t border-gray-100 p-5 space-y-3">
                <p className="text-gray-500 text-sm mt-1">Ôn tập ngẫu nhiên 60 câu:</p>
                <button 
                  onClick={() => onStart(ExamMode.ON_NGAU_NHIEN)}
                  className="w-full bg-white border border-gray-200 hover:border-blue-400 py-3 rounded-lg shadow-sm font-medium transition"
                >
                  60 Câu ngẫu nhiên
                </button>
                
                <p className="text-gray-500 text-sm mt-1">Hoặc ôn tập theo chương:</p>
                {loadingChapters ? (
                  <p className="text-xs text-gray-400 italic">Đang tải chương...</p>
                ) : (
                  <>
                    <select 
                      value={selectedChapter}
                      onChange={(e) => setSelectedChapter(e.target.value)}
                      className="block w-full p-3 border rounded-lg bg-white"
                    >
                      {chapters.length > 0 ? (
                        chapters.map(c => <option key={c.name} value={c.name}>Chương {c.name}</option>)
                      ) : (
                        <option value="">Chưa có chương</option>
                      )}
                    </select>
                    <button 
                      onClick={() => onStart(ExamMode.ON_CHUONG, selectedChapter)}
                      disabled={!selectedChapter}
                      className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                      Bắt đầu ôn chương
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeSelection;
