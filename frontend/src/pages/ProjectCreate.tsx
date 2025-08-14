import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, X, ChevronLeft, Plus, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const ProjectCreate = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1); // 1: 프로젝트 생성, 2: 팀 생성
  
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
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
    'DevOps'
  ];

  const handleNextStep = () => {
    if (!projectData.name || !projectData.description) {
      toast({
        title: "오류",
        description: "프로젝트 이름과 설명을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    canonical.href = href;
  }, []);

  const handleProjectCreate = () => {
    if (!project.name.trim() || !project.description.trim()) {
      toast({
        title: '오류',
        description: '프로젝트 명과 프로젝트 설명을 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    // TODO: Supabase에 프로젝트 생성 로직 추가
    toast({
      title: '프로젝트 생성 완료',
      description: `${project.name} 프로젝트가 생성되었습니다.`,
    });

    navigate('/projects');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setAttachedFiles((prev) => [...prev, ...files]);
      toast({
        title: '파일 첨부 완료',
        description: `${files.length}개의 파일이 첨부되었습니다.`,
      });
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addTeamMember = () => {
    if (newMember.name && newMember.email && newMember.role && newMember.role !== '역할 선택') {
      setTeamData({
        ...teamData,
        members: [...teamData.members, newMember]
      });
      setNewMember({ name: '', email: '', role: '' });
    } else {
      toast({
        title: "오류",
        description: "팀원의 모든 정보를 입력해주세요.",
        variant: "destructive"
      });
    }
  };

  const removeTeamMember = (index: number) => {
    setTeamData({
      ...teamData,
      members: teamData.members.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 헤더 */}
          <header className="text-center mb-8">
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
                                onChange={handleFileUpload}
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

                  <div>
                    <Label htmlFor="project-description">프로젝트 설명 *</Label>
                    <Textarea
                      id="project-description"
                      value={project.description}
                      onChange={(e) => setProject((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="프로젝트의 목적과 핵심 기능을 간단히 설명해주세요"
                      className="min-h-[120px]"
                    />
                  </div>
                </div>
              </div>

              {/* 하단 버튼 */}
              <div className="flex justify-between pt-6 mt-6 border-t">
                <Button variant="outline" onClick={() => navigate('/projects')}>
                  취소
                </Button>
                <Button onClick={handleProjectCreate}>프로젝트 생성</Button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* 챗봇 버튼 */}
      <div className="fixed bottom-6 right-6">
        <Button size="lg" className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow">
          <Sparkles className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default ProjectCreate;
