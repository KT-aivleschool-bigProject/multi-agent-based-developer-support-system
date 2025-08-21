import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Image, File, X, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface FileAttachmentProps {
  postId: number;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  isEditing?: boolean;
  disabled?: boolean;
}

// 백엔드 검증 규칙과 동일하게 설정
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'txt', 'hwp'
];

const FileAttachment = ({ postId, attachments, onAttachmentsChange, isEditing = false, disabled = false }: FileAttachmentProps) => {
  const { toast } = useToast();

  // 파일 검증 함수
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `파일 크기는 ${MAX_FILE_SIZE / (1024 * 1024)}MB 이하여야 합니다.`
      };
    }

    // 파일 타입 검증
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_FILE_TYPES.includes(extension)) {
      return {
        isValid: false,
        error: `허용되지 않는 파일 타입입니다. (${ALLOWED_FILE_TYPES.join(', ')})`
      };
    }

    return { isValid: true };
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newAttachments: Attachment[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const validation = validateFile(file);
      
      if (validation.isValid) {
        const attachment: Attachment = {
          fileId: Date.now() + Math.random(), // 임시 ID
          postId: postId,
          originalName: file.name,
          storedName: '', // 업로드 후 설정
          fileUrl: URL.createObjectURL(file),
          fileSize: file.size,
          fileType: file.type || getFileTypeFromExtension(file.name),
          createdAt: new Date().toISOString()
        };
        newAttachments.push(attachment);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    // 에러가 있으면 토스트로 표시
    if (errors.length > 0) {
      toast({
        title: "파일 검증 실패",
        description: errors.join('\n'),
        variant: "destructive",
      });
    }

    // 유효한 파일만 추가
    if (newAttachments.length > 0) {
      onAttachmentsChange([...attachments, ...newAttachments]);
    }
  };

  // 파일 확장자로부터 MIME 타입 추정
  const getFileTypeFromExtension = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'application/pdf';
      case 'doc': return 'application/msword';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xls': return 'application/vnd.ms-excel';
      case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'ppt': return 'application/vnd.ms-powerpoint';
      case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      case 'txt': return 'text/plain';
      case 'hwp': return 'application/x-hwp';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'gif': return 'image/gif';
      case 'bmp': return 'image/bmp';
      case 'webp': return 'image/webp';
      default: return 'application/octet-stream';
    }
  };

  // 파일 삭제
  const handleRemoveFile = (fileId: number) => {
    const attachment = attachments.find(att => att.fileId === fileId);
    if (attachment && attachment.fileUrl.startsWith('blob:')) {
      URL.revokeObjectURL(attachment.fileUrl);
    }
    
    const updatedAttachments = attachments.filter(att => att.fileId !== fileId);
    onAttachmentsChange(updatedAttachments);
    
    toast({
      title: "파일 삭제 완료",
      description: "파일이 삭제되었습니다.",
    });
  };

  // 파일 아이콘 반환
  const getFileIcon = (fileType: string, fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['pdf'].includes(extension || '')) {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'hwp'].includes(extension || '')) {
      return <FileText className="h-8 w-8 text-blue-500" />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
      return <Image className="h-8 w-8 text-green-500" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
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

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            첨부파일
          </CardTitle>
          <CardDescription>
            문서와 관련된 파일을 첨부하세요. (최대 10MB)
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            toast({
              title: "AI 생성",
              description: "첨부파일 기반 분석을 요청했어요.",
            })
          }
          aria-label="AI 생성"
          disabled={disabled}
        >
          <Sparkles className="h-4 w-4 mr-1" />
          AI 생성
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 파일 업로드 영역 */}
        <div 
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            텍스트를 클릭하여 파일을 선택하세요
          </p>
          
          <Input
            id="file-input"
            type="file"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            accept={ALLOWED_FILE_TYPES.map(type => `.${type}`).join(',')}
            disabled={disabled}
            className="hidden"
          />
        </div>

        {/* 첨부된 파일 목록 */}
        {attachments.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <div className="flex items-center justify-between">
              <h4 className="font-medium">첨부된 파일 ({attachments.length})</h4>
              {!disabled && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    attachments.forEach(att => {
                      if (att.fileUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(att.fileUrl);
                      }
                    });
                    onAttachmentsChange([]);
                    toast({
                      title: "모든 파일 삭제 완료",
                      description: "첨부된 모든 파일이 삭제되었습니다.",
                    });
                  }}
                >
                  전체 삭제
                </Button>
              )}
            </div>
            
            <div className="grid gap-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.fileId}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(attachment.fileType, attachment.originalName)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">
                        {attachment.originalName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatFileSize(attachment.fileSize)}</span>
                        <span>•</span>
                        <Badge variant="secondary" className="text-xs">
                          {attachment.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {!disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(attachment.fileId)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileAttachment;