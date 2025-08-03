import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Github, User, Mail, Calendar, Briefcase, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const Profile = () => {
  const { user, logout } = useAuth();
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

  const handleGithubConnect = () => {
    toast({
      title: "GitHub 연동",
      description: "GitHub 연동 기능이 곧 추가될 예정입니다.",
    });
  };

  const handleDeleteAccount = () => {
    logout();
    toast({
      title: "계정 탈퇴",
      description: "계정이 성공적으로 탈퇴되었습니다.",
    });
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

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave}>저장</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      취소
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>수정</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>GitHub 연동</CardTitle>
              <CardDescription>
                GitHub 계정과 연동하여 더 많은 기능을 사용하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGithubConnect} className="w-full">
                <Github className="mr-2 h-4 w-4" />
                GitHub 연동
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>계정 관리</CardTitle>
              <CardDescription>
                계정 관련 설정을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    계정 탈퇴
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>계정을 탈퇴하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구적으로 삭제됩니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount}>
                      탈퇴하기
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;