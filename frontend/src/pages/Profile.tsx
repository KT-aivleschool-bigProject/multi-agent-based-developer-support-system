import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Briefcase, ArrowLeft } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
        <p className="text-muted-foreground">
          프로필 정보를 확인하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>프로필 정보</CardTitle>
              <CardDescription>
                기본 프로필 정보를 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">사용자명</Label>
                <div className="flex gap-2">
                  <User className="h-4 w-4 mt-3 text-muted-foreground" />
                  <div className="flex-1 px-3 py-2 bg-muted rounded-md">
                    {user?.name || '정보 없음'}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="flex gap-2">
                  <Mail className="h-4 w-4 mt-3 text-muted-foreground" />
                  <div className="flex-1 px-3 py-2 bg-muted rounded-md">
                    {user?.email || '정보 없음'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">직책</Label>
                <div className="flex gap-2">
                  <Briefcase className="h-4 w-4 mt-3 text-muted-foreground" />
                  <div className="flex-1 px-3 py-2 bg-muted rounded-md">
                    {user?.position || '정보 없음'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* 빈 공간 또는 다른 콘텐츠 */}
        </div>
      </div>
    </div>
  );
};

export default Profile;