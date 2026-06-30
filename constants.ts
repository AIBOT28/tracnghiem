
export const PRIMARY_BASE_URL = 'https://backend.nguyenledangkhoa-it.workers.dev';
export const SECONDARY_BASE_URL = 'https://backend.nguyenledangkhoa146205.workers.dev';

export const getBaseUrl = () => {
  return localStorage.getItem('use_fallback_backend') === 'true'
    ? SECONDARY_BASE_URL
    : PRIMARY_BASE_URL;
};

// Vẫn giữ là string để không làm hỏng các code hiện tại
// Tuy nhiên chúng ta sẽ khởi tạo dựa trên trạng thái hiện tại trong localStorage
const currentBase = getBaseUrl();

export const API_BASE_URL = `${currentBase}/api/Exam`;
export const AUTH_API_URL = `${currentBase}/api/Auth`;
export const MONHOC_API_URL = `${currentBase}/api/MonHocs`;
export const CHUONG_API_URL = `${currentBase}/api/Chuongs`;
export const CAUHOI_API_URL = `${currentBase}/api/CauHois`;


export const SESSION_KEY = 'exam_ongoing_session';
export const CACHE_KEY_SUBJECTS = 'danh_sach_mon_hoc';
export const CACHE_KEY_CHAPTERS = 'danh_sach_chuong_';
export const CACHE_KEY_SYLLABUS = 'de_cuong_';
export const CACHE_TIME = 1000 * 60 * 1200; // 20 hours
export const DATE_UPDATE = 'Cập nhật năm 2026 - nguồn trắc nghiệm từ LHP';

export const API_HEADERS = {
  'Content-Type': 'application/json',
  'version': '10'
};

/**
 * Custom fetch wrapper that automatically switches to fallback backend on 429
 */
export const smartFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  try {
    const response = await fetch(url, options);

    if (response.status === 429) {
      const isUsingPrimary = url.includes(PRIMARY_BASE_URL);
      if (isUsingPrimary) {
        console.warn("Primary backend rate limited. Switching to fallback and retrying...");
        localStorage.setItem('use_fallback_backend', 'true');
        const fallbackUrl = url.replace(PRIMARY_BASE_URL, SECONDARY_BASE_URL);
        return await fetch(fallbackUrl, options);
      }
    }

    return response;
  } catch (error) {
    const isUsingPrimary = url.includes(PRIMARY_BASE_URL);
    if (isUsingPrimary) {
      console.warn("Primary backend error. Trying fallback...", error);
      localStorage.setItem('use_fallback_backend', 'true');
      const fallbackUrl = url.replace(PRIMARY_BASE_URL, SECONDARY_BASE_URL);
      try {
        return await fetch(fallbackUrl, options);
      } catch (retryError) {
        throw retryError;
      }
    }
    throw error;
  }
};
