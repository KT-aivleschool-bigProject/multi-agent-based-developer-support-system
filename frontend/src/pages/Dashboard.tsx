
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Activity, MessageSquare, Users, Code } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: "진행중인 업무",
      value: "5",
      description: "할당된 업무 수",
      icon: Activity,
    },
    {
      title: "팀 멤버",
      value: "12",
      description: "협업 중인 개발자",
      icon: Users,
    },
    {
      title: "게시글",
      value: "24",
      description: "작성한 게시글 수",
      icon: MessageSquare,
    },
  ];

  const assignedTasks = [
    {
      id: 1,
      title: "로그인 페이지 UI 개선",
      priority: "높음",
      dueDate: "2024-01-15",
      status: "진행중",
    },
    {
      id: 2,
      title: "API 연동 테스트",
      priority: "보통",
      dueDate: "2024-01-18",
      status: "대기",
    },
    {
      id: 3,
      title: "문서 작성",
      priority: "낮음",
      dueDate: "2024-01-20",
      status: "완료",
    },
  ];

  const todayEvents = [
    { time: "09:00", title: "팀 회의" },
    { time: "14:00", title: "코드 리뷰" },
    { time: "16:00", title: "프로젝트 발표" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          환영합니다, {user?.username}님!
        </h1>
        <p className="text-muted-foreground">
          오늘도 멋진 코드를 작성해보세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>오늘의 일정</CardTitle>
            <CardDescription>
              오늘 예정된 일정입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{event.title}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {event.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>배정받은 업무</CardTitle>
            <CardDescription>
              현재 진행중인 업무 목록입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignedTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      마감: {task.dueDate} | {task.priority}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.status === '완료' ? 'bg-green-100 text-green-800' :
                    task.status === '진행중' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
