import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Subject, ExamMode, Chapter } from '../types';
import { API_BASE_URL, API_HEADERS, CACHE_KEY_SUBJECTS, CACHE_KEY_CHAPTERS, CACHE_TIME } from '../constants';
import { sendBatchRequest } from '../batchApi.ts';


interface ModeSelectionProps {
  subject?: Subject;
  onStart?: (mode: ExamMode, chapterId?: string) => void;
}

const ModeSelection: React.FC<ModeSelectionProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);

  const [showReviewOptions, setShowReviewOptions] = useState(false);
  const [showSyllabusPopup, setShowSyllabusPopup] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState('');
  const [loadingChapters, setLoadingChapters] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoadingChapters(true);
      try {
        // Gộp 2 request: Lấy toàn bộ môn học (để tìm môn hiện tại) và lấy Chương của môn đó
        const results = await sendBatchRequest(API_BASE_URL, [
          { url: '/subjects' },
          { url: `/chapters/${id}` }
        ]);

        const subjectsRes = results.find(r => r.url === '/subjects');
        const chaptersRes = results.find(r => r.url === `/chapters/${id}`);

        if (subjectsRes?.status === 200) {
          const subj = subjectsRes.data.find((s: Subject) => s.id.toString() === id);
          if (subj) {
            setSubject(subj);
            localStorage.setItem(CACHE_KEY_SUBJECTS, JSON.stringify({
              data: subjectsRes.data,
              timestamp: new Date().getTime()
            }));
          }
        }

        if (chaptersRes?.status === 200) {
          setChapters(chaptersRes.data);
          if (chaptersRes.data.length > 0) setSelectedChapter(chaptersRes.data[0].id.toString());
          
          const cacheKey = `${CACHE_KEY_CHAPTERS}${id}`;
          localStorage.setItem(cacheKey, JSON.stringify({
            data: chaptersRes.data,
            timestamp: new Date().getTime()
          }));
        }
      } catch (error) {
        console.error("Batch load error", error);
      } finally {
        setLoadingChapters(false);
      }
    };

    fetchData();
  }, [id]);

  if (!subject) return <div className="p-8 text-center text-gray-500"><i className="fa-solid fa-circle-notch fa-spin"></i> Đang tải...</div>;

  return (
    <div className="flex-grow overflow-y-auto p-4 bg-gray-50 fade-in">
      <div className="max-w-lg mx-auto mt-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Môn: <span className="text-blue-600">{subject.ten}</span></h2>
        </div>

        <div className="space-y-4">
          <Link
            to={`/thi-thu/${subject.id}`}
            className="group block bg-white border border-gray-200 p-5 rounded-xl cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 w-1 h-full bg-red-500 group-hover:h-full transition-all"></div>
            <div className="pl-4">
              <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition">Thi Thử</h3>
              <p className="text-gray-500 text-sm mt-1">40 câu / 60 phút. Không hiện đáp án khi làm.</p>
            </div>
          </Link>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
            <div
              onClick={() => setShowReviewOptions(!showReviewOptions)}
              className="p-5 cursor-pointer hover:bg-gray-50 flex items-center justify-between relative"
            >
              <div className="absolute left-0 top-0 w-1 h-full bg-green-500"></div>
              <div className="pl-4">
                <h3 className="font-bold text-gray-800 text-lg text-green-700">Ôn Tập</h3>
                <p className="text-gray-500 text-sm mt-1">Hiện đáp án ngay khi chọn.</p>
              </div>
              <i className={`fa-solid fa-chevron-down text-gray-400 transition-transform ${showReviewOptions ? 'rotate-180' : ''}`}></i>
            </div>

            {showReviewOptions && (
              <div className="bg-gray-50 border-t border-gray-100 p-5 space-y-3">
                <p className="text-gray-500 text-sm mt-1">Ôn tập ngẫu nhiên 60 câu:</p>
                <button
                  onClick={() => navigate(`/on-tap/${subject.id}?mode=on_ngaunhien`)}
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
                        chapters.map(c => <option key={c.id} value={c.id.toString()}>{c.name}</option>)
                      ) : (
                        <option value="">Chưa có chương</option>
                      )}
                    </select>
                    <button
                      onClick={() => navigate(`/on-tap/${subject.id}?mode=on_chuong&chapterId=${selectedChapter}`)}
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

          <button
            onClick={() => setShowSyllabusPopup(true)}
            className="w-full group bg-white border border-gray-200 p-5 rounded-xl cursor-pointer hover:border-yellow-500 hover:shadow-lg transition-all flex items-center relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 w-1 h-full bg-yellow-500 group-hover:h-full transition-all"></div>
            <div className="pl-4 flex-1 text-left">
              <h3 className="font-bold text-gray-800 text-lg group-hover:text-yellow-600 transition">Xem đề cương môn học</h3>
              <p className="text-gray-500 text-sm mt-1">Xem danh sách các chương và câu hỏi chi tiết.</p>
            </div>
            <i className="fa-solid fa-list text-yellow-500 text-2xl opacity-50 group-hover:opacity-100 transition mr-4"></i>
          </button>
        </div>
      </div>

      {/* Syllabus Modal */}
      {showSyllabusPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">
                <i className="fa-solid fa-list text-yellow-500 mr-2"></i>
                Danh sách chương
              </h3>
              <button onClick={() => setShowSyllabusPopup(false)} className="text-gray-400 hover:text-gray-600 transition">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2">
              {loadingChapters ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="fa-solid fa-spinner fa-spin text-2xl mb-2"></i>
                  <p>Đang tải...</p>
                </div>
              ) : chapters.length > 0 ? (
                chapters.map(c => (
                  <Link
                    key={c.id}
                    to={`/de-cuong/${subject.id}/chuong/${c.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition font-medium text-gray-700 flex justify-between items-center"
                  >
                    <span>{c.name}</span>
                    <i className="fa-solid fa-chevron-right text-gray-400 text-sm"></i>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chưa có dữ liệu chương.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeSelection;
