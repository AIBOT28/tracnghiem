const BASE_URL = 'https://backend.nguyenledangkhoa146205.workers.dev';

export const API_BASE_URL = `${BASE_URL}/Exam`;
export const AUTH_API_URL = `${BASE_URL}/api/Auth`; // URL của backend API cho auth
export const MONHOC_API_URL = `${BASE_URL}/api/MonHocs`;
export const CHUONG_API_URL = `${BASE_URL}/api/Chuongs`;
export const CAUHOI_API_URL = `${BASE_URL}/api/CauHois`;
export const WS_URL = `${BASE_URL}/visitorHub`;
export const SESSION_KEY = 'exam_ongoing_session';
export const CACHE_KEY_SUBJECTS = 'danh_sach_mon_hoc';
export const CACHE_KEY_CHAPTERS = 'danh_sach_chuong_';
export const CACHE_KEY_SYLLABUS = 'de_cuong_';
export const CACHE_TIME = 1000 * 60 * 60; // 1 hour
export const DATE_UPDATE = 'Cập nhật năm 2026 - nguồn trắc nghiệm từ LHP';

// Cấu hình Header cho các yêu cầu API
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'version': '10' // Bạn có thể thay đổi key này theo yêu cầu của Backend
};
