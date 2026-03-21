import React, { useState, useEffect } from 'react';
import { Subject } from '../types';
import { API_BASE_URL, API_HEADERS, CACHE_KEY_SUBJECTS } from '../constants';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'settings'>('overview');

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/subjects`, { headers: API_HEADERS });
        if (response.ok) {
          const data = await response.json();
          setSubjects(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const handleClearCache = () => {
    localStorage.removeItem(CACHE_KEY_SUBJECTS);
    alert('Đã xóa bộ nhớ đệm môn học thành công!');
  };

  return (
    <div className="flex-grow flex flex-col bg-gray-50 fade-in h-full overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <i className="fa-solid fa-gauge-high text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-xs text-gray-500">Quản trị hệ thống trắc nghiệm</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 border border-red-100"
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          <span className="hidden sm:inline">Đăng xuất</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 hidden md:flex">
          <div className="p-4 flex-1">
            <div className="space-y-1">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <i className="fa-solid fa-chart-pie w-5 text-center"></i> Tổng quan
              </button>
              <button 
                onClick={() => setActiveTab('subjects')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'subjects' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <i className="fa-solid fa-book w-5 text-center"></i> Quản lý môn học
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <i className="fa-solid fa-gear w-5 text-center"></i> Cài đặt hệ thống
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden flex border-b border-gray-200 bg-white shrink-0">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
          >
            <i className="fa-solid fa-chart-pie mr-1"></i> Tổng quan
          </button>
          <button 
            onClick={() => setActiveTab('subjects')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition ${activeTab === 'subjects' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
          >
            <i className="fa-solid fa-book mr-1"></i> Môn học
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition ${activeTab === 'settings' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
          >
            <i className="fa-solid fa-gear mr-1"></i> Cài đặt
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6 fade-in">
              <h2 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl shrink-0">
                    <i className="fa-solid fa-book-open"></i>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Tổng số môn học</p>
                    <p className="text-3xl font-bold text-gray-800">{loading ? '...' : subjects.length}</p>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl shrink-0">
                    <i className="fa-solid fa-users"></i>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Trạng thái API</p>
                    <p className="text-xl font-bold text-green-600 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span> Hoạt động
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Hoạt động gần đây</h3>
                <div className="text-center py-10 text-gray-500">
                  <i className="fa-solid fa-chart-line text-4xl mb-3 text-gray-300"></i>
                  <p>Chưa có dữ liệu hoạt động chi tiết</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subjects' && (
            <div className="space-y-6 fade-in">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Danh sách môn học</h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 text-sm shadow-sm">
                  <i className="fa-solid fa-plus"></i> Thêm môn mới
                </button>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                  <div className="p-10 text-center text-gray-500">
                    <i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-500 mb-3"></i>
                    <p>Đang tải dữ liệu...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                          <th className="p-4 font-semibold">ID</th>
                          <th className="p-4 font-semibold">Tên môn học</th>
                          <th className="p-4 font-semibold text-center">Số câu hỏi</th>
                          <th className="p-4 font-semibold text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {subjects.map((subject) => (
                          <tr key={subject.id} className="hover:bg-gray-50 transition">
                            <td className="p-4 text-gray-500 font-medium">#{subject.id}</td>
                            <td className="p-4 font-bold text-gray-800">{subject.ten}</td>
                            <td className="p-4 text-center">
                              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">
                                {subject.soCau || 0} câu
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition flex items-center justify-center">
                                  <i className="fa-solid fa-pen"></i>
                                </button>
                                <button className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 transition flex items-center justify-center">
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {subjects.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-500">
                              Không có dữ liệu môn học
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 fade-in max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-800">Cài đặt hệ thống</h2>
              
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 border-b pb-2">Quản lý bộ nhớ đệm (Cache)</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Hệ thống lưu trữ danh sách môn học trên trình duyệt để tăng tốc độ tải. Bạn có thể xóa bộ nhớ đệm để ép tải lại dữ liệu mới nhất từ máy chủ.
                  </p>
                  <button 
                    onClick={handleClearCache}
                    className="bg-orange-100 text-orange-700 hover:bg-orange-200 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 text-sm"
                  >
                    <i className="fa-solid fa-broom"></i> Xóa bộ nhớ đệm môn học
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 border-b pb-2">Thông tin API</h3>
                  <div className="space-y-3 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Base URL</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={API_BASE_URL} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
