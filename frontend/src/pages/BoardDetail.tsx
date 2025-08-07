import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, MessageSquare, Paperclip, Send, Heart, Share } from 'lucide-react';

interface Comment {
  id: number;
  content: string;
  author: string;
  createdAt: string;
  replies?: Comment[];
}

const BoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      content: "이 요구사항 명세서가 정말 상세하게 잘 작성되었네요. 특히 API 부분이 명확해서 개발하기 좋을 것 같습니다.",
      author: "frontend_dev",
      createdAt: "1시간 전"
    },
    {
      id: 2,
      content: "데이터베이스 스키마 부분에서 사용자 권한 관련 테이블 구조를 조금 더 보완하면 좋을 것 같습니다.",
      author: "backend_dev",
      createdAt: "30분 전"
    }
  ]);

  // 임시 데이터 (실제로는 API에서 가져올 것)
  const post = {
    id: parseInt(id || '1'),
    title: "프로젝트 요구사항 명세서",
    content: `# 프로젝트 요구사항 명세서

## 개요
새로운 웹 애플리케이션 개발을 위한 상세 요구사항 명세서입니다.

## 주요 기능
1. **사용자 관리**
   - 회원가입/로그인 기능
   - 사용자 프로필 관리
   - 권한 기반 접근 제어

2. **문서 관리**
   - 문서 작성 및 편집
   - 파일 첨부 기능
   - 버전 관리

3. **협업 기능**
   - 댓글 시스템
   - 실시간 알림
   - 팀 워크스페이스

## 기술 스택
- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL
- Authentication: JWT

## 일정
- 1주차: 기본 구조 설계
- 2주차: 사용자 관리 기능 개발
- 3주차: 문서 관리 기능 개발
- 4주차: 협업 기능 개발
- 5주차: 테스트 및 배포

더 자세한 내용은 첨부된 문서를 참고해주세요.`,
    author: "project_manager",
    createdAt: "2시간 전",
    tags: ["요구사항", "명세서", "프로젝트"],
    views: 124,
    comments: comments.length,
    attachments: ["requirements.pdf", "wireframe.figma"]
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      content: newComment,
      author: "current_user",
      createdAt: "방금 전"
    };

    setComments([...comments, comment]);
    setNewComment('');
    
    toast({
      title: "성공",
      description: "댓글이 작성되었습니다.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/board')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          돌아가기
        </Button>
      </div>

      {/* 문서 본문 */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary">
                  {post.author[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.author}</p>
                <p className="text-sm text-muted-foreground">{post.createdAt}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{post.views}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>{post.comments}</span>
              </div>
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4 mr-1" />
                좋아요
              </Button>
              <Button variant="ghost" size="sm">
                <Share className="h-4 w-4 mr-1" />
                공유
              </Button>
            </div>
          </div>

          <CardTitle className="text-2xl mb-4">{post.title}</CardTitle>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>

          {post.attachments && post.attachments.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">첨부파일</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.attachments.map((file, index) => (
                  <Badge key={index} variant="outline" className="cursor-pointer hover:bg-muted">
                    {file}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="prose prose-sm max-w-none">
            {post.content.split('\n').map((line, index) => (
              <p key={index} className="mb-2 whitespace-pre-wrap">
                {line}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 댓글 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            댓글 ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 댓글 작성 */}
          <div className="flex space-x-4">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-secondary">U</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="댓글을 작성하세요..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-end">
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  댓글 작성
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* 댓글 목록 */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary">
                    {comment.author[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{comment.content}</p>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="text-xs">
                      <Heart className="h-3 w-3 mr-1" />
                      좋아요
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs">
                      답글
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {comments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              첫 번째 댓글을 작성해보세요!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BoardDetail;