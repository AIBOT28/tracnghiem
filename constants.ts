
export const API_BASE_URL = '/nldk/Exam';
export const SESSION_KEY = 'exam_ongoing_session';
export const CACHE_KEY_SUBJECTS = 'danh_sach_mon_hoc';
export const CACHE_TIME = 1000 * 60 * 60; // 20 minutes

// Cấu hình Header cho các yêu cầu API
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'version': '10' // Bạn có thể thay đổi key này theo yêu cầu của Backend
};
