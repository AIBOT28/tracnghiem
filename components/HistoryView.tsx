
import React, { useState, useEffect } from 'react';
import { Subject, HistoryItem } from '../types';

interface HistoryViewProps {
  subject: Subject;
  onViewDetail: (item: HistoryItem) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ subject, onViewDetail }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const historyKey = `history_sub_${subject.id}`;

  useEffect(() => {
    const data = localStorage.getItem(historyKey);
    if (data) setHistory(JSON.parse(data));
  }, [historyKey]);

  const clearHistory = () => {
    if (window.confirm(`Xóa toàn bộ lịch sử môn "${subject.ten}"?`)) {
      localStorage.removeItem(historyKey);
      setHistory([]);
    }
  };

  return (
    <div className="flex-grow overflow-y-auto p-4 bg-gray-50 fade-in">
      <div className="max-w-4xl mx-auto mt-4">
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-300">
          <h3 className="text-xl font-bold text-gray-800">
            Lịch sử: <span className="text-blue-600">{subject.ten}</span>
          </h3>
          
          {history.length > 0 && (
            <button 
              onClick={clearHistory}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-md text-sm font-bold transition flex items-center gap-1"
            >
              <i className="fa-solid fa-trash-can"></i> Xóa tất cả
            </button>
          )}
        </div>

        <div className="space-y-3 pb-20">
          {history.map((item, index) => (
            <div 
              key={index} 
              onClick={() => onViewDetail(item)}
              className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition animate-fade-in"
            >
              <div>
                <div className="font-bold text-gray-800">
                  {item.mode} <span className="text-xs font-normal text-gray-500">(Xem chi tiết)</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">{item.date}</div>
                <div className="text-sm mt-1">
                  Đúng <b className="text-blue-600">{item.correct}/{item.total}</b> câu
                </div>
              </div>
              <div className={`${Number(item.score) >= 5 ? 'bg-green-500' : 'bg-red-500'} text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-md`}>
                {item.score}
              </div>
            </div>
          ))}

          {history.length === 0 && (
            <div className="text-center py-10">
              <i className="fa-solid fa-box-open text-4xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">Chưa có bài làm nào.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
