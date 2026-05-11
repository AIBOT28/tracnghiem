import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Subject } from '../types';
import { API_BASE_URL, CACHE_KEY_SUBJECTS, CACHE_TIME, API_HEADERS } from '../constants';

interface SubjectListProps {
  onSelectSubject?: (subject: Subject) => void;
}

const SubjectList: React.FC<SubjectListProps> = ({ onSelectSubject }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

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
        const response = await fetch(`${API_BASE_URL}/subjects`, { headers: API_HEADERS });
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
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 mt-6">
          <div className="flex flex-col items-center text-center mb-6">
            <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
              Chọn môn học
            </h2>
            <div className="h-1.5 w-16 bg-blue-500 rounded-full mb-4 opacity-20"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto px-2">
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition-all duration-300">
              <div className="bg-amber-100 p-3 rounded-xl text-amber-600 flex-shrink-0">
                <i className="fa-solid fa-clock-rotate-left text-xl"></i>
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-sm mb-0.5">Lưu ý cập nhật</h4>
                <p className="text-amber-800 text-xs leading-relaxed">
                  Dữ liệu cập nhật sau <span className="font-bold text-amber-950 underline decoration-amber-300">20-30 phút</span>. Nếu chưa thấy nội dung mới, hãy thử sử dụng <span className="font-semibold text-amber-900">tab ẩn danh</span>.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4 items-start shadow-sm hover:shadow-md transition-all duration-300">
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600 flex-shrink-0">
                <i className="fa-solid fa-bolt text-xl"></i>
              </div>
              <div>
                <h4 className="font-bold text-blue-900 text-sm mb-0.5">Trải nghiệm mượt mà</h4>
                <p className="text-blue-800 text-xs leading-relaxed">
                  Website <span className="font-bold text-blue-950 underline decoration-blue-300">không giới hạn</span> lượt làm bài. Hệ thống luôn duy trì trạng thái ổn định ngay cả khi truy cập cao.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-20">
          {subjects.map(subject => (
            <Link 
              to={`/monhoc/${subject.id}`}
              key={subject.id}
              onClick={() => onSelectSubject && onSelectSubject(subject)}
              className="bg-white p-5 rounded-xl border border-gray-200 cursor-pointer shadow-sm hover:border-blue-500 hover:shadow-md transition relative overflow-hidden group block"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                  <i className="fa-solid fa-book text-2xl"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-base truncate">{subject.ten}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                      <i className="fa-solid fa-layer-group"></i> {subject.soCau || 0} câu
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Nhấp để ôn tập</p>
                </div>
              </div>
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
  );
};

export default SubjectList;
