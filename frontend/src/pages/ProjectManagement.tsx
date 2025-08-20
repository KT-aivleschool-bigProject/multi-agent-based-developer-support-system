import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FolderPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { projectManagementAPI } from '@/services/api';

const ProjectManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();


  const handleCreateProject = async () => {
    try {
      const result = await projectManagementAPI.initProject();
      const projectId = result.projectId; // 실제 응답 구조에 따라 key 확인 필요
      if (projectId) {
        navigate(`/projects/create/${projectId}`);
      } else {
        toast({ title: '프로젝트 생성 실패', description: 'projectId를 받아오지 못했습니다.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: '프로젝트 생성 실패', description: '다시 시도해주세요.', variant: 'destructive' });
    }
  };
  // 최근 프로젝트 섹션 제거로 샘플 데이터 삭제

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">프로젝트 관리</h1>
        <p className="text-muted-foreground mt-2">팀장 전용 프로젝트 및 팀 관리 페이지</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5" />
              프로젝트 및 팀 생성
            </CardTitle>
            <CardDescription>새로운 개발 프로젝트와 팀을 함께 생성하고 관리하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full"
                onClick={handleCreateProject}
              >
                <Plus className="h-4 w-4 mr-2" />
                프로젝트 생성
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  toast({
                    title: 'GitHub 연동',
                    description: 'GitHub 연동 기능은 준비 중입니다.',
                  });
                }}
              >
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                GitHub 연동
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  );
};

export default ProjectManagement;