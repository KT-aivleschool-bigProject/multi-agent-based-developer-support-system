import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, X, Upload, FileText, Loader2 } from 'lucide-react';
import { postAPI, attachmentAPI } from '@/services/api';
import FileAttachment from '@/components/FileAttachment';
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

const BoardNew = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postId, setPostId] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  // 첨부파일 변경 처리
  const handleAttachmentsChange = (newAttachments: Attachment[]) => {
    setAttachments(newAttachments);
    setHasUnsavedChanges(true);
  };

  // AI 생성 결과 처리
  const handleAIGeneration = (title: string, content: string) => {
    setTitle(title);
    setContent(content);
    setHasUnsavedChanges(true);
    
    toast({
      title: "AI 생성 완료",
      description: "제목과 내용이 자동으로 채워졌습니다.",
    });
  };

  // 첨부파일 업로드 처리
  const uploadAttachments = async (): Promise<void> => {
    if (attachments.length === 0) return;

    const uploadPromises = attachments
      .filter(att => att.fileUrl.startsWith('blob:')) // 임시 파일만 업로드
      .map(async (attachment) => {
        try {
          // blob URL에서 File 객체 추출
          const response = await fetch(attachment.fileUrl);
          const file = await response.blob();
          const fileName = attachment.originalName;
          
          // File 객체 생성
          const fileObj = new File([file], fileName, { type: attachment.fileType });
          
          // 실제 업로드
          const uploadedAttachment = await attachmentAPI.uploadFile(fileObj, postId!);
          
          // blob URL 정리
          URL.revokeObjectURL(attachment.fileUrl);
          
          return uploadedAttachment;
        } catch (error) {
          console.error('파일 업로드 실패:', error);
          throw new Error(`${attachment.originalName} 업로드에 실패했습니다.`);
        }
      });

    try {
      await Promise.all(uploadPromises);
      toast({
        title: "파일 업로드 완료",
        description: "모든 첨부파일이 성공적으로 업로드되었습니다.",
      });
    } catch (error) {
      console.error('첨부파일 업로드 실패:', error);
      throw error;
    }
  };

  // 페이지 로드 시 게시글 초기화
  useEffect(() => {
    const initializePost = async () => {
      try {
        setIsInitializing(true);
        let postIdFromUrl = searchParams.get('postId');
        
        // URL에 postId가 없으면 로컬 스토리지에서 가져오기
        if (!postIdFromUrl) {
          const storedPostId = localStorage.getItem('currentPostId');
          if (storedPostId) {
            postIdFromUrl = storedPostId;
            // URL에 postId가 없으면 로컬 스토리지의 postId로 URL 업데이트
            window.history.replaceState(null, '', `/board/new?postId=${storedPostId}`);
          }
        }
        
        if (postIdFromUrl) {
          setPostId(parseInt(postIdFromUrl));
        } else {
          // postId가 없으면 Board로 리다이렉트
          navigate('/board');
          return;
        }
        setIsPublished(false); // 초기화 시 PUBLISHED 상태가 아님
        setIsInitializing(false);
      } catch (error) {
        console.error('게시글 초기화 실패:', error);
        setIsInitializing(false);
      }
    };

    initializePost();
  }, [searchParams, navigate]);

  // 내용 변경 감지
  useEffect(() => {
    if (title.trim() || content.trim() || attachments.length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [title, content, attachments]);

  // 브라우저 뒤로가기/앞으로가기 감지
  useEffect(() => {
    const handlePopState = async (event: PopStateEvent) => {
      // postId가 null이면 URL에서 직접 가져오기
      let currentPostId = postId;
      if (!currentPostId) {
        const postIdFromUrl = searchParams.get('postId');
        if (postIdFromUrl) {
          currentPostId = parseInt(postIdFromUrl);
        }
      }
      
      if (currentPostId && !isPublished && !isNavigatingAway) {
        // 사용자에게 확인 요청
        const confirmed = window.confirm(
          "게시글 작성 중입니다. 페이지를 나가시면 작성 중인 내용이 취소됩니다. 정말로 나가시겠습니까?"
        );
        
        if (confirmed) {
          setIsNavigatingAway(true);
          // URL에서 가져온 postId로 취소 처리
          try {
            await postAPI.cancelPostWriting(currentPostId);
            toast({
              title: "작성 취소",
              description: "게시글 작성이 취소되었습니다.",
            });
            navigate('/board');
          } catch (error) {
            console.error('게시글 취소 실패:', error);
            navigate('/board');
          }
        } else {
          // 뒤로가기를 막고 현재 페이지에 머무름
          window.history.pushState(null, '', window.location.pathname);
        }
      }
    };

    // 페이지 새로고침/닫기 감지
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (postId && !isPublished && hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = "게시글 작성 중입니다. 페이지를 나가시면 작성 중인 내용이 취소됩니다.";
        return "게시글 작성 중입니다. 페이지를 나가시면 작성 중인 내용이 취소됩니다.";
      }
    };

    // 페이지 이탈 시 자동 취소 처리
    const handlePageHide = async () => {
      if (postId && !isPublished && !isNavigatingAway) {
        try {
          await postAPI.cancelPostWriting(postId);
        } catch (error) {
          console.error('페이지 이탈 시 게시글 취소 실패:', error);
        }
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    // 초기 히스토리 상태 추가
    window.history.pushState(null, '', window.location.pathname);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [postId, isPublished, isNavigatingAway, searchParams, hasUnsavedChanges, navigate, toast]); // postId 의존성 추가

  // 게시글 작성 취소
  const handleCancelWriting = async () => {
    if (!postId) {
      navigate('/board');
      return;
    }

    // 이미 게시된 상태라면 취소 불가
    if (isPublished) {
      toast({
        title: "취소 불가",
        description: "이미 게시된 게시글은 취소할 수 없습니다.",
        variant: "destructive",
      });
      navigate('/board');
      return;
    }

    try {
      // 게시글 작성 취소
      await postAPI.cancelPostWriting(postId);
      // 로컬 스토리지에서 postId 제거
      localStorage.removeItem('currentPostId');
      toast({
        title: "작성 취소",
        description: "게시글 작성이 취소되었습니다.",
      });
      navigate('/board');
    } catch (error: any) {
      console.error('게시글 취소 실패:', error);
      console.error('에러 상세 정보:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config
      });
      
      // 에러 응답에서 상세 정보 추출
      let errorMessage = "게시글 취소에 실패했습니다.";
      
      if (error.response?.data) {
        // 백엔드에서 전달한 에러 메시지가 있으면 사용
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.message) {
        // 네트워크 에러 등
        errorMessage = error.message;
      }
      
      // 400 에러인 경우 특별한 메시지
      if (error.response?.status === 400) {
        errorMessage = "게시글이 이미 게시되어 취소할 수 없습니다.";
      }
      
      toast({
        title: "오류",
        description: errorMessage,
        variant: "destructive",
      });
      
      // 에러가 발생해도 게시판으로 이동
      navigate('/board');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!postId) {
      toast({
        title: "오류",
        description: "게시글 초기화가 완료되지 않았습니다. 페이지를 새로고침해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 첨부파일 업로드 (있는 경우)
      if (attachments.length > 0) {
        await uploadAttachments();
      }

      // 게시글 저장 (백엔드에서 PUBLISHED 상태로 변경)
      const saveResponse = await postAPI.savePost(postId, {
        title: title.trim(),
        content: content.trim()
      });

      // 저장 완료 후 처리 - 불필요한 getPost 호출 제거
      setIsPublished(true);
      setHasUnsavedChanges(false);
      setIsNavigatingAway(true); // 저장 완료 후 네비게이션 플래그 설정
      
      toast({
        title: "성공",
        description: "문서가 성공적으로 게시되었습니다.",
      });
      
      // 로컬 스토리지에서 postId 제거
      localStorage.removeItem('currentPostId');
      navigate('/board');
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "문서 작성에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center mb-8">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              className="mr-4"
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              돌아가기
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>작성을 취소하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                {hasUnsavedChanges 
                  ? "저장되지 않은 변경사항이 있습니다. 정말로 작성을 취소하시겠습니까?"
                  : "게시글 작성을 취소하시겠습니까?"
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>계속 작성</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelWriting} className="bg-destructive text-destructive-foreground">
                작성 취소
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div>
          <h1 className="text-3xl font-bold">문서 작성</h1>
          <p className="text-muted-foreground">새로운 프로젝트 문서를 작성해보세요.</p>
        </div>
      </div>

      {isInitializing ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg font-medium">게시글 작성 준비 중...</p>
            <p className="text-sm text-muted-foreground">잠시만 기다려주세요.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 파일 첨부 컴포넌트 */}
          {postId && (
            <FileAttachment
              postId={postId}
              attachments={attachments}
              onAttachmentsChange={handleAttachmentsChange}
              onAIGeneration={handleAIGeneration}
              isEditing={true}
              disabled={isSubmitting}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                기본 정보
              </CardTitle>
              <CardDescription>
                문서의 제목과 내용을 입력해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="문서 제목을 입력하세요"
                  required
                  disabled={isSubmitting}
                  maxLength={100}
                />
              </div>
              
              <div>
                <Label htmlFor="content">내용 *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="문서 내용을 입력하세요"
                  className="min-h-[300px]"
                  required
                  disabled={isSubmitting}
                  maxLength={5000}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {content.length}/5000자
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !title.trim() || !content.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                '문서 저장'
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BoardNew;