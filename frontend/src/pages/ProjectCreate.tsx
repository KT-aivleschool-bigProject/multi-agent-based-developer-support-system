import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, X, ChevronLeft, Plus, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { projectManagementAPI, attachmentAPI } from '@/services/api';

interface TeamMember {
  name: string;
  email: string;
  role: string;
}


const ProjectCreate = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [currentStep, setCurrentStep] = useState(1); // 1: 프로젝트 생성, 2: 팀 생성

  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    githubUrl: '', // 추가
  });

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    members: [] as TeamMember[]
  });

  const [newMember, setNewMember] = useState<TeamMember>({
    name: '',
    email: '',
    role: ''
  });


  const roleOptions = [
    '역할 선택',
    '프론트엔드',
    '백엔드',
    '풀스택',
    '디자이너',
    'PM/PO',
    'QA',
    'DevOps',
    'AI 개발자'
  ];

  const handleNextStep = () => {
    setCurrentStep(2);
  };
  const handleAll = async () => {
    await handleProjectCreate();
    await handleInviteMembers(Number(projectId), teamData.members.map(member => member.email));
    await uploadAllFiles(attachedFiles, Number(projectId));
  };
  const handleProjectCreate = async () => {
    if (!projectData.name || !projectData.description) {
      toast({
        title: "오류",
        description: "프로젝트 이름과 설명을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    if (!projectId) {
      toast({ title: "오류", description: "projectId가 없습니다.", variant: "destructive" });
      return;
    }
    try {
      await projectManagementAPI.updateProject({
        projectId: Number(projectId),
        projectName: projectData.name,
        projectDescription: projectData.description,
        githubUrl: projectData.githubUrl, // 추가
        projectStatus: "ACTIVE", // 기본값으로 ACTIVE 설정
        inviteEmails: teamData.members.map(member => member.email) // 팀원 이메일 목록
      });
      toast({
        title: "프로젝트 생성 완료",
        description: `${projectData.name} 프로젝트와 ${teamData.name} 팀이 생성되었습니다.`
      });
      navigate('/projects');
    } catch (error) {
      toast({ title: "프로젝트 생성 실패", description: "다시 시도해주세요.", variant: "destructive" });
    }
  };

  const uploadAllFiles = async (files: File[], projectId: number) => {
    if (!projectId) return;
    try {
      for (const file of files) {
        await attachmentAPI.uploadFileCreatingProject(file, Number(projectId));
      }
      toast({
        title: '파일 첨부 및 업로드 완료',
        description: `${files.length}개의 파일이 서버에 업로드되었습니다.`,
      });
    } catch (error) {
      toast({
        title: '파일 업로드 실패',
        description: '파일 업로드 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isValidEmail = (email: string) => {
    // 간단한 이메일 정규식
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const addTeamMember = () => {
    if (!newMember.email) {
      toast({
        title: "오류",
        description: "이메일을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    if (!isValidEmail(newMember.email)) {
      toast({
        title: "오류",
        description: "유효한 이메일 형식이 아닙니다.",
        variant: "destructive"
      });
      return;
    }
    setTeamData({
      ...teamData,
      members: [...teamData.members, { name: '', email: newMember.email, role: '' }]
    });
    setNewMember({ name: '', email: '', role: '' });
  };

  const removeTeamMember = (index: number) => {
    setTeamData({
      ...teamData,
      members: teamData.members.filter((_, i) => i !== index)
    });
  };

  // 예: 프로젝트 생성 후 팀원 초대
  const handleInviteMembers = async (projectId: number, emails: string[]) => {
    try {
      await projectManagementAPI.inviteTeamMembers(projectId, emails);
      // 성공 처리
      toast({ title: "팀원 초대 완료" });
    } catch (error) {
      // 실패 처리
      toast({ title: "팀원 초대 실패", description: "다시 시도해주세요.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">새로운 시작을 위한 준비</h1>
            <p className="text-muted-foreground">
              개발 팀과 프로젝트를 설정하여 성공적인 협업을 시작하세요
            </p>
          </div>

          {/* 단계 표시 */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                1
              </div>
              <div className="w-8 h-px bg-muted"></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="flex space-x-8 text-sm">
              <span className={currentStep === 1 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                프로젝트 생성
              </span>
              <span className={currentStep === 2 ? 'text-primary font-medium' : 'text-muted-foreground'}>
                팀 설정
              </span>
            </div>
          </div>

          {/* 콘텐츠 */}
          <div className="bg-card rounded-lg border p-6">
            {currentStep === 1 ? (
              /* 프로젝트 생성 단계 */
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">프로젝트 정보</h2>
                  <p className="text-sm text-muted-foreground mb-6">새로운 프로젝트의 기본 정보를 입력해주세요</p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="project-name">프로젝트명 *</Label>
                      <Input
                        id="project-name"
                        value={projectData.name}
                        onChange={(e) => setProjectData({...projectData, name: e.target.value})}
                        placeholder="예: 웹 애플리케이션 도구"
                      />
                    </div>

                    <div>
                      <Label htmlFor="project-description">프로젝트 설명 *</Label>
                      <Textarea
                        id="project-description"
                        value={projectData.description}
                        onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                        placeholder="프로젝트의 목표와 주요 기능을 설명해주세요"
                        className="min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="project-github">GitHub 주소 (선택)</Label>
                      <Input
                        id="project-github"
                        type="url"
                        value={projectData.githubUrl || ''}
                        onChange={(e) => setProjectData({...projectData, githubUrl: e.target.value})}
                        placeholder="https://github.com/your-repo"
                      />
                    </div>

                    <div>
                      <Label htmlFor="project-files">파일 첨부</Label>
                      <div className="mt-2">
                        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                              <Label 
                                htmlFor="file-upload" 
                                className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
                              >
                                파일을 선택하거나 드래그해서 업로드하세요
                              </Label>
                              <Input
                                id="file-upload"
                                type="file"
                                multiple
                                onChange={e => {
                                  const files = Array.from(e.target.files || []);
                                  if (files.length > 0) {
                                    setAttachedFiles(prev => [...prev, ...files]);
                                    toast({
                                      title: '파일 첨부 완료',
                                      description: `${files.length}개의 파일이 첨부되었습니다.`,
                                    });
                                  }
                                }}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                              />
                            </div>
                          </CardContent>
                        </Card>

                        {/* 첨부된 파일 목록 */}
                        {attachedFiles.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium">첨부된 파일 ({attachedFiles.length}개)</p>
                            {attachedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(index)}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* 팀 생성 단계 */
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(1)}
                    className="p-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h2 className="text-lg font-semibold">팀 구성</h2>
                    <p className="text-sm text-muted-foreground">함께 할 팀원들을 추가하여 역할을 설정해주세요</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>팀원 이메일 추가</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="email@example.com"
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      />
                      <Button type="button" onClick={addTeamMember} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {teamData.members.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">팀원 이메일 목록</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {teamData.members.map((member, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                              <span className="text-sm text-muted-foreground">{member.email}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTeamMember(index)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 하단 버튼 */}
            <div className="flex justify-between pt-6 mt-6 border-t">
              <Button variant="outline" onClick={() => navigate('/projects')}>
                취소
              </Button>
              {currentStep === 1 ? (
                <Button onClick={handleNextStep}>다음</Button>
              ) : (
                <Button onClick={handleAll}>프로젝트 생성</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 챗봇 버튼 */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default ProjectCreate;