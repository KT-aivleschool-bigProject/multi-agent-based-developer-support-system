import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Mail, ArrowLeft } from 'lucide-react';
import { authAPI } from '@/services/api';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestingReset, setIsRequestingReset] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "입력 오류",
        description: "이메일을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsRequestingReset(true);
    
    try {
      const token = await authAPI.requestPasswordReset({ email });
      // 백엔드에서 반환하는 토큰을 저장
      setResetToken(token);
      setResetRequested(true);
      toast({
        title: "이메일 발송 완료",
        description: "비밀번호 재설정 링크가 이메일로 발송되었습니다. 이메일을 확인해주세요.",
      });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.response?.data?.message || error.message || "비밀번호 재설정 요청 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsRequestingReset(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: "입력 오류",
        description: "새 비밀번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "오류",
        description: "새 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // 백엔드에서 받은 토큰을 자동으로 사용
      await authAPI.executePasswordReset({ 
        token: resetToken, 
        newPassword: newPassword 
      });
      toast({
        title: "성공",
        description: "비밀번호가 성공적으로 변경되었습니다.",
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.response?.data?.message || error.message || "비밀번호 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Lock className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">비밀번호 재설정</CardTitle>
          <CardDescription>
            {!resetRequested 
              ? "이메일을 입력하여 비밀번호 재설정을 요청하세요."
              : "발급받은 토큰과 새 비밀번호를 입력하세요."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!resetRequested ? (
            // 비밀번호 재설정 요청 폼
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일 주소</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isRequestingReset}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isRequestingReset}>
                {isRequestingReset ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    요청 중...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    비밀번호 재설정 요청
                  </>
                )}
              </Button>
            </form>
          ) : (
            // 비밀번호 재설정 실행 폼
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호를 입력하세요"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    변경 중...
                  </>
                ) : (
                  '비밀번호 변경'
                )}
              </Button>
            </form>
          )}
          
          <div className="text-center mt-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/login')}
              className="text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              로그인으로 돌아가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordReset;