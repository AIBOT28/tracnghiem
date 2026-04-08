
import React, { useState, useEffect, useCallback } from 'react';
import { 
  AdminMonHoc, AdminChuong, AdminCauHoi, 
  Subject, Chapter 
} from '../types';
import { 
  MONHOC_API_URL, CHUONG_API_URL, CAUHOI_API_URL, API_HEADERS 
} from '../constants';

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}

type AdminTab = 'monhoc' | 'chuong' | 'cauhoi';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ token, onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('monhoc');
  const [monHocs, setMonHocs] = useState<AdminMonHoc[]>([]);
  const [chuongs, setChuongs] = useState<AdminChuong[]>([]);
  const [cauHois, setCauHois] = useState<AdminCauHoi[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const authHeaders = {
    ...API_HEADERS,
    'Authorization': `Bearer ${token}`
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'monhoc') {
        const res = await fetch(MONHOC_API_URL, { headers: authHeaders });
        const data = await res.json();
        setMonHocs(Array.isArray(data) ? data : []);
      } else if (activeTab === 'chuong') {
        const res = await fetch(CHUONG_API_URL, { headers: authHeaders });
        const data = await res.json();
        setChuongs(Array.isArray(data) ? data : []);
      } else if (activeTab === 'cauhoi') {
        const res = await fetch(CAUHOI_API_URL, { headers: authHeaders });
        const data = await res.json();
        setCauHois(Array.isArray(data) ? data : []);
        
        // Also ensure we have MonHoc and Chuong for dropdowns
        if (monHocs.length === 0) {
            const mRes = await fetch(MONHOC_API_URL, { headers: authHeaders });
            setMonHocs(await mRes.json());
        }
        if (chuongs.length === 0) {
            const cRes = await fetch(CHUONG_API_URL, { headers: authHeaders });
            setChuongs(await cRes.json());
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mục này?")) return;
    
    let url = "";
    if (activeTab === 'monhoc') url = `${MONHOC_API_URL}/${id}`;
    else if (activeTab === 'chuong') url = `${CHUONG_API_URL}/${id}`;
    else if (activeTab === 'cauhoi') url = `${CAUHOI_API_URL}/${id}`;

    try {
      const res = await fetch(url, { method: 'DELETE', headers: authHeaders });
      const result = await res.json();
      if (res.ok) {
        alert("Xóa thành công!");
        fetchData();
      } else {
        alert(result.message || "Lỗi khi xóa");
      }
    } catch (error) {
      alert("Lỗi kết nối server");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const payload: any = {};
    formData.forEach((value, key) => {
      payload[key] = value;
    });

    // Convert numeric IDs
    if (payload.maMh) payload.maMh = parseInt(payload.maMh);
    if (payload.maChuong) payload.maChuong = parseInt(payload.maChuong);
    if (payload.maCauHoi) payload.maCauHoi = parseInt(payload.maCauHoi);
    if (payload.maMonHoc) payload.maMonHoc = parseInt(payload.maMonHoc);

    const isEdit = !!editingItem;
    let url = "";
    if (activeTab === 'monhoc') url = isEdit ? `${MONHOC_API_URL}/${editingItem.maMh}` : MONHOC_API_URL;
    else if (activeTab === 'chuong') url = isEdit ? `${CHUONG_API_URL}/${editingItem.maChuong}` : CHUONG_API_URL;
    else if (activeTab === 'cauhoi') url = isEdit ? `${CAUHOI_API_URL}/${editingItem.maCauHoi}` : CAUHOI_API_URL;

    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok) {
        alert("Lưu thành công!");
        setIsModalOpen(false);
        setEditingItem(null);
        fetchData();
      } else {
        alert(result.message || "Lỗi khi lưu");
      }
    } catch (error) {
      alert("Lỗi kết nối server");
    }
  };

  const filteredCauHoi = cauHois.filter(q => 
    q.noiDung.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.tenMonHoc?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Header Dashboard */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-gauge-high"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Bảng điều khiển Admin</h2>
            <p className="text-xs text-gray-500">Quản lý nội dung hệ thống</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-medium flex items-center gap-2"
        >
          <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="bg-white border-b border-gray-200 px-6 flex items-center gap-8 shrink-0">
        <button 
          onClick={() => setActiveTab('monhoc')}
          className={`py-4 font-bold text-sm border-b-2 transition-all ${activeTab === 'monhoc' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <i className="fa-solid fa-book-open mr-2"></i> Môn học
        </button>
        <button 
          onClick={() => setActiveTab('chuong')}
          className={`py-4 font-bold text-sm border-b-2 transition-all ${activeTab === 'chuong' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <i className="fa-solid fa-layer-group mr-2"></i> Chương
        </button>
        <button 
          onClick={() => setActiveTab('cauhoi')}
          className={`py-4 font-bold text-sm border-b-2 transition-all ${activeTab === 'cauhoi' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <i className="fa-solid fa-clipboard-question mr-2"></i> Câu hỏi
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-hidden flex flex-col p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
          {/* List Toolbar */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 shrink-0">
            <div className="flex-1 max-w-md relative text-gray-400 focus-within:text-blue-500">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>
              <input 
                type="text" 
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
              />
            </div>
            <button 
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i> Thêm mới
            </button>
          </div>

          {/* List Table */}
          <div className="flex-grow overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <i className="fa-solid fa-spinner fa-spin text-3xl text-blue-500 mb-2"></i>
                <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50 text-gray-600 text-[11px] uppercase tracking-wider font-bold z-10 border-b border-gray-100">
                  {activeTab === 'monhoc' && (
                    <tr>
                      <th className="px-6 py-3">Mã MH</th>
                      <th className="px-6 py-3">Tên môn học</th>
                      <th className="px-6 py-3 text-right">Thao tác</th>
                    </tr>
                  )}
                  {activeTab === 'chuong' && (
                    <tr>
                      <th className="px-6 py-3">Mã chương</th>
                      <th className="px-6 py-3">Tên chương</th>
                      <th className="px-6 py-3 text-right">Thao tác</th>
                    </tr>
                  )}
                  {activeTab === 'cauhoi' && (
                    <tr>
                      <th className="px-6 py-3 w-16">ID</th>
                      <th className="px-6 py-3">Nội dung</th>
                      <th className="px-6 py-3">Môn / Chương</th>
                      <th className="px-6 py-3 text-right">Thao tác</th>
                    </tr>
                  )}
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {activeTab === 'monhoc' && monHocs.map(m => (
                    <tr key={m.maMh} className="hover:bg-blue-50/30 transition">
                      <td className="px-6 py-4 font-mono text-gray-500">{m.maMh}</td>
                      <td className="px-6 py-4 font-bold text-gray-800">{m.tenMh}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setEditingItem(m); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"><i className="fa-solid fa-pen-to-square"></i></button>
                        <button onClick={() => handleDelete(m.maMh)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"><i className="fa-solid fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'chuong' && chuongs.map(c => (
                    <tr key={c.maChuong} className="hover:bg-blue-50/30 transition">
                      <td className="px-6 py-4 font-mono text-gray-500">{c.maChuong}</td>
                      <td className="px-6 py-4 font-bold text-gray-800">{c.tenChuong}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setEditingItem(c); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"><i className="fa-solid fa-pen-to-square"></i></button>
                        <button onClick={() => handleDelete(c.maChuong)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"><i className="fa-solid fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'cauhoi' && filteredCauHoi.map(q => (
                    <tr key={q.maCauHoi} className="hover:bg-blue-50/30 transition align-top">
                      <td className="px-6 py-4 font-mono text-gray-500 text-xs">{q.maCauHoi}</td>
                      <td className="px-6 py-4 max-w-md">
                        <div className="font-medium text-gray-800 line-clamp-2">{q.noiDung}</div>
                        <div className="flex gap-2 mt-1 text-[10px] uppercase font-bold text-green-600">
                          <span>A: {q.dapAnA}</span> • <span>B: {q.dapAnB}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 block w-fit mb-1">{q.tenMonHoc || 'No Subject'}</span>
                        <span className="text-[10px] text-gray-400 italic">Chương: {q.tenChuong || q.maChuong || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setEditingItem(q); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"><i className="fa-solid fa-pen-to-square"></i></button>
                        <button onClick={() => handleDelete(q.maCauHoi)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"><i className="fa-solid fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && (activeTab === 'monhoc' ? monHocs : activeTab === 'chuong' ? chuongs : filteredCauHoi).length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    <i className="fa-solid fa-inbox text-4xl mb-3 block"></i>
                    Chưa có dữ liệu nào.
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-800">
                {editingItem ? 'Chỉnh sửa' : 'Thêm mới'} 
                {activeTab === 'monhoc' ? ' Môn học' : activeTab === 'chuong' ? ' Chương' : ' Câu hỏi'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition"><i className="fa-solid fa-xmark text-xl"></i></button>
            </div>
            
            <form onSubmit={handleSave} className="overflow-y-auto p-6 space-y-4">
              {activeTab === 'monhoc' && (
                <>
                  <input type="hidden" name="maMh" defaultValue={editingItem?.maMh || 0} />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên môn học</label>
                    <input name="tenMh" defaultValue={editingItem?.tenMh || ''} className="w-full p-2 border rounded-lg" required />
                  </div>
                </>
              )}

              {activeTab === 'chuong' && (
                <>
                  <input type="hidden" name="maChuong" defaultValue={editingItem?.maChuong || 0} />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên chương</label>
                    <input name="tenChuong" defaultValue={editingItem?.tenChuong || ''} className="w-full p-2 border rounded-lg" required />
                  </div>
                </>
              )}

              {activeTab === 'cauhoi' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="hidden" name="maCauHoi" defaultValue={editingItem?.maCauHoi || 0} />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung câu hỏi</label>
                    <textarea name="noiDung" defaultValue={editingItem?.noiDung || ''} className="w-full p-2 border rounded-lg h-24" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đáp án A</label>
                    <input name="dapAnA" defaultValue={editingItem?.dapAnA || ''} className="w-full p-2 border rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đáp án B</label>
                    <input name="dapAnB" defaultValue={editingItem?.dapAnB || ''} className="w-full p-2 border rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đáp án C</label>
                    <input name="dapAnC" defaultValue={editingItem?.dapAnC || ''} className="w-full p-2 border rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đáp án D</label>
                    <input name="dapAnD" defaultValue={editingItem?.dapAnD || ''} className="w-full p-2 border rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đáp án đúng (A/B/C/D)</label>
                    <select name="dapAnDung" defaultValue={editingItem?.dapAnDung || 'A'} className="w-full p-2 border rounded-lg bg-white" required>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
                    <select name="maMonHoc" defaultValue={editingItem?.maMonHoc || monHocs[0]?.maMh} className="w-full p-2 border rounded-lg bg-white">
                      {monHocs.map(m => <option key={m.maMh} value={m.maMh}>{m.tenMh}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chương</label>
                    <select name="maChuong" defaultValue={editingItem?.maChuong || chuongs[0]?.maChuong} className="w-full p-2 border rounded-lg bg-white">
                      {chuongs.map(c => <option key={c.maChuong} value={c.maChuong}>{c.tenChuong}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all">Hủy</button>
                <button type="submit" className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
