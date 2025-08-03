import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, CheckSquare, Clock, AlertCircle, User, Calendar } from 'lucide-react';

const TaskManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const tasks = [
    {
      id: 1,
      title: "로그인 페이지 UI 개선",
      description: "사용자 경험을 향상시키기 위한 로그인 페이지 리디자인",
      assignee: "김개발",
      priority: "높음",
      status: "진행중",
      dueDate: "2024-01-15",
      project: "프론트엔드 앱",
    },
    {
      id: 2,
      title: "API 응답 속도 최적화",
      description: "데이터베이스 쿼리 최적화 및 캐싱 구현",
      assignee: "이백엔드",
      priority: "보통",
      status: "대기",
      dueDate: "2024-01-18",
      project: "백엔드 API",
    },
    {
      id: 3,
      title: "모바일 앱 버그 수정",
      description: "iOS에서 발생하는 크래시 이슈 해결",
      assignee: "박모바일",
      priority: "높음",
      status: "완료",
      dueDate: "2024-01-12",
      project: "모바일 앱",
    },
    {
      id: 4,
      title: "문서화 작업",
      description: "API 문서 업데이트 및 사용자 가이드 작성",
      assignee: "최기획",
      priority: "낮음",
      status: "진행중",
      dueDate: "2024-01-20",
      project: "문서",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '높음':
        return 'bg-red-100 text-red-800';
      case '보통':
        return 'bg-yellow-100 text-yellow-800';
      case '낮음':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '완료':
        return 'bg-green-100 text-green-800';
      case '진행중':
        return 'bg-blue-100 text-blue-800';
      case '대기':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '완료':
        return CheckSquare;
      case '진행중':
        return Clock;
      case '대기':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const filterTasks = (status?: string) => {
    let filtered = tasks;
    if (status) {
      filtered = tasks.filter(task => task.status === status);
    }
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">업무 관리</h1>
        <p className="text-muted-foreground">
          팀의 업무를 효율적으로 관리하고 진행상황을 추적하세요.
        </p>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="업무 또는 담당자 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          새 업무 생성
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="진행중">진행중</TabsTrigger>
          <TabsTrigger value="대기">대기</TabsTrigger>
          <TabsTrigger value="완료">완료</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filterTasks().map((task) => {
            const StatusIcon = getStatusIcon(task.status);
            return (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        <StatusIcon className="h-5 w-5" />
                        {task.title}
                      </CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {task.assignee}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        마감: {task.dueDate}
                      </div>
                      <Badge variant="secondary">{task.project}</Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      상세보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="진행중" className="space-y-4">
          {filterTasks('진행중').map((task) => {
            const StatusIcon = getStatusIcon(task.status);
            return (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        <StatusIcon className="h-5 w-5" />
                        {task.title}
                      </CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {task.assignee}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        마감: {task.dueDate}
                      </div>
                      <Badge variant="secondary">{task.project}</Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      상세보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="대기" className="space-y-4">
          {filterTasks('대기').map((task) => {
            const StatusIcon = getStatusIcon(task.status);
            return (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        <StatusIcon className="h-5 w-5" />
                        {task.title}
                      </CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {task.assignee}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        마감: {task.dueDate}
                      </div>
                      <Badge variant="secondary">{task.project}</Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      상세보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="완료" className="space-y-4">
          {filterTasks('완료').map((task) => {
            const StatusIcon = getStatusIcon(task.status);
            return (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-2">
                        <StatusIcon className="h-5 w-5" />
                        {task.title}
                      </CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {task.assignee}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        마감: {task.dueDate}
                      </div>
                      <Badge variant="secondary">{task.project}</Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      상세보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskManagement;