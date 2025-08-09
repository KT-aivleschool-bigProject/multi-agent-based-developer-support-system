import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, X, Upload, FileText, Loader2 } from 'lucide-react';
import { postAPI } from '@/services/api';
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

const BoardNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postId, setPostId] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
      setHasUnsavedChanges(true);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setAttachments(attachments.filter((_, index) => index !== indexToRemove));
    setHasUnsavedChanges(true);
  };

  // 페이지 로드 시 게시글 초기화
  useEffect(() => {
    const initializePost = async () => {
      try {
        setIsInitializing(true);
        const newPostId = await postAPI.startPostWriting();
        setPostId(newPostId);
        setIsPublished(false); // 초기화 시 PUBLISHED 상태가 아님
        toast({
          title: "게시글 작성 준비 완료",
          description: "이제 게시글을 작성할 수 있습니다.",
        });
      } catch (error) {
        console.error('게시글 초기화 실패:', error);
        toast({
          title: "오류",
          description: "게시글 작성 준비에 실패했습니다. 다시 시도해주세요.",
          variant: "destructive",
        });
        navigate('/board');
      } finally {
        setIsInitializing(false);
      }
    };

    initializePost();
  }, [navigate, toast]);

  // 내용 변경 감지
  useEffect(() => {
    if (title.trim() || content.trim()) {
      setHasUnsavedChanges(true);
    }
  }, [title, content]);

  // 브라우저 뒤로가기/앞으로가기 감지
  useEffect(() => {
    const handlePopState = async (event: PopStateEvent) => {
      if (postId && !isPublished && !isNavigatingAway) {
        event.preventDefault();
        
        // 사용자에게 확인 요청
        const confirmed = window.confirm(
          "게시글 작성 중입니다. 페이지를 나가시면 작성 중인 내용이 취소됩니다. 정말로 나가시겠습니까?"
        );
        
        if (confirmed) {
          setIsNavigatingAway(true);
          await handleCancelWriting();
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
          console.log('페이지 이탈 시 게시글 자동 취소 완료');
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
  }, [postId, isPublished, hasUnsavedChanges, isNavigatingAway]);

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
      console.log('게시글 취소 시도:', { postId, isPublished });
      
      // 현재 게시글 상태 확인
      try {
        const postData = await postAPI.getPost(postId);
        console.log('현재 게시글 상태:', postData);
        
        // 게시글이 이미 PUBLISHED 상태인지 확인
        if (postData.status === 'PUBLISHED') {
          setIsPublished(true);
          toast({
            title: "취소 불가",
            description: "이미 게시된 게시글은 취소할 수 없습니다.",
            variant: "destructive",
          });
          navigate('/board');
          return;
        }
      } catch (statusError) {
        console.log('게시글 상태 확인 실패:', statusError);
        // 상태 확인에 실패해도 취소 시도는 계속
      }
      
      await postAPI.cancelPostWriting(postId);
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
      // 게시글 저장 (백엔드에서 PUBLISHED 상태로 변경)
      await postAPI.savePost(postId, {
        title: title.trim(),
        content: content.trim()
      });

      // 저장 후 게시글 상태 확인
      try {
        const postData = await postAPI.getPost(postId);
        if (postData.status === 'PUBLISHED') {
          setIsPublished(true);
          setHasUnsavedChanges(false);
          setIsNavigatingAway(true); // 저장 완료 후 네비게이션 플래그 설정
          toast({
            title: "성공",
            description: "문서가 성공적으로 게시되었습니다.",
          });
        } else {
          toast({
            title: "성공",
            description: "문서가 성공적으로 저장되었습니다.",
          });
        }
      } catch (statusError) {
        console.log('게시글 상태 확인 실패:', statusError);
        toast({
          title: "성공",
          description: "문서가 성공적으로 저장되었습니다.",
        });
      }
      
      navigate('/board');
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      toast({
        title: "오류",
        description: "문서 작성에 실패했습니다. 다시 시도해주세요.",
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              첨부파일 (선택사항)
            </CardTitle>
            <CardDescription>
              문서와 관련된 파일을 첨부하세요. (최대 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="file"
                multiple
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                disabled={isSubmitting}
              />
            </div>
            
            {attachments.length > 0 && (
              <div className="space-y-2">
                <Separator />
                <p className="text-sm font-medium">첨부된 파일:</p>
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => !isSubmitting && handleRemoveFile(index)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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