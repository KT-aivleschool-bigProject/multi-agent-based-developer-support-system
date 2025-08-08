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

const BoardNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postId, setPostId] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setAttachments(attachments.filter((_, index) => index !== indexToRemove));
  };

  // 페이지 로드 시 게시글 초기화
  useEffect(() => {
    const initializePost = async () => {
      try {
        setIsInitializing(true);
        const newPostId = await postAPI.startPostWriting();
        setPostId(newPostId);
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
      // 게시글 저장
      await postAPI.savePost(postId, {
        title: title.trim(),
        content: content.trim()
      });

      toast({
        title: "성공",
        description: "문서가 성공적으로 작성되었습니다.",
      });
      
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
        <Button 
          variant="ghost" 
          onClick={() => navigate('/board')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          돌아가기
        </Button>
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

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/board')}
            disabled={isSubmitting}
          >
            취소
          </Button>
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