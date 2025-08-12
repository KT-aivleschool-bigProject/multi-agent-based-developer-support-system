import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const ProjectCreate = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [project, setProject] = useState({
    name: '',
    description: '',
  });

  // Basic SEO for this page
  useEffect(() => {
    document.title = '프로젝트 생성 - 프로젝트 명과 설명';
    const desc = '프로젝트 생성: 프로젝트 명과 프로젝트 설명만 입력하여 빠르게 시작하세요.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    const href = `${window.location.origin}/projects/create`;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
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
            <h1 className="text-2xl font-bold mb-2">프로젝트 생성</h1>
            <p className="text-muted-foreground">프로젝트 명과 프로젝트 설명만 입력하면 바로 시작할 수 있어요.</p>
          </header>

          {/* 입력 카드 */}
          <section className="bg-card rounded-lg border p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">프로젝트 정보</h2>
                <p className="text-sm text-muted-foreground mb-6">필수 정보만 간단히 입력하세요.</p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="project-name">프로젝트명 *</Label>
                    <Input
                      id="project-name"
                      value={project.name}
                      onChange={(e) => setProject((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="예: 협업 관리 도구"
                    />
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

      {/* 안내 문구 */}
      <footer className="text-center text-xs text-muted-foreground py-4">
        모든 정보는 언제든지 수정할 수 있습니다
      </footer>
    </div>
  );
};

export default ProjectCreate;
