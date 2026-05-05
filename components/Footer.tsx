
import React from 'react';

interface FooterProps {
  totalVisitorCount?: string;
}

const Footer: React.FC<FooterProps> = ({ totalVisitorCount }) => {
  return (
    <div className="mt-auto py-2 text-center border-t border-gray-200 bg-white shrink-0">
      <p className="text-sm text-gray-500">
        Phát triển bởi
        <a href="#" className="mx-1 font-bold text-blue-600 hover:text-blue-800 transition-colors">NLDK</a>
        -
        <a href="https://forms.gle/RVvaQx8zUp3XxT8o6" target="_blank" rel="noopener noreferrer" className="mx-1 font-bold text-blue-600 hover:text-blue-800 transition-colors">Báo lỗi hoặc đáp án sai</a>
      </p>
      <p className="text-xs text-gray-400 mt-1 cursor-default select-none">
        ©10/1/2026 Trắc nghiệm Online.
      </p>
      <div className="mt-1 text-xs text-gray-400 flex justify-center items-center gap-3">

        {totalVisitorCount && (
          <span>| <i className="fa-solid fa-eye ml-1"></i> Tổng lượt truy cập: <span className="font-bold text-gray-500">{totalVisitorCount}</span></span>
        )}
      </div>
      <script id="_wauabc123">var _wau = _wau || []; _wau.push(["small", "u67wa694cy", "abc12345"]);</script>
      <script async src="//waust.at/s.js"></script>
    </div>
  );
};

export default Footer;
