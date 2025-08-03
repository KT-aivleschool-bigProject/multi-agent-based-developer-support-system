
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Code2, Users, MessageSquare, Zap, ArrowRight, GitBranch, Bot } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Users,
      title: "멀티 에이전트 협업",
      description: "AI 에이전트들과 함께 코드를 작성하고 리뷰받으세요",
      badge: "AI",
    },
    {
      icon: MessageSquare,
      title: "실시간 토론",
      description: "개발자들과 실시간으로 소통하며 문제를 해결하세요",
      badge: "커뮤니티",
    },
    {
      icon: GitBranch,
      title: "코드 협업",
      description: "프로젝트를 공유하고 함께 개발해보세요",
      badge: "협업",
    },
    {
      icon: Zap,
      title: "빠른 피드백",
      description: "즉시 코드 리뷰와 개선 제안을 받아보세요",
      badge: "효율성",
    },
  ];

  if (user) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">DevCollab</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/dashboard">대시보드</Link>
              </Button>
              <Button asChild>
                <Link to="/board">게시판</Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl font-bold mb-4">
              환영합니다, {user.username}님!
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              멀티 에이전트와 함께하는 개발자 협업 플랫폼
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg" asChild>
                <Link to="/dashboard">
                  대시보드로 이동
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/board">게시판 둘러보기</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DevCollab</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login">로그인</Link>
            </Button>
            <Button asChild>
              <Link to="/register">회원가입</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                <Bot className="mr-1 h-3 w-3" />
                AI 기반 협업 플랫폼
              </Badge>
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              멀티 에이전트 기반<br />개발자 협업 플랫폼
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              AI 에이전트들과 함께 코드를 작성하고, 개발자들과 실시간으로 협업하며
              더 나은 소프트웨어를 만들어보세요.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" asChild>
                <Link to="/register">
                  회원가입
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">로그인</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">주요 기능</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              AI와 함께하는 새로운 개발 경험을 제공합니다
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <feature.icon className="h-12 w-12 text-primary" />
                  </div>
                  <div className="flex justify-center mb-2">
                    <Badge variant="secondary">{feature.badge}</Badge>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16">
          <Card className="gradient-border p-1">
            <div className="bg-card rounded-lg p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                지금 바로 시작해보세요
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                멀티 에이전트와 함께하는 새로운 개발 경험을 체험해보세요.
              </p>
              <Button size="lg" asChild>
                <Link to="/register">
                  회원가입하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </section>
      </main>

      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 DevCollab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
