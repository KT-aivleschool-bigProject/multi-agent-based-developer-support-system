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
      // JWT 토큰에서 userId 추출하여 헤더에 추가
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        config.headers['X-User-Id'] = payload.userId;
      } catch (error) {
        console.error('토큰 파싱 오류:', error);
      }
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

  // 마이프로필 조회 (토큰 기반)
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // 사용자 정보 수정 (임시 비활성화)
  updateProfile: async (data: any) => {
    // TODO: 백엔드에서 프로필 수정 API 구현 필요
    throw new Error('프로필 수정 기능이 아직 구현되지 않았습니다.');
  },
};

// 게시판 관련 API
export const postAPI = {
  // 게시글 작성 시작 (init)
  startPostWriting: async () => {
    const response = await api.post('/posts/init');
    return response.data;
  },

  // 게시글 저장
  savePost: async (postId: number, data: { title: string; content: string }) => {
    const response = await api.patch(`/posts/${postId}/savepost`, data);
    return response.data;
  },

  // 게시글 수정 전 본인확인
  checkBeforeEditing: async (postId: number) => {
    const response = await api.get(`/posts/${postId}/checkBeforeEditing`);
    return response.data;
  },

  // 게시글 삭제
  deletePost: async (postId: number) => {
    const response = await api.delete(`/posts/${postId}/deletepost`);
    return response.data;
  },

  // 게시글 상세조회
  getPost: async (postId: number) => {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  },

  // 게시글 목록 조회
  getPostList: async (page: number = 0, size: number = 10, searchKeyword?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: 'postId,desc'
    });
    
    if (searchKeyword) {
      params.append('searchKeyword', searchKeyword);
    }
    
    const response = await api.get(`/posts/list?${params.toString()}`);
    return response.data;
  },
};

export default api; 