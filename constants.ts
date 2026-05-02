
export const API_BASE_URL = '/nldk/Exam';
export const AUTH_API_URL = '/api/Auth'; // URL của backend API cho auth
export const MONHOC_API_URL = '/api/MonHocs';
export const CHUONG_API_URL = '/api/Chuongs';
export const CAUHOI_API_URL = '/api/CauHois';
export const WS_URL = 'https://tracnghiemapi.runasp.net/visitorHub';
export const SESSION_KEY = 'exam_ongoing_session';
export const CACHE_KEY_SUBJECTS = 'danh_sach_mon_hoc';
export const CACHE_TIME = 1000 * 60 * 60; // 20 minutes
export const DATE_UPDATE = 'Cập nhật năm 2026 - nguồn trắc nghiệm từ LHP';

// Cấu hình Header cho các yêu cầu API
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'version': '10' // Bạn có thể thay đổi key này theo yêu cầu của Backend
};
