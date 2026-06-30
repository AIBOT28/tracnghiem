import React, { useState, useEffect } from 'react';

const YOUTUBE_SUBSCRIBE_LAST_SHOWN_KEY = 'yt_sub_last_shown';
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

const YoutubeSubscribeDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkAndShowDialog = () => {
      const lastShown = localStorage.getItem(YOUTUBE_SUBSCRIBE_LAST_SHOWN_KEY);
      const now = Date.now();

      if (!lastShown || now - parseInt(lastShown, 10) > THREE_HOURS_MS) {
        setIsOpen(true);
      }
    };

    // Delay slightly to ensure UI is ready
    const timer = setTimeout(checkAndShowDialog, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = () => {
    localStorage.setItem(YOUTUBE_SUBSCRIBE_LAST_SHOWN_KEY, Date.now().toString());
    window.open('https://youtube.com/@nguyenledangkhoaa?sub_confirmation=1', '_blank');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <i className="fa-brands fa-youtube text-red-600 text-3xl"></i>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Ủng hộ Admin nhé!</h2>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          Hãy nhấn nút đăng ký kênh YouTube để giúp Admin có thêm động lực duy trì và phát triển website nhé. Cảm ơn bạn rất nhiều!
        </p>
        <button
          onClick={handleSubscribe}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
        >
          <i className="fa-brands fa-youtube"></i>
          Đăng ký ngay
        </button>
      </div>
    </div>
  );
};

export default YoutubeSubscribeDialog;
