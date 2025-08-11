import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Code2, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  // 비밀번호 복잡성 검증 함수
  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*_+\-=\[\]{};':"\\|,.<>/?]/.test(password);
    
    const typesCount = [hasLetter, hasNumber, hasSpecialChar].filter(Boolean).length;
    const length = password.length;
    
    // 금지된 특수문자 체크
    const forbiddenChars = /[()<>"';]/.test(password);
    if (forbiddenChars) {
      return { isValid: false, message: "금지된 특수문자 ( ) < > \" ' ; 를 사용할 수 없습니다." };
    }
    
    // 2종류 조합: 10~16자리
    if (typesCount === 2) {
      if (length < 10 || length > 16) {
        return { isValid: false, message: "2종류 조합 시 10~16자리로 구성해야 합니다." };
      }
    }
    // 3종류 조합: 8~16자리
    else if (typesCount === 3) {
      if (length < 8 || length > 16) {
        return { isValid: false, message: "3종류 조합 시 8~16자리로 구성해야 합니다." };
      }
    }
    // 1종류만 사용
    else {
      return { isValid: false, message: "영어, 숫자, 특수문자 중 최소 2종류를 조합해야 합니다." };
    }
    
    return { isValid: true, message: "" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "입력 오류",
        description: "이메일과 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast({
        title: "비밀번호 오류",
        description: passwordValidation.message,
        variant: "destructive",
      });
      return;
    }
    
    const success = await login(email, password);
    if (success) {
      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "로그인 실패",
        description: "이메일 또는 비밀번호를 확인해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <Code2 className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold">DevCollab</h1>
          </div>
          <CardTitle className="text-xl">로그인</CardTitle>
          <CardDescription>
            회사 이메일로 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">회사 이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@company.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                minLength={8}
                maxLength={16}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </Button>
          </form>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              계정이 없으신가요?{' '}
              <Link to="/register" className="text-primary hover:underline">
                회원가입
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;