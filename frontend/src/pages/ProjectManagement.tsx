import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, FolderPlus, Target, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { projectManagementAPI } from '@/services/api';

const ProjectManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // 프로젝트 목록/상세 조회 상태
  const [projects, setProjects] = useState<any[]>([]);
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);


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

  // 프로젝트 목록 로드
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const list = await projectManagementAPI.getAllProjects();
        setProjects(Array.isArray(list) ? list : []);
      } catch (e) {
        toast({ title: '프로젝트 목록 로드 실패', description: '잠시 후 다시 시도하세요.', variant: 'destructive' });
      }
    };
    fetchProjects();
  }, [toast]);

  const handleProjectManage = async (project: any) => {
    try {
      const id = project?.projectId ?? project?.id;
      const detail = await projectManagementAPI.getProject(id);
      setSelectedProject(detail);
      setIsProjectDetailOpen(true);
    } catch (e) {
      toast({ title: '프로젝트 조회 실패', description: '상세 정보를 불러오지 못했습니다.', variant: 'destructive' });
    }
  };

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

      {/* 프로젝트 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            프로젝트 목록
          </CardTitle>
          <CardDescription>현재 진행 중인 프로젝트들을 확인하고 관리하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2">프로젝트명</th>
                <th className="text-right py-2">작업</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.projectId ?? project.id} className="border-t">
                  <td className="py-3 font-medium">{project.projectName ?? project.name ?? `프로젝트 #${project.projectId}`}</td>
                  <td className="py-3 text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleProjectManage(project)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      상세 조회
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 프로젝트 상세 관리 팝업 */}
      <Dialog open={isProjectDetailOpen} onOpenChange={setIsProjectDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProject?.projectName ?? selectedProject?.name}</DialogTitle>
            <DialogDescription>
              프로젝트 상세 정보를 확인하세요.
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="py-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">프로젝트 내용</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed">{selectedProject?.projectDescription ?? selectedProject?.content ?? '설명이 없습니다.'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ProjectManagement;