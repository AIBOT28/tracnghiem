
import React, { useEffect, useState } from 'react';
import { Subject } from '../types';
import { API_BASE_URL, CACHE_KEY_SUBJECTS, CACHE_TIME,API_HEADERS  } from '../constants';

interface SubjectListProps {
  onSelectSubject: (subject: Subject) => void;
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
        <div className="text-center mb-6 mt-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Chọn môn học</h2>
          <p className="text-red-500 text-sm">
            Lưu ý: Dữ liệu cập nhật sau 20-30 phút. Nếu chưa thấy hãy thử tab ẩn danh.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-20">
          {subjects.map(subject => (
            <div 
              key={subject.id}
              onClick={() => onSelectSubject(subject)}
              className="bg-white p-5 rounded-xl border border-gray-200 cursor-pointer shadow-sm hover:border-blue-500 hover:shadow-md transition relative overflow-hidden group"
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
            </div>
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
