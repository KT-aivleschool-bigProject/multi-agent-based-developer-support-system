import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitBranch, GitCommit, GitMerge, Search, Plus, Code, Users, Calendar } from 'lucide-react';

const CodeManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const repositories = [
    {
      id: 1,
      name: "frontend-app",
      description: "메인 프론트엔드 애플리케이션",
      language: "TypeScript",
      branches: 5,
      commits: 234,
      contributors: 4,
      lastUpdate: "2시간 전",
      status: "active",
    },
    {
      id: 2,
      name: "backend-api",
      description: "REST API 서버",
      language: "Node.js",
      branches: 3,
      commits: 156,
      contributors: 3,
      lastUpdate: "1일 전",
      status: "active",
    },
    {
      id: 3,
      name: "mobile-app",
      description: "모바일 애플리케이션",
      language: "React Native",
      branches: 2,
      commits: 89,
      contributors: 2,
      lastUpdate: "3일 전",
      status: "maintenance",
    },
  ];

  const pullRequests = [
    {
      id: 1,
      title: "로그인 페이지 UI 개선",
      author: "김개발",
      status: "open",
      repository: "frontend-app",
      createdAt: "2시간 전",
      comments: 3,
    },
    {
      id: 2,
      title: "API 응답 속도 최적화",
      author: "이백엔드",
      status: "review",
      repository: "backend-api",
      createdAt: "1일 전",
      comments: 5,
    },
    {
      id: 3,
      title: "데이터베이스 스키마 업데이트",
      author: "박풀스택",
      status: "merged",
      repository: "backend-api",
      createdAt: "2일 전",
      comments: 2,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-orange-100 text-orange-800';
      case 'merged':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'TypeScript':
        return 'bg-blue-100 text-blue-800';
      case 'Node.js':
        return 'bg-green-100 text-green-800';
      case 'React Native':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">코드 관리</h1>
        <p className="text-muted-foreground">
          프로젝트 리포지토리와 코드 변경사항을 관리하세요.
        </p>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="리포지토리 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          새 리포지토리
        </Button>
      </div>

      <Tabs defaultValue="repositories" className="space-y-6">
        <TabsList>
          <TabsTrigger value="repositories">리포지토리</TabsTrigger>
          <TabsTrigger value="pull-requests">Pull Requests</TabsTrigger>
          <TabsTrigger value="branches">브랜치</TabsTrigger>
        </TabsList>

        <TabsContent value="repositories" className="space-y-4">
          {repositories.map((repo) => (
            <Card key={repo.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      {repo.name}
                    </CardTitle>
                    <CardDescription>{repo.description}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(repo.status)}>
                    {repo.status === 'active' ? '활성' : '유지보수'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge className={getLanguageColor(repo.language)}>
                      {repo.language}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <GitBranch className="h-4 w-4" />
                      {repo.branches} 브랜치
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <GitCommit className="h-4 w-4" />
                      {repo.commits} 커밋
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {repo.contributors} 기여자
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {repo.lastUpdate}
                    </span>
                    <Button variant="outline" size="sm">
                      열기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pull-requests" className="space-y-4">
          {pullRequests.map((pr) => (
            <Card key={pr.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GitMerge className="h-5 w-5" />
                      {pr.title}
                    </CardTitle>
                    <CardDescription>
                      {pr.repository} • {pr.author} • {pr.comments}개 댓글
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(pr.status)}>
                    {pr.status === 'open' ? '열림' : 
                     pr.status === 'review' ? '리뷰중' : '병합됨'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {pr.createdAt}
                  </div>
                  <Button variant="outline" size="sm">
                    상세보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="branches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>브랜치 관리</CardTitle>
              <CardDescription>
                활성 브랜치와 머지 현황을 확인하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">브랜치 목록이 곧 추가될 예정입니다.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CodeManagement;