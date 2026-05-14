import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MONHOC_API_URL, API_HEADERS, smartFetch } from '../constants';
import { AdminStats } from '../types';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await smartFetch(`${MONHOC_API_URL}/stats`, {
          headers: {
            ...API_HEADERS,
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.status === 401) {
          localStorage.removeItem('admin_token');
          navigate('/admin/login');
          return;
        }
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  if (loading) return (
    <div className="flex-grow flex items-center justify-center">
      <i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-600"></i>
    </div>
  );

  return (
    <div className="flex-grow p-6 bg-gray-50 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Hệ thống quản trị</h1>
            <p className="text-gray-500 font-medium">Xin chào, Admin!</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-white text-red-600 border border-red-100 rounded-xl font-bold shadow-sm hover:bg-red-50 transition-all flex items-center gap-2"
          >
            <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              <i className="fa-solid fa-book"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Môn học</p>
              <h3 className="text-3xl font-black text-gray-800">{stats?.totalSubjects || 0}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              <i className="fa-solid fa-layer-group"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Chương</p>
              <h3 className="text-3xl font-black text-gray-800">{stats?.totalChapters || 0}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
              <i className="fa-solid fa-circle-question"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Câu hỏi</p>
              <h3 className="text-3xl font-black text-gray-800">{stats?.totalQuestions || 0}</h3>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
          Danh mục quản lý
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/subjects" className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-300">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-folder-open"></i>
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">Quản lý Môn học</h4>
            <p className="text-gray-500 text-sm leading-relaxed">Thêm mới, chỉnh sửa tên hoặc xóa các môn học hiện có.</p>
          </Link>

          <Link to="/admin/chapters" className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-list-check"></i>
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">Quản lý Chương</h4>
            <p className="text-gray-500 text-sm leading-relaxed">Quản lý danh sách các chương học cho từng môn học.</p>
          </Link>

          <Link to="/admin/questions" className="group bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-50/50 transition-all duration-300">
            <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-file-pen"></i>
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">Quản lý Câu hỏi</h4>
            <p className="text-gray-500 text-sm leading-relaxed">Kho dữ liệu câu hỏi trắc nghiệm, hỗ trợ tìm kiếm và phân trang.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
