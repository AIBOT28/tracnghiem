import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CAUHOI_API_URL, MONHOC_API_URL, CHUONG_API_URL, API_HEADERS } from '../constants';
import { QuestionAdmin, Subject, ChapterAdmin } from '../types';

const AdminQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionAdmin[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<ChapterAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  
  // Filters
  const [selectedSubject, setSelectedSubject] = useState<number | ''>('');
  const [selectedChapter, setSelectedChapter] = useState<number | ''>('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [form, setForm] = useState({
    noiDung: '',
    dapAnA: '',
    dapAnB: '',
    dapAnC: '',
    dapAnD: '',
    dapAnDung: 'A',
    maMonHoc: '' as number | '',
    maChuong: '' as number | ''
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');

  const fetchQuestions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      let url = `${CAUHOI_API_URL}?page=${page}&pageSize=${pageSize}`;
      if (selectedSubject) url += `&subjectId=${selectedSubject}`;
      if (selectedChapter) url += `&chapterId=${selectedChapter}`;

      const response = await fetch(url, {
        headers: { ...API_HEADERS, 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.items);
        setTotal(data.total);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token, page, pageSize, selectedSubject, selectedChapter]);

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchInitialData = async () => {
      try {
        const subRes = await fetch(MONHOC_API_URL, { 
          headers: { ...API_HEADERS, 'Authorization': `Bearer ${token}` } 
        });
        if (subRes.ok) setSubjects(await subRes.json());
      } catch (error) { console.error(error); }
    };

    fetchInitialData();
  }, [token, navigate]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // For modal chapter dropdown
  const [modalChapters, setModalChapters] = useState<ChapterAdmin[]>([]);
  useEffect(() => {
    const fetchChapters = async () => {
      if (form.maMonHoc) {
        try {
          const res = await fetch(`${CHUONG_API_URL}/by-subject/${form.maMonHoc}`, {
            headers: { ...API_HEADERS, 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) setModalChapters(await res.json());
        } catch (error) { console.error(error); }
      } else {
        setModalChapters([]);
      }
    };
    fetchChapters();
  }, [form.maMonHoc, token]);

  // For filter chapter dropdown
  useEffect(() => {
    const fetchChapters = async () => {
      if (selectedSubject) {
        try {
          const res = await fetch(`${CHUONG_API_URL}/by-subject/${selectedSubject}`, {
            headers: { ...API_HEADERS, 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) setChapters(await res.json());
        } catch (error) { console.error(error); }
      } else {
        setChapters([]);
        setSelectedChapter('');
      }
    };
    fetchChapters();
  }, [selectedSubject, token]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) return;
    try {
      const response = await fetch(`${CAUHOI_API_URL}/${id}`, {
        method: 'DELETE',
        headers: { ...API_HEADERS, 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchQuestions();
      }
    } catch (error) { console.error(error); }
  };

  const openAddModal = () => {
    setIsEdit(false);
    setForm({
      noiDung: '',
      dapAnA: '',
      dapAnB: '',
      dapAnC: '',
      dapAnD: '',
      dapAnDung: 'A',
      maMonHoc: selectedSubject || '',
      maChuong: selectedChapter || ''
    });
    setShowModal(true);
  };

  const openEditModal = (q: QuestionAdmin) => {
    setIsEdit(true);
    setCurrentId(q.maCauHoi);
    setForm({
      noiDung: q.noiDung,
      dapAnA: q.dapAnA,
      dapAnB: q.dapAnB,
      dapAnC: q.dapAnC,
      dapAnD: q.dapAnD,
      dapAnDung: q.dapAnDung,
      maMonHoc: q.maMonHoc || '',
      maChuong: q.maChuong || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      maCauHoi: currentId
    };

    try {
      const url = isEdit ? `${CAUHOI_API_URL}/${currentId}` : CAUHOI_API_URL;
      const method = isEdit ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { ...API_HEADERS, 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowModal(false);
        fetchQuestions();
      }
    } catch (error) { console.error(error); }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex-grow flex flex-col bg-gray-50 overflow-hidden relative">
      {/* Modal */}
      {showModal && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-full animate-scale">
            <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-800">{isEdit ? 'Cập nhật câu hỏi' : 'Thêm câu hỏi mới'}</h3>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Môn học</label>
                  <select 
                    value={form.maMonHoc} 
                    onChange={(e) => setForm({...form, maMonHoc: Number(e.target.value)})}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="">Chọn môn học</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.ten}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Chương</label>
                  <select 
                    value={form.maChuong} 
                    onChange={(e) => setForm({...form, maChuong: Number(e.target.value)})}
                    disabled={!form.maMonHoc}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                  >
                    <option value="">Chọn chương</option>
                    {modalChapters.map(c => <option key={c.maChuong} value={c.maChuong}>{c.tenChuong}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nội dung câu hỏi</label>
                <textarea 
                  value={form.noiDung}
                  onChange={(e) => setForm({...form, noiDung: e.target.value})}
                  required
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  placeholder="Nhập nội dung câu hỏi..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Đáp án A</label>
                  <input type="text" value={form.dapAnA} onChange={(e) => setForm({...form, dapAnA: e.target.value})} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Đáp án B</label>
                  <input type="text" value={form.dapAnB} onChange={(e) => setForm({...form, dapAnB: e.target.value})} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Đáp án C</label>
                  <input type="text" value={form.dapAnC} onChange={(e) => setForm({...form, dapAnC: e.target.value})} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Đáp án D</label>
                  <input type="text" value={form.dapAnD} onChange={(e) => setForm({...form, dapAnD: e.target.value})} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Đáp án đúng</label>
                <div className="flex gap-4">
                  {['A', 'B', 'C', 'D'].map(opt => (
                    <label key={opt} className="flex-1">
                      <input 
                        type="radio" 
                        name="dapAnDung" 
                        value={opt} 
                        checked={form.dapAnDung === opt} 
                        onChange={(e) => setForm({...form, dapAnDung: e.target.value})}
                        className="hidden"
                      />
                      <div className={`text-center py-3 rounded-xl border-2 cursor-pointer font-bold transition-all ${form.dapAnDung === opt ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-blue-200'}`}>
                        {opt}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-colors">Hủy</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <button onClick={() => navigate('/admin/dashboard')} className="hover:text-blue-600 transition-colors">
              <i className="fa-solid fa-arrow-left text-sm"></i>
            </button>
            Quản lý Câu hỏi
          </h2>
          <p className="text-xs text-gray-500 font-medium">Tổng số: {total} câu hỏi</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={selectedSubject} 
            onChange={(e) => { setSelectedSubject(e.target.value ? Number(e.target.value) : ''); setPage(1); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50"
          >
            <option value="">Tất cả Môn học</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.ten}</option>)}
          </select>

          <select 
            value={selectedChapter} 
            onChange={(e) => { setSelectedChapter(e.target.value ? Number(e.target.value) : ''); setPage(1); }}
            disabled={!selectedSubject}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 disabled:opacity-50"
          >
            <option value="">Tất cả Chương</option>
            {chapters.map(c => <option key={c.maChuong} value={c.maChuong}>{c.tenChuong}</option>)}
          </select>

          <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2">
            <i className="fa-solid fa-plus"></i> Thêm mới
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <i className="fa-solid fa-circle-notch fa-spin text-3xl text-blue-500 mb-4"></i>
              <p className="text-gray-400 font-medium">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <>
              {questions.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                  <p className="text-gray-400">Không tìm thấy câu hỏi nào.</p>
                </div>
              ) : (
                questions.map((q) => (
                  <div key={q.maCauHoi} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600 uppercase">#{q.maCauHoi}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase">{q.tenMonHoc}</span>
                          {q.tenChuong && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 uppercase">{q.tenChuong}</span>}
                        </div>
                        <h4 className="font-bold text-gray-800 leading-relaxed">{q.noiDung}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(q)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onClick={() => handleDelete(q.maCauHoi)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className={`p-2 rounded-lg border ${q.dapAnDung === 'A' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                        <span className="font-bold mr-2">A.</span> {q.dapAnA}
                      </div>
                      <div className={`p-2 rounded-lg border ${q.dapAnDung === 'B' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                        <span className="font-bold mr-2">B.</span> {q.dapAnB}
                      </div>
                      <div className={`p-2 rounded-lg border ${q.dapAnDung === 'C' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                        <span className="font-bold mr-2">C.</span> {q.dapAnC}
                      </div>
                      <div className={`p-2 rounded-lg border ${q.dapAnDung === 'D' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                        <span className="font-bold mr-2">D.</span> {q.dapAnD}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-center gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-gray-800 px-4 py-2 bg-gray-100 rounded-xl">
              Trang {page} / {totalPages}
            </span>
          </div>

          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminQuestions;
