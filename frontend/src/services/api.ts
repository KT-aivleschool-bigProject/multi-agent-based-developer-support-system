import axios from 'axios';

// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088'; // Gateway 포트

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 토큰 만료 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await api.post('/auth/reissue', {
            refreshToken: refreshToken
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // 리프레시 토큰도 만료된 경우 로그아웃
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// 인증 관련 API
export const authAPI = {
  // 회원가입
  signup: async (data: {
    email: string;
    password: string;
    name: string;
    position: string;
  }) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  // 로그인
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // 로그아웃
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // 토큰 재발급
  reissue: async (data: { refreshToken: string }) => {
    const response = await api.post('/auth/reissue', data);
    return response.data;
  },
};

// 사용자 관련 API
export const userAPI = {
  // 사용자 정보 조회 (기존 UserController API 사용)
  getUserById: async (userId: number) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // 사용자 정보 조회
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // 사용자 정보 수정
  updateProfile: async (data: any) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
};

export default api; 