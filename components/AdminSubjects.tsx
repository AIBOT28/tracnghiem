import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MONHOC_API_URL, API_HEADERS } from '../constants';
import { Subject } from '../types';

const AdminSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');

  const fetchSubjects = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(MONHOC_API_URL, {
        headers: { ...API_HEADERS, 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setSubjects(await response.json());
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
    fetchSubjects();
  }, [token, navigate]);

  const handleCreate = async () => {
    if (!newSubjectName.trim()) return;
    try {
      const response = await fetch(MONHOC_API_URL, {
        method: 'POST',
        headers: { ...API_HEADERS, 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ tenMh: newSubjectName })
      });
      if (response.ok) {
        setNewSubjectName('');
        fetchSubjects();
      }
    } catch (error) { console.error(error); }
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;
    try {
      const response = await fetch(`${MONHOC_API_URL}/${id}`, {
        method: 'PUT',
        headers: { ...API_HEADERS, 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ maMh: id, tenMh: editName })
      });
      if (response.ok) {
        setEditingId(null);
        fetchSubjects();
      }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa môn học này sẽ ảnh hưởng đến các câu hỏi liên quan. Bạn chắc chắn?')) return;
    try {
      const response = await fetch(`${MONHOC_API_URL}/${id}`, {
        method: 'DELETE',
        headers: { ...API_HEADERS, 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        fetchSubjects();
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
          <h2 className="text-2xl font-black text-gray-800">Quản lý Môn học</h2>
        </div>

        {/* Create Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Thêm môn học mới</h3>
          <div className="flex gap-3">
            <input 
              type="text" 
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              placeholder="Nhập tên môn học (VD: Giải tích 1)"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button 
              onClick={handleCreate}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i> Thêm
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
             <div className="flex justify-center py-10 text-gray-400"><i className="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>
          ) : (
            subjects.map(s => (
              <div key={s.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group">
                <div className="flex-1 mr-4">
                  {editingId === s.id ? (
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-gray-50 border border-blue-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                      onBlur={() => handleUpdate(s.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(s.id)}
                    />
                  ) : (
                    <h4 className="font-bold text-gray-800 text-lg">{s.ten}</h4>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setEditingId(s.id); setEditName(s.ten); }}
                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button 
                    onClick={() => handleDelete(s.id)}
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

export default AdminSubjects;
