import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, FolderPlus, Users, Calendar, Target, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const ProjectManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const handleProjectManage = (project: any) => {
    setSelectedProject(project);
    setIsProjectDetailOpen(true);
  };

  // 샘플 데이터
  const mockProjects = [
    {
      id: 1,
      name: "웹 애플리케이션 개발",
      status: "진행 중",
      memberCount: 3,
      team: {
        name: "프론트엔드 팀",
        members: ["김개발", "이코딩", "박리액트"],
        description: "React 기반 프론트엔드 개발팀"
      },
      tasks: ["UI 디자인 완료", "API 연동 진행", "테스트 코드 작성"]
    },
    {
      id: 2,
      name: "모바일 앱 리뉴얼",
      status: "계획 중",
      memberCount: 5,
      team: {
        name: "백엔드 팀",
        members: ["최서버", "정데이터", "한백엔드", "송API", "김DB"],
        description: "Node.js 기반 백엔드 개발팀"
      },
      tasks: ["요구사항 분석", "기술 스택 선정", "개발 일정 수립"]
    }
  ];

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
            <Button 
              className="w-full"
              onClick={() => navigate('/projects/create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              프로젝트 생성
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 프로젝트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{project.name}</h4>
                    <p className="text-sm text-muted-foreground">{project.status} • {project.memberCount}명</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleProjectManage(project)}
                  >
                    관리
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 프로젝트 상세 관리 팝업 */}
      <Dialog open={isProjectDetailOpen} onOpenChange={setIsProjectDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProject?.name} 관리</DialogTitle>
            <DialogDescription>
              프로젝트 정보, 팀 멤버, 진행 상황을 확인하세요.
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="grid gap-6 py-4">
              {/* 프로젝트 기본 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  프로젝트 정보
                </h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p><strong>상태:</strong> {selectedProject.status}</p>
                  <p><strong>팀원 수:</strong> {selectedProject.memberCount}명</p>
                </div>
              </div>

              {/* 팀 정보 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  팀 정보
                </h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">{selectedProject.team.name}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{selectedProject.team.description}</p>
                  <div className="space-y-2">
                    <p className="font-medium">팀 멤버:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.team.members.map((member: string, index: number) => (
                        <span key={index} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm">
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 진행 중인 작업 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  진행 중인 작업
                </h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="space-y-2">
                    {selectedProject.tasks.map((task: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProjectDetailOpen(false)}>
              닫기
            </Button>
            <Button>수정</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectManagement;