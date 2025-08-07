import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, X, ChevronLeft, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface TeamMember {
  name: string;
  email: string;
  role: string;
}

const ProjectCreate = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1); // 1: 프로젝트 생성, 2: 팀 생성
  
  const [projectData, setProjectData] = useState({
    name: '',
    category: '',
    description: '',
    developmentPeriod: '',
    techStack: [] as string[],
  });

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

  const techStackOptions = [
    'React', 'Vue.js', 'Angular', 'Next.js',
    'Nuxt.js', 'Node.js', 'Express', 'NestJS',
    'Django', 'FastAPI', 'TypeScript', 'JavaScript',
    'Python', 'Java', 'C#', 'MongoDB',
    'PostgreSQL', 'MySQL', 'Redis', 'Docker'
  ];

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
    setCurrentStep(2);
  };

  const handleProjectCreate = () => {
    if (!teamData.name) {
      toast({
        title: "오류",
        description: "팀 이름을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    // TODO: Supabase에 프로젝트 및 팀 생성 로직 추가
    toast({
      title: "프로젝트 생성 완료",
      description: `${projectData.name} 프로젝트와 ${teamData.name} 팀이 생성되었습니다.`
    });
    
    // 프로젝트 관리 페이지로 이동
    navigate('/projects');
  };

  const addTechStack = (tech: string) => {
    if (!projectData.techStack.includes(tech)) {
      setProjectData({
        ...projectData,
        techStack: [...projectData.techStack, tech]
      });
    }
  };

  const removeTechStack = (tech: string) => {
    setProjectData({
      ...projectData,
      techStack: projectData.techStack.filter(t => t !== tech)
    });
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
                    <div className="grid grid-cols-2 gap-4">
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
                        <Label htmlFor="category">카테고리</Label>
                        <Select value={projectData.category} onValueChange={(value) => setProjectData({...projectData, category: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="프로젝트 유형을 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="web">웹 애플리케이션</SelectItem>
                            <SelectItem value="mobile">모바일 앱</SelectItem>
                            <SelectItem value="desktop">데스크톱 앱</SelectItem>
                            <SelectItem value="ai">AI/머신러닝</SelectItem>
                            <SelectItem value="game">게임</SelectItem>
                            <SelectItem value="other">기타</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="project-description">프로젝트 설명</Label>
                      <Textarea
                        id="project-description"
                        value={projectData.description}
                        onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                        placeholder="프로젝트의 목표와 주요 기능을 설명해주세요"
                        className="min-h-[100px]"
                      />
                    </div>

                    <div>
                      <Label htmlFor="development-period">예상 개발 기간</Label>
                      <Select value={projectData.developmentPeriod} onValueChange={(value) => setProjectData({...projectData, developmentPeriod: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="예상 개발 기간을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2weeks">1-2주</SelectItem>
                          <SelectItem value="1month">1개월</SelectItem>
                          <SelectItem value="2-3months">2-3개월</SelectItem>
                          <SelectItem value="6months">6개월</SelectItem>
                          <SelectItem value="1year">1년 이상</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>기술 스택</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {techStackOptions.map((tech) => (
                          <Button
                            key={tech}
                            type="button"
                            variant={projectData.techStack.includes(tech) ? "default" : "outline"}
                            size="sm"
                            onClick={() => projectData.techStack.includes(tech) ? removeTechStack(tech) : addTechStack(tech)}
                            className="text-xs"
                          >
                            {tech}
                          </Button>
                        ))}
                      </div>
                      {projectData.techStack.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium">선택한 기술:</p>
                          <div className="flex flex-wrap gap-2">
                            {projectData.techStack.map((tech) => (
                              <div key={tech} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                                {tech}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeTechStack(tech)}
                                  className="h-4 w-4 p-0 hover:bg-transparent"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="team-name">팀명 *</Label>
                      <Input
                        id="team-name"
                        value={teamData.name}
                        onChange={(e) => setTeamData({...teamData, name: e.target.value})}
                        placeholder="예: Frontend Warriors"
                      />
                    </div>
                    <div>
                      <Label htmlFor="team-description">팀 설명 (선택사항)</Label>
                      <Input
                        id="team-description"
                        value={teamData.description}
                        onChange={(e) => setTeamData({...teamData, description: e.target.value})}
                        placeholder="팀의 목표나 특징을 간단히 설명하세요"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>팀원 추가</Label>
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-3">
                        <Input
                          placeholder="이름"
                          value={newMember.name}
                          onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                        />
                      </div>
                      <div className="col-span-5">
                        <Input
                          placeholder="email@example.com"
                          type="email"
                          value={newMember.email}
                          onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                        />
                      </div>
                      <div className="col-span-3">
                        <Select value={newMember.role} onValueChange={(value) => setNewMember({...newMember, role: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="역할 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.slice(1).map((role) => (
                              <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Button type="button" onClick={addTeamMember} size="sm" className="w-full">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {teamData.members.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">팀원 목록</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {teamData.members.map((member, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{member.name}</span>
                                <span className="text-sm text-muted-foreground">{member.email}</span>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{member.role}</span>
                              </div>
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
                <Button onClick={handleProjectCreate}>프로젝트 생성</Button>
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

      {/* 모든 정보는 언제든지 수정할 수 있습니다 */}
      <div className="text-center text-xs text-muted-foreground py-4">
        모든 정보는 언제든지 수정할 수 있습니다
      </div>
    </div>
  );
};

export default ProjectCreate;