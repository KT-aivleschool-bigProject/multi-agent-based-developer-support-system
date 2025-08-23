
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '@/services/api';

interface User {
  userId: number;
  email: string;
  name: string;
  position: string;
  role: 'USER' | 'ADMIN';
  profileImage?: string;
  projectId?: number;
}

interface TokenResponse {
  grantType: string;
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  guestLogin: () => Promise<boolean>;
  register: (name: string, email: string, password: string, position: string, recaptchaToken: string | null) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // JWT 토큰에서 사용자 정보 추출
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      
      // 토큰 디버깅 정보 출력
      console.log('🔍 JWT 토큰 디버깅:');
      console.log('전체 토큰:', token);
      console.log('토큰 페이로드:', payload);
      console.log('사용자 ID:', payload.userId);
      console.log('이메일 (sub):', payload.sub);
      console.log('권한 (auth):', payload.auth);
      console.log('만료시간:', new Date(payload.exp * 1000).toLocaleString());
      
      return payload;
    } catch (error) {
      console.error('JWT 파싱 오류:', error);
      return null;
    }
  };

  // 토큰 유효성 검사
  const isTokenValid = (token: string) => {
    if (!token) return false;
    const payload = parseJwt(token);
    if (!payload) return false;
    return payload.exp * 1000 > Date.now();
  };

  // JWT 페이로드에서 기본 사용자 정보 추출
  const extractBasicUserFromToken = (payload: any): { userId: number; email: string; role: string } | null => {
    try {
      return {
        userId: payload.userId,
        email: payload.sub, // JWT의 subject는 보통 이메일
        role: payload.auth || 'USER', // JWT의 auth 클레임에서 권한 정보
      };
    } catch (error) {
      return null;
    }
  };

  // 사용자 상세 정보 가져오기 (토큰 기반)
  const fetchUserDetails = async (userId: number, email: string, role: string): Promise<User | null> => {
    try {
      // 토큰 기반으로 사용자 정보 가져오기
      const userData = await userAPI.getProfile();
      
      return {
        userId: userData.userId,
        email: userData.email,
        name: userData.name,
        position: userData.position,
        role: role as 'USER' | 'ADMIN',
        profileImage: userData.profileImage,
        projectId: userData.projectId,
      };
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error);
      // API 호출 실패 시 임시 데이터로 fallback
      return {
        userId,
        email,
        name: email.split('@')[0], // 임시로 이메일에서 이름 추출
        position: '개발자', // 임시 기본값
        role: role as 'USER' | 'ADMIN',
        profileImage: undefined,
        projectId: undefined,
      };
    }
  };

  // 초기화 시 토큰 검증
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (accessToken && isTokenValid(accessToken)) {
        const payload = parseJwt(accessToken);
        if (payload) {
          const basicUser = extractBasicUserFromToken(payload);
          if (basicUser) {
            const userDetails = await fetchUserDetails(basicUser.userId, basicUser.email, basicUser.role);
            if (userDetails) {
              setUser(userDetails);
              setIsAuthenticated(true);
            }
          }
        }
      } else if (refreshToken && isTokenValid(refreshToken)) {
        // Access Token이 만료되었지만 Refresh Token이 유효한 경우
        try {
          const response = await authAPI.reissue({ 
            refreshToken,
            accessToken: accessToken || ''
          });
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response;
          
          localStorage.setItem('accessToken', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          const payload = parseJwt(newAccessToken);
          if (payload) {
            const basicUser = extractBasicUserFromToken(payload);
            if (basicUser) {
              const userDetails = await fetchUserDetails(basicUser.userId, basicUser.email, basicUser.role);
              if (userDetails) {
                setUser(userDetails);
                setIsAuthenticated(true);
              }
            }
          }
        } catch (error) {
          // Refresh Token도 만료된 경우
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response: TokenResponse = await authAPI.login({ email, password });
      
      const { accessToken, refreshToken } = response;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      const payload = parseJwt(accessToken);
      if (payload) {
        const basicUser = extractBasicUserFromToken(payload);
        if (basicUser) {
          const userDetails = await fetchUserDetails(basicUser.userId, basicUser.email, basicUser.role);
          if (userDetails) {
            setUser(userDetails);
            setIsAuthenticated(true);
            setIsLoading(false);
            return true;
          }
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (name: string, email: string, password: string, position: string, recaptchaToken: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      await authAPI.signup({ name, email, password, position, recaptchaToken });
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('Register error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const guestLogin = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response: TokenResponse = await authAPI.guestLogin();
      
      const { accessToken, refreshToken } = response;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      const payload = parseJwt(accessToken);
      if (payload) {
        const basicUser = extractBasicUserFromToken(payload);
        if (basicUser) {
          const userDetails = await fetchUserDetails(basicUser.userId, basicUser.email, basicUser.role);
          if (userDetails) {
            setUser(userDetails);
            setIsAuthenticated(true);
            setIsLoading(false);
            return true;
          }
        }
      }
    } catch (error: any) {
      console.error('Guest login error:', error);
      setIsLoading(false);
      return false;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      
      // 애플리케이션 토큰 삭제
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // 구글 캘린더 토큰 삭제
      localStorage.removeItem('google_calendar_tokens');

      // 로그아웃 후 메인화면으로 이동
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      guestLogin,
      register, 
      logout, 
      isLoading,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};
