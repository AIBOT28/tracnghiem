import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CHUONG_API_URL, API_HEADERS } from '../constants';
import { ChapterAdmin } from '../types';

const AdminChapters: React.FC = () => {
  const [chapters, setChapters] = useState<ChapterAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [newChapterName, setNewChapterName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');

  const fetchChapters = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(CHUONG_API_URL, {
        headers: { ...API_HEADERS, 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setChapters(await response.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchChapters();
  }, [token, navigate]);

  const handleCreate = async () => {
    if (!newChapterName.trim()) return;
    try {
      const response = await fetch(CHUONG_API_URL, {
        method: 'POST',
        headers: { ...API_HEADERS, 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ tenChuong: newChapterName })
      });
      if (response.ok) {
        setNewChapterName('');
        fetchChapters();
      }
    } catch (error) { console.error(error); }
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;
    try {
      const response = await fetch(`${CHUONG_API_URL}/${id}`, {
        method: 'PUT',
        headers: { ...API_HEADERS, 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ maChuong: id, tenChuong: editName })
      });
      if (response.ok) {
        setEditingId(null);
        fetchChapters();
      }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chương này?')) return;
    try {
      const response = await fetch(`${CHUONG_API_URL}/${id}`, {
        method: 'DELETE',
        headers: { ...API_HEADERS, 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        fetchChapters();
      } else {
        alert(data.message || 'Không thể xóa');
      }
    } catch (error) { console.error(error); }
  };

  return (
    <div className="flex-grow p-6 bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/admin/dashboard')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-600 shadow-sm border border-gray-100 transition-all">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h2 className="text-2xl font-black text-gray-800">Quản lý Chương</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Thêm chương mới</h3>
          <div className="flex gap-3">
            <input 
              type="text" 
              value={newChapterName}
              onChange={(e) => setNewChapterName(e.target.value)}
              placeholder="Nhập tên chương (VD: Chương 1: Giới hạn)"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button 
              onClick={handleCreate}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i> Thêm
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
             <div className="flex justify-center py-10 text-gray-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>
          ) : (
            chapters.map(c => (
              <div key={c.maChuong} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group">
                <div className="flex-1 mr-4">
                  {editingId === c.maChuong ? (
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-gray-50 border border-blue-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                      onBlur={() => handleUpdate(c.maChuong)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(c.maChuong)}
                    />
                  ) : (
                    <h4 className="font-bold text-gray-800 text-lg">{c.tenChuong}</h4>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setEditingId(c.maChuong); setEditName(c.tenChuong); }}
                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button 
                    onClick={() => handleDelete(c.maChuong)}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChapters;
