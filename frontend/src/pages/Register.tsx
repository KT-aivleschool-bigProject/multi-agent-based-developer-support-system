
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Code2, Loader2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [position, setPosition] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeToTerms) {
      toast({
        title: "약관 동의 필요",
        description: "개인정보처리방침에 동의해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    if (!name || !email || !password || !position) {
      toast({
        title: "입력 오류",
        description: "모든 필수 항목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 8) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호는 8자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }
    
    const success = await register(name, email, password, position);
    if (success) {
      toast({
        title: "회원가입 성공",
        description: "회원가입이 완료되었습니다. 로그인해주세요.",
      });
      navigate('/login');
    } else {
      toast({
        title: "회원가입 실패",
        description: "입력 정보를 확인해주세요.",
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
          <CardTitle className="text-xl">회원가입</CardTitle>
          <CardDescription>
            개발자 협업 플랫폼에 가입하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름 *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력해주세요"
                required
                disabled={isLoading}
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">회사 이메일 *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력해주세요"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">직책 *</Label>
              <Select value={position} onValueChange={setPosition} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="직책을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="백엔드 개발자">백엔드 개발자</SelectItem>
                  <SelectItem value="프론트엔드 개발자">프론트엔드 개발자</SelectItem>
                  <SelectItem value="풀스택 개발자">풀스택 개발자</SelectItem>
                  <SelectItem value="디자이너">디자이너</SelectItem>
                  <SelectItem value="DevOps 엔지니어">DevOps 엔지니어</SelectItem>
                  <SelectItem value="프로젝트 매니저">프로젝트 매니저</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호 *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                비밀번호는 8자 이상 100자 이하여야 합니다.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={8}
                maxLength={100}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                disabled={isLoading}
              />
              <Label htmlFor="terms" className="text-sm">
                <span className="text-muted-foreground">
                  개인정보처리방침에 동의합니다{' '}
                </span>
                <Link to="/privacy" className="text-primary hover:underline">
                  (전문보기)
                </Link>
              </Label>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading || !agreeToTerms}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  가입 중...
                </>
              ) : (
                '회원가입'
              )}
            </Button>
          </form>
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-primary hover:underline">
                로그인
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
