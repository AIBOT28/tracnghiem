import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Subject } from '../types';
import { API_BASE_URL, CACHE_KEY_SUBJECTS, CACHE_TIME, API_HEADERS, smartFetch } from '../constants';

interface SubjectListProps {
  onSelectSubject?: (subject: Subject) => void;
}

const PINNED_SUBJECTS_KEY = 'PINNED_SUBJECTS';

const SubjectList: React.FC<SubjectListProps> = ({ onSelectSubject }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinnedIds, setPinnedIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      const cachedData = localStorage.getItem(CACHE_KEY_SUBJECTS);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const now = new Date().getTime();
        if (now - parsed.timestamp < CACHE_TIME) {
          setSubjects(parsed.data);
          setLoading(false);
          return;
        }
      }

      try {
        const response = await smartFetch(`${API_BASE_URL}/subjects`, { headers: API_HEADERS });
        if (!response.ok) throw new Error("Lỗi kết nối");
        const data = await response.json();
        setSubjects(data);
        localStorage.setItem(CACHE_KEY_SUBJECTS, JSON.stringify({
          data,
          timestamp: new Date().getTime()
        }));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const savedPinned = localStorage.getItem(PINNED_SUBJECTS_KEY);
    if (savedPinned) {
      try {
        setPinnedIds(JSON.parse(savedPinned));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const togglePin = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    let newPinned = [...pinnedIds];
    if (newPinned.includes(id)) {
      newPinned = newPinned.filter(pId => pId !== id);
    } else {
      newPinned.push(id);
    }
    setPinnedIds(newPinned);
    localStorage.setItem(PINNED_SUBJECTS_KEY, JSON.stringify(newPinned));
  };

  const pinnedSubjects = subjects.filter(s => pinnedIds.includes(s.id));
  const unpinnedSubjects = subjects.filter(s => !pinnedIds.includes(s.id));

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 bg-gray-50">
        <i className="fa-solid fa-circle-notch fa-spin text-4xl text-blue-500 mb-4"></i>
        <p className="text-gray-500 font-medium">Đang tải danh sách môn học...</p>
      </div>
    );
  }

  return (
    <div className="flex-grow overflow-y-auto p-4 bg-gray-50 fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 mt-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Danh sách môn học
          </h2>

          <div className="space-y-3 mb-8 px-2">
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-3 border border-red-100">
              <i className="fa-solid fa-circle-exclamation mt-0.5 flex-shrink-0"></i>
              <p className="leading-relaxed">
                Website <span className="font-semibold">tracnghiemhuit.vercel.app</span> sắp ngừng hoạt động. Vui lòng sử dụng địa chỉ mới: <a href="https://tracnghiemhuit.onrender.com/" className="font-bold underline hover:text-red-800">tracnghiemhuit.onrender.com</a>
              </p>
            </div>
            
            <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm flex flex-col sm:flex-row sm:items-center gap-3 border border-blue-100 justify-between">
              <div className="flex items-start sm:items-center gap-2">
                <i className="fa-solid fa-circle-info mt-0.5 sm:mt-0 flex-shrink-0"></i>
                <p>Cập nhật dữ liệu có thể mất 20-30 phút (dùng tab ẩn danh nếu chưa thấy).</p>
              </div>
              <div className="text-xs font-medium bg-blue-100 px-2 py-1 rounded text-blue-800 inline-flex items-center w-fit">
                <i className="fa-solid fa-check mr-1.5"></i> Hoàn toàn miễn phí
              </div>
            </div>
          </div>
        </div>

        {pinnedSubjects.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2 px-1">
              <i className="fa-solid fa-thumbtack text-blue-500"></i> Môn học đã ghim
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {pinnedSubjects.map(subject => (
                <Link
                  to={`/monhoc/${subject.id}`}
                  key={subject.id}
                  onClick={() => onSelectSubject && onSelectSubject(subject)}
                  className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="font-semibold text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors" title={subject.ten}>
                      {subject.ten}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {subject.soCau || 0} câu hỏi
                    </p>
                  </div>
                  <button 
                    onClick={(e) => togglePin(subject.id, e)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors flex-shrink-0"
                    title="Bỏ ghim môn học này"
                  >
                    <i className="fa-solid fa-thumbtack text-sm"></i>
                  </button>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2 px-1">
            <i className="fa-solid fa-book-open text-gray-400"></i> Tất cả môn học
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pb-20">
            {unpinnedSubjects.map(subject => (
              <Link
                to={`/monhoc/${subject.id}`}
                key={subject.id}
                onClick={() => onSelectSubject && onSelectSubject(subject)}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-between group"
              >
                <div className="flex-1 min-w-0 pr-3">
                  <h3 className="font-semibold text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors" title={subject.ten}>
                    {subject.ten}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {subject.soCau || 0} câu hỏi
                  </p>
                </div>
                <button 
                  onClick={(e) => togglePin(subject.id, e)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:bg-gray-100 hover:text-blue-500 transition-colors flex-shrink-0"
                  title="Ghim môn học này"
                >
                  <i className="fa-solid fa-thumbtack text-sm"></i>
                </button>
              </Link>
            ))}
            {subjects.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-10">
                Không có dữ liệu môn học.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectList;
