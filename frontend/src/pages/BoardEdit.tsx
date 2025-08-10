import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, X, Upload, FileText, Loader2, Trash2 } from 'lucide-react';
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

interface Post {
  postId: number;
  title: string;
  content: string;
  userId: number;
  userName?: string;
  createdAt: string;
  viewCount: number;
}

const BoardEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalTitle, setOriginalTitle] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [originalAttachments, setOriginalAttachments] = useState<Attachment[]>([]);

  // 게시글 정보 가져오기
  const fetchPost = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const postData = await postAPI.getPost(parseInt(id));
      setPost(postData);
      setTitle(postData.title || '');
      setContent(postData.content || '');
      setOriginalTitle(postData.title || '');
      setOriginalContent(postData.content || '');
      
      // 첨부파일 정보 가져오기
      try {
        const attachmentsData = await attachmentAPI.getFilesByPostId(parseInt(id));
        setAttachments(attachmentsData);
        setOriginalAttachments(attachmentsData);
      } catch (error) {
        console.error('첨부파일 조회 실패:', error);
        // 첨부파일 조회 실패는 게시글 편집에 영향을 주지 않음
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

  // 첨부파일 변경 처리
  const handleAttachmentsChange = (newAttachments: Attachment[]) => {
    setAttachments(newAttachments);
    setHasUnsavedChanges(true);
  };

  // 첨부파일 업로드 처리
  const uploadNewAttachments = async (): Promise<void> => {
    const newAttachments = attachments.filter(att => att.fileUrl.startsWith('blob:'));
    if (newAttachments.length === 0) return;

    const uploadPromises = newAttachments.map(async (attachment) => {
      try {
        // blob URL에서 File 객체 추출
        const response = await fetch(attachment.fileUrl);
        const file = await response.blob();
        const fileName = attachment.originalName;
        
        // File 객체 생성
        const fileObj = new File([file], fileName, { type: attachment.fileType });
        
        // 실제 업로드
        const uploadedAttachment = await attachmentAPI.uploadFile(fileObj, parseInt(id!));
        
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
        description: "새로 추가된 첨부파일이 성공적으로 업로드되었습니다.",
      });
    } catch (error) {
      console.error('첨부파일 업로드 실패:', error);
      throw error;
    }
  };

  // 첨부파일 삭제 처리
  const deleteRemovedAttachments = async (): Promise<void> => {
    const removedAttachments = originalAttachments.filter(
      original => !attachments.some(current => current.fileId === original.fileId)
    );

    if (removedAttachments.length === 0) return;

    const deletePromises = removedAttachments.map(async (attachment) => {
      try {
        await attachmentAPI.deleteFile(attachment.fileId);
      } catch (error) {
        console.error('파일 삭제 실패:', error);
        throw new Error(`${attachment.originalName} 삭제에 실패했습니다.`);
      }
    });

    try {
      await Promise.all(deletePromises);
      toast({
        title: "파일 삭제 완료",
        description: "제거된 첨부파일이 성공적으로 삭제되었습니다.",
      });
    } catch (error) {
      console.error('첨부파일 삭제 실패:', error);
      throw error;
    }
  };

  // 내용 변경 감지
  useEffect(() => {
    const titleChanged = title !== originalTitle;
    const contentChanged = content !== originalContent;
    const attachmentsChanged = JSON.stringify(attachments) !== JSON.stringify(originalAttachments);
    
    if (titleChanged || contentChanged || attachmentsChanged) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [title, content, attachments, originalTitle, originalContent, originalAttachments]);

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
      toast({
        title: "오류",
        description: "게시글 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 편집 취소
  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "저장되지 않은 변경사항이 있습니다. 정말로 편집을 취소하시겠습니까?"
      );
      if (!confirmed) return;
    }
    navigate(`/board/${id}`);
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

    setIsSubmitting(true);

    try {
      // 첨부파일 처리
      await deleteRemovedAttachments();
      await uploadNewAttachments();

      // 게시글 수정
      await postAPI.savePost(parseInt(id!), {
        title: title.trim(),
        content: content.trim()
      });

      toast({
        title: "성공",
        description: "게시글이 성공적으로 수정되었습니다.",
      });
      
      navigate(`/board/${id}`);
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "게시글 수정에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          onClick={handleCancelEdit}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          돌아가기
        </Button>
        
        <div className="flex space-x-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>게시글을 삭제하시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  이 작업은 되돌릴 수 없습니다. 게시글과 관련된 모든 데이터가 영구적으로 삭제됩니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">문서 수정</h1>
        <p className="text-muted-foreground">기존 문서를 수정하세요.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              기본 정보
            </CardTitle>
            <CardDescription>
              문서의 제목과 내용을 수정해주세요.
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

        {/* 파일 첨부 컴포넌트 */}
        <FileAttachment
          postId={parseInt(id!)}
          attachments={attachments}
          onAttachmentsChange={handleAttachmentsChange}
          isEditing={true}
          disabled={isSubmitting}
        />

        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancelEdit}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                수정 중...
              </>
            ) : (
              '수정 완료'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BoardEdit;
