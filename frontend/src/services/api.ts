import axios from 'axios';

// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Gateway 포트

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
    const user = localStorage.getItem('user');
    const url = config.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/signup') || url.includes('/auth/reissue') || url.includes('/auth/guest');
    
    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // X-User-Id 헤더 추가 (프로젝트 관리 API용)
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.userId) {
          config.headers['X-User-Id'] = userData.userId;
        }
      } catch (e) {
        console.warn('Failed to parse user data:', e);
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
      const accessToken = localStorage.getItem('accessToken'); // 만료된 accessToken도 가져오기
      
      if (refreshToken) {
        try {
          const response = await api.post('/auth/reissue', {
            refreshToken: refreshToken,
            accessToken: accessToken  // 만료된 accessToken도 함께 전송
          });
          
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // 리프레시 토큰도 만료된 경우 로그아웃
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/'; // 메인화면으로 리다이렉트
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
    recaptchaToken: string | null;

  }) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  // 로그인
  login: async (data: { email: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        code: error?.response?.data?.errorCode || null,
        message: error?.response?.data?.message || error.message,
      };
    }
  },

  // 로그아웃
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // 토큰 재발급
  reissue: async (data: { refreshToken: string; accessToken?: string }) => {
    const response = await api.post('/auth/reissue', data);
    return response.data;
  },

  // 게스트 로그인
  guestLogin: async () => {
    const response = await api.get('/auth/guest');
    return response.data;
  },

  // 비밀번호 재설정 요청 (토큰 발급)
  requestPasswordReset: async (data: { email: string }) => {
    const response = await api.post('/auth/password-reset/request', data);
    return response.data;
  },

  // 비밀번호 재설정 실행
  executePasswordReset: async (data: { token: string; newPassword: string }) => {
    const response = await api.post('/auth/password-reset', data);
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

  // 게시글 작성 취소
  cancelPostWriting: async (postId: number) => {
    const response = await api.delete(`/posts/${postId}/cancel`);
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

// 댓글 관련 API
export const commentAPI = {
  // 댓글 작성
  createComment: async (data: { content: string; postId: number }) => {
    const response = await api.post('/comments', data);
    return response.data;
  },

  // 댓글 수정
  updateComment: async (commentId: number, data: { content: string }) => {
    const response = await api.put(`/comments/${commentId}`, data);
    return response.data;
  },

  // 댓글 삭제
  deleteComment: async (commentId: number) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },

  // 게시글별 댓글 목록 조회
  getCommentsByPostId: async (postId: number) => {
    const response = await api.get(`/comments/post/${postId}`);
    return response.data;
  },
};

// 첨부파일 관련 API
export const attachmentAPI = {
  // 프로젝트 생성 중 파일 업로드
  uploadFileCreatingProject: async (file: Blob | File, projectId: number, filename?: string) => {
    const formData = new FormData();
    // filename 제공 시 명시적으로 파일명 설정
    if (filename) {
      formData.append('file', file, filename);
    } else {
      formData.append('file', file as any);
    }
    formData.append('projectId', projectId.toString());
    const response = await api.post('/attachments/uploadcreatingproject', formData);
    return response.data;
  },
  // 파일 업로드
  uploadFile: async (file: Blob | File, postId: number, filename?: string) => {
    const formData = new FormData();
    if (filename) {
      formData.append('file', file, filename);
    } else {
      formData.append('file', file as any);
    }
    formData.append('postId', postId.toString());
    
    const response = await api.post('/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 게시글별 첨부파일 목록 조회
  getFilesByPostId: async (postId: number) => {
    const response = await api.get(`/attachments/post/${postId}`);
    return response.data;
  },

  // 파일 다운로드
  downloadFile: async (filename: string) => {
    const response = await api.get(`/attachments/download/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // 파일 삭제
  deleteFile: async (fileId: number) => {
    const response = await api.delete(`/attachments/${fileId}`);
    return response.data;
  },

  // AI 문서 생성 (DocAgent)
  generateDocument: async (fileId: number) => {
    const response = await api.post(`/attachments/docagent/${fileId}`);
    return response.data;
  },

  // Swagger YAML 조회
  getSwaggerYaml: async () => {
    const response = await api.get('/attachments/swaggeryaml');
    return response.data;
  },
};

// Agent 관련 API
export const agentAPI = {
  // 일반 채팅 (ManagerAgent → 적절한 에이전트 선택)
  chat: async (message: string) => {
    const response = await api.post('/ai/process', { message });
    return response.data;
  },

  // 특정 에이전트 직접 호출
  callAgent: async (agentType: string, message: string) => {
    const response = await api.post(`/ai/agents/${agentType}`, { message });
    return response.data;
  },

  // RAG 문서 추가
  addDocuments: async (filePaths: string[]) => {
    const response = await api.post('/ai/rag/add-documents', filePaths);
    return response.data;
  },
};

// 프로젝트 관리 관련 API
export const projectManagementAPI = {
  // 프로젝트 초기화 (빈 프로젝트 생성)
  initProject: async () => {
    const response = await api.post('/projectManagements/init');
    return response.data;
  },

  // 특정 프로젝트 조회
  getProject: async (projectId: number) => {
    const response = await api.get(`/projectManagements/${projectId}`);
    return response.data;
  },

  // 모든 프로젝트 목록 조회
  getAllProjects: async () => {
    const response = await api.get('/projectManagements');
    return response.data;
  },

  // 프로젝트 상세 정보 업데이트
  updateProject: async (data: {
    projectId: number;
    projectName: string;
    projectDescription: string;
    githubUrl?: string;
    projectStatus?: string;
    inviteEmails?: string[];
  }) => {
    const formData = new FormData();
    formData.append('projectName', data.projectName);
    formData.append('projectDescription', data.projectDescription);
    
    if (data.githubUrl) {
      formData.append('githubUrl', data.githubUrl);
    }
    
    if (data.projectStatus) {
      formData.append('projectStatus', data.projectStatus);
    }
    
    if (data.inviteEmails && data.inviteEmails.length > 0) {
      data.inviteEmails.forEach(email => {
        formData.append('inviteEmails', email);
      });
    }

    const response = await api.put(`/projectManagements/${data.projectId}/saveproject`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 팀원 초대
  inviteTeamMembers: async (projectId: number, emails: string[]) => {
    const response = await api.post(`/projectManagements/${projectId}/invite`, emails);
    return response.data;
  },
};

export default api;