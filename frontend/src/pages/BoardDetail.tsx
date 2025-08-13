import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Eye, MessageSquare, Send, Edit, Loader2, Edit2, Trash2, Check, X, Download, FileText, Image, File } from 'lucide-react';
import { postAPI, commentAPI, attachmentAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface CommentData {
  commentId: number;
  content: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
  postId: number;
}

interface Attachment {
  fileId: number;
  postId: number;
  originalName: string;
  storedName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
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
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [comments, setComments] = useState<CommentData[]>([]);
  const [post, setPost] = useState<Post | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
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
      
      // 첨부파일 정보 가져오기
      try {
        const attachmentsData = await attachmentAPI.getFilesByPostId(parseInt(id));
        setAttachments(attachmentsData);
      } catch (error) {
        console.error('첨부파일 조회 실패:', error);
        // 첨부파일 조회 실패는 게시글 표시에 영향을 주지 않음
      }
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

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 파일 타입에 따른 아이콘
  const getFileIcon = (fileType: string, originalName: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-4 w-4" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-4 w-4" />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FileText className="h-4 w-4" />;
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      return <FileText className="h-4 w-4" />;
    } else if (fileType.includes('text/')) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  // 파일 다운로드
  const handleFileDownload = async (attachment: Attachment) => {
    try {
      const blob = await attachmentAPI.downloadFile(attachment.storedName);
      
      // 다운로드 링크 생성
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "다운로드 시작",
        description: `${attachment.originalName} 다운로드가 시작되었습니다.`,
      });
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      toast({
        title: "다운로드 실패",
        description: "파일 다운로드에 실패했습니다.",
        variant: "destructive",
      });
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

  // 댓글 목록 가져오기
  const fetchComments = async () => {
    if (!id) return;
    
    try {
      setLoadingComments(true);
      const commentsData = await commentAPI.getCommentsByPostId(parseInt(id));
      setComments(commentsData);
    } catch (error) {
      console.error('댓글 조회 실패:', error);
      toast({
        title: "오류",
        description: "댓글을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoadingComments(false);
    }
  };

  // 댓글 작성
  const handleAddComment = async () => {
    if (!newComment.trim() || !id) return;

    try {
      setSubmittingComment(true);
      await commentAPI.createComment({
        content: newComment.trim(),
        postId: parseInt(id)
      });
      
      setNewComment('');
      await fetchComments(); // 댓글 목록 새로고침
      
      toast({
        title: "성공",
        description: "댓글이 작성되었습니다.",
      });
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      toast({
        title: "오류",
        description: "댓글 작성에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = (commentId: number, content: string) => {
    setEditingComment(commentId);
    setEditContent(content);
  };

  const handleSaveEdit = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      await commentAPI.updateComment(commentId, {
        content: editContent.trim()
      });
      
      setEditingComment(null);
      setEditContent('');
      await fetchComments(); // 댓글 목록 새로고침
      
      toast({
        title: "성공",
        description: "댓글이 수정되었습니다.",
      });
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      toast({
        title: "오류",
        description: "댓글 수정에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await commentAPI.deleteComment(commentId);
      await fetchComments(); // 댓글 목록 새로고침
      
      toast({
        title: "성공",
        description: "댓글이 삭제되었습니다.",
      });
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      toast({
        title: "오류",
        description: "댓글 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
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

  // 게시글 날짜 표시 (수정일 우선, 없으면 생성일)
  const getDisplayDate = (post: Post) => {
    if (post.updatedAt && post.updatedAt !== post.createdAt) {
      return `${formatDate(post.updatedAt)} (수정됨)`;
    }
    return formatDate(post.createdAt);
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
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
                  <p>{getDisplayDate(post)}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{post.viewCount}</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span>{comments.length}</span>
              </div>
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

      {/* 첨부파일 섹션 */}
      {attachments.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              첨부파일 ({attachments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attachments.map((attachment) => (
                <div 
                  key={attachment.fileId} 
                  className="flex items-center justify-between p-3 bg-muted rounded-lg border"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getFileIcon(attachment.fileType, attachment.originalName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={attachment.originalName}>
                        {attachment.originalName}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {formatFileSize(attachment.fileSize)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {attachment.fileType || '알 수 없음'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileDownload(attachment)}
                    title="다운로드"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    다운로드
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                <Button 
                  onClick={handleAddComment} 
                  disabled={!newComment.trim() || submittingComment}
                >
                  {submittingComment ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  댓글 작성
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* 댓글 목록 */}
          <div className="space-y-4">
            {loadingComments ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.commentId} className="flex space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary">
                      {comment.userName ? comment.userName[0].toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{comment.userName || '익명'}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                      </div>
                      {comment.userName === user?.name && (
                        <div className="flex space-x-1">
                          {editingComment === comment.commentId ? (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleSaveEdit(comment.commentId)}
                                className="h-6 w-6 p-0"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleCancelEdit}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleEditComment(comment.commentId, comment.content)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteComment(comment.commentId)}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {editingComment === comment.commentId ? (
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px] mb-2"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mb-2">{comment.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
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