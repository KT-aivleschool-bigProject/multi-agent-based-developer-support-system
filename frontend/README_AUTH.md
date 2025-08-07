# 🔐 인증 시스템 설정 가이드

## 📋 개요

이 프로젝트는 usermanagement 백엔드 서비스와 연동되는 JWT 기반 인증 시스템을 구현했습니다.

## 🏗️ 아키텍처

```
Frontend (3000) → Gateway (8088) → UserManagement (8082)
```

## 🚀 설정 방법

### 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# API Gateway URL
VITE_API_BASE_URL=http://localhost:8088

# Development mode
VITE_NODE_ENV=development
```

### 2. 백엔드 서비스 실행

다음 순서로 백엔드 서비스를 실행하세요:

1. **UserManagement 서비스** (포트 8082)
2. **Gateway 서비스** (포트 8088)

### 3. 프론트엔드 실행

```bash
npm install
npm run dev
```

## 🔧 주요 기능

### 로그인
- 이메일/비밀번호 인증
- JWT 토큰 기반 세션 관리
- 자동 토큰 갱신

### 회원가입
- 필수 필드: 이름, 이메일, 비밀번호, 직책
- 이메일 중복 검증
- 비밀번호 유효성 검사 (8자 이상)

### 보안 기능
- Access Token (30분) + Refresh Token (7일)
- 자동 토큰 갱신
- 로그아웃 시 토큰 무효화

## 📁 파일 구조

```
src/
├── contexts/
│   └── AuthContext.tsx          # 인증 상태 관리
├── services/
│   └── api.ts                   # API 통신 서비스
├── pages/
│   ├── Login.tsx                # 로그인 페이지
│   └── Register.tsx             # 회원가입 페이지
└── components/
    ├── Header.tsx               # 헤더 (로그아웃 포함)
    └── ProtectedRoute.tsx       # 보호된 라우트
```

## 🔌 API 엔드포인트

### 인증 관련
- `POST /auth/signup` - 회원가입
- `POST /auth/login` - 로그인
- `POST /auth/logout` - 로그아웃
- `POST /auth/reissue` - 토큰 재발급

### 사용자 관련
- `GET /users/profile` - 사용자 정보 조회
- `PUT /users/profile` - 사용자 정보 수정

## 🛡️ 보안 고려사항

1. **토큰 저장**: localStorage에 저장 (개발 환경)
2. **HTTPS**: 프로덕션 환경에서는 반드시 HTTPS 사용
3. **토큰 만료**: 자동 갱신 및 만료 시 로그아웃
4. **XSS 방지**: 입력값 검증 및 이스케이프 처리

## 🐛 문제 해결

### 로그인 실패
1. 백엔드 서비스가 실행 중인지 확인
2. Gateway 포트(8088) 접근 가능한지 확인
3. 브라우저 개발자 도구에서 네트워크 오류 확인

### 토큰 만료
- 자동으로 Refresh Token을 사용하여 갱신
- Refresh Token도 만료된 경우 로그인 페이지로 리다이렉트

### CORS 오류
- Gateway의 CORS 설정 확인
- 프론트엔드 URL이 허용된 Origin에 포함되어 있는지 확인

## 📝 사용 예시

### 로그인
```typescript
const { login } = useAuth();
const success = await login('user@example.com', 'password123');
```

### 회원가입
```typescript
const { register } = useAuth();
const success = await register('홍길동', 'user@example.com', 'password123', '백엔드 개발자');
```

### 로그아웃
```typescript
const { logout } = useAuth();
await logout();
```

### 보호된 라우트
```typescript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
``` 