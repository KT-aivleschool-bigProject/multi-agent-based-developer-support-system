
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { Search, Plus, MessageSquare, Eye, Paperclip } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  tags: string[];
  views: number;
  comments: number;
  attachments?: string[];
}

const Board = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const posts: Post[] = [
    {
      id: 1,
      title: "프로젝트 요구사항 명세서",
      content: "새로운 웹 애플리케이션 개발을 위한 상세 요구사항 명세서입니다. 기능 정의, 기술 스택, 일정 등이 포함되어 있습니다.",
      author: "project_manager",
      createdAt: "2시간 전",
      tags: ["요구사항", "명세서", "프로젝트"],
      views: 124,
      comments: 8,
      attachments: ["requirements.pdf", "wireframe.figma"]
    },
    {
      id: 2,
      title: "API 설계 문서",
      content: "RESTful API 설계 가이드라인과 엔드포인트 명세를 정리한 문서입니다.",
      author: "backend_dev",
      createdAt: "4시간 전",
      tags: ["API", "설계", "백엔드"],
      views: 89,
      comments: 15,
      attachments: ["api_spec.json"]
    },
    {
      id: 3,
      title: "UI/UX 디자인 가이드",
      content: "프로젝트의 일관된 디자인을 위한 컴포넌트 라이브러리와 스타일 가이드입니다.",
      author: "ui_designer",
      createdAt: "1일 전",
      tags: ["디자인", "UI", "가이드라인"],
      views: 234,
      comments: 12,
      attachments: ["design_system.sketch", "components.pdf"]
    },
    {
      id: 4,
      title: "데이터베이스 스키마 설계",
      content: "프로젝트에서 사용할 데이터베이스 테이블 구조와 관계도를 정의한 문서입니다.",
      author: "database_admin",
      createdAt: "2일 전",
      tags: ["데이터베이스", "스키마", "설계"],
      views: 156,
      comments: 6,
      attachments: ["schema.sql", "erd_diagram.png"]
    }
  ];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">문서 게시판</h1>
          <p className="text-muted-foreground">
            프로젝트 문서를 공유하고 협업해보세요.
          </p>
        </div>
        <Button asChild className="mt-4 lg:mt-0">
          <Link to="/board/new">
            <Plus className="mr-2 h-4 w-4" />
            문서 작성
          </Link>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 사이드바 */}
        <div className="lg:w-64 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">검색</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="문서 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 게시글 목록 */}
        <div className="flex-1 space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link to={`/board/${post.id}`}>
                <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-xs">
                        {post.author[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{post.author}</p>
                      <p className="text-xs text-muted-foreground">{post.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>{post.views}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {post.content}
                </p>

                {post.attachments && post.attachments.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">첨부파일</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.attachments.map((file, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {file}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              </Link>
            </Card>
          ))}

          {filteredPosts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  검색 결과가 없습니다.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Board;
