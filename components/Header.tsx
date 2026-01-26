
import React from 'react';

interface HeaderProps {
  title: string;
  showBack: boolean;
  onBack: () => void;
  onShowHistory: () => void;
  disableHistory: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showBack, onBack, onShowHistory, disableHistory }) => {
  return (
    <div className="bg-blue-600 text-white px-4 flex justify-between items-center shadow-md z-20 shrink-0 h-14">
      <button 
        onClick={onBack}
        className={`${!showBack ? 'invisible' : 'visible'} hover:bg-white/20 text-white px-3 py-1.5 rounded transition text-sm font-medium flex items-center gap-1`}
      >
        <i className="fa-solid fa-chevron-left"></i> 
        <span className="hidden sm:inline">Quay lại</span>
      </button>

      <span className="font-bold text-lg tracking-wide truncate max-w-[200px]">
        {title}
      </span>

      <div className="w-20 flex justify-end">
        {!disableHistory && (
          <button 
            onClick={onShowHistory}
            className="text-white hover:bg-white/20 p-2 rounded-full transition"
            title="Lịch sử"
          >
            <i className="fa-solid fa-clock-rotate-left"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
