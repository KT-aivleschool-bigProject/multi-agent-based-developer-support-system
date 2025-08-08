import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, MessageSquare, Paperclip, Send, Edit, Trash2, Loader2 } from 'lucide-react';
import { postAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Comment {
  id: number;
  content: string;
  author: string;
  createdAt: string;
  replies?: Comment[];
}

interface Post {
  postId: number;
  title: string;
  content: string;
  userId: number;
  userName?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  commentCount?: number;
}

const BoardDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthor, setIsAuthor] = useState(false);

  // 게시글 상세 정보 가져오기
  const fetchPost = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const postData = await postAPI.getPost(parseInt(id));
      setPost(postData);
      setIsAuthor(user?.userId === postData.userId);
    } catch (error) {
      console.error('게시글 조회 실패:', error);
      toast({
        title: "오류",
        description: "게시글을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
      navigate('/board');
    } finally {
      setLoading(false);
    }
  };

  // 게시글 삭제
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await postAPI.deletePost(parseInt(id));
      toast({
        title: "성공",
        description: "게시글이 삭제되었습니다.",
      });
      navigate('/board');
    } catch (error: any) {
      console.error('게시글 삭제 실패:', error);
      
      // 권한 관련 에러인지 확인
      if (error.response?.status === 500 && error.response?.data?.includes("authorized")) {
        toast({
          title: "권한 없음",
          description: "게시글을 삭제할 권한이 없습니다.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "오류",
          description: "게시글 삭제에 실패했습니다.",
          variant: "destructive",
        });
      }
    }
  };

  // 게시글 수정 페이지로 이동
  const handleEdit = async () => {
    if (!id) return;
    
    try {
      await postAPI.checkBeforeEditing(parseInt(id));
      navigate(`/board/edit/${id}`);
    } catch (error) {
      console.error('수정 권한 확인 실패:', error);
      toast({
        title: "오류",
        description: "게시글을 수정할 권한이 없습니다.",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      content: newComment,
      author: user?.name || "사용자",
      createdAt: "방금 전"
    };

    setComments([...comments, comment]);
    setNewComment('');
    
    toast({
      title: "성공",
      description: "댓글이 작성되었습니다.",
    });
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return '방금 전';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;
    
    return date.toLocaleDateString('ko-KR');
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">게시글을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/board')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          돌아가기
        </Button>
        
        {/* 임시로 항상 보이도록 수정 */}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            수정
          </Button>
        </div>
      </div>

      {/* 문서 본문 */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary">
                  {post.userName ? post.userName[0].toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.userName || `사용자${post.userId}`}</p>
                <div className="text-sm text-muted-foreground">
                  <p>{formatDate(post.createdAt)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{post.viewCount}</span>
              </div>
              {post.commentCount !== undefined && (
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  <span>{post.commentCount}</span>
                </div>
              )}
            </div>
          </div>

          <CardTitle className="text-2xl mb-4">{post.title || '제목 없음'}</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="prose prose-sm max-w-none">
            {post.content ? (
              post.content.split('\n').map((line, index) => (
                <p key={index} className="mb-2 whitespace-pre-wrap">
                  {line}
                </p>
              ))
            ) : (
              <p className="text-muted-foreground">내용이 없습니다.</p>
            )}
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
              <AvatarFallback className="bg-secondary">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </AvatarFallback>
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