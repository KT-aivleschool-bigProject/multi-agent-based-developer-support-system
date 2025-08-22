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
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  );
};

export default ProjectManagement;