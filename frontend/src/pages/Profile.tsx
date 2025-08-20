import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { User, Mail, Calendar, Briefcase } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    jobRole: user?.jobRole || '',
  });

  const handleSave = () => {
    toast({
      title: "프로필 업데이트",
      description: "회원 정보가 성공적으로 업데이트되었습니다.",
    });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
        <p className="text-muted-foreground">
          프로필 정보를 관리하고 계정 설정을 변경하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>프로필 정보</CardTitle>
              <CardDescription>
                기본 프로필 정보를 확인하고 수정할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">사용자명</Label>
                <div className="flex gap-2">
                  <User className="h-4 w-4 mt-3 text-muted-foreground" />
                  <Input
                    id="username"
                    value={formData.username}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="flex gap-2">
                  <Mail className="h-4 w-4 mt-3 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobRole">직무</Label>
                <div className="flex gap-2">
                  <Briefcase className="h-4 w-4 mt-3 text-muted-foreground" />
                  <Input
                    id="jobRole"
                    value={formData.jobRole}
                    disabled={!isEditing}
                    onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                    placeholder="예: 프론트엔드 개발자"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>가입일</Label>
                <div className="flex gap-2">
                  <Calendar className="h-4 w-4 mt-3 text-muted-foreground" />
                  <Input
                    value={user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : ''}
                    disabled
                  />
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