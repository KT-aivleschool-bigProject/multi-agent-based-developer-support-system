import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, Upload, FileText, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

// Index.tsx와 동일한 타입/로직으로 정리
type Sender = 'user' | 'ai';

interface Message {
  id: number;
  text: string;
  sender: Sender;
  timestamp: Date;
  attachments?: File[];
}

interface AIAssistantProps {
  embedded?: boolean; // true면 시트 없이 본문만 렌더
}

// 게이트웨이 경로 기준(예시): /ai/** → FASTAPI
const ENDPOINT = 'https://cautious-succotash-v57pwv5v676hw4rx-8003.app.github.dev/ai/process'; // center_agent의 /ai/process

const AIAssistant: React.FC<AIAssistantProps> = ({ embedded = false }) => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: '안녕하세요! AI 어시스턴트입니다. 개발 관련 질문이나 업무에 대해 도움이 필요하시면 언제든 말씀해주세요.',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 스크롤을 항상 최신 메시지로 이동
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Enter 키로 전송, Shift+Enter로 줄바꿈
  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 파일 선택 처리
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files);
    setAttachments(prev => [...prev, ...newFiles]);
    
    // 토스트 알림
    newFiles.forEach(file => {
      toast({
        title: "파일 업로드 완료",
        description: `${file.name}이 업로드되었습니다.`,
      });
    });
  };

  // 파일 제거
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // 입력창 높이 초기화
  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }
  };

  const handleSendMessage = async () => {
    const value = input.trim();
    if (!value && attachments.length === 0) return;

    // 1) 사용자 메시지를 먼저 UI에 추가
    let messageText = value;
    if (attachments.length > 0) {
      messageText += attachments.map(file => ` [첨부파일: ${file.name}]`).join('');
    }

    const userMsg: Message = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setSending(true);
    
    // 입력창 높이 초기화
    resetTextareaHeight();

    try {
      // 2) center_agent 로직: { message } 전송
      const res = await api.post(ENDPOINT, { message: value });

      // 3) 안전하게 필드 파싱 후 본문에 합쳐 출력
      const data = res.data || {};
      const botText: string = data.response ?? '(응답이 없습니다)';
      const agents: string[] | undefined = Array.isArray(data.agents_used ?? data.agents_use)
        ? (data.agents_used ?? data.agents_use)
        : undefined;
      const processingTime: number | undefined =
        typeof data.processing_time === 'number' ? data.processing_time : undefined;

      let composed = botText;
      if (agents && agents.length > 0) {
        composed += `\n\n🤖 사용된 에이전트: ${agents.join(', ')}`;
      }
      if (typeof processingTime === 'number') {
        composed += `\n⏱️ 처리 시간: ${processingTime}초`;
      }

      const botMsg: Message = {
        id: Date.now() + 1,
        text: composed,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);

      const cause =
        err?.response?.data?.message ??
        (Array.isArray(err?.response?.data?.detail)
          ? err.response.data.detail.map((d: any) => d?.msg ?? d).join(', ')
          : typeof err?.response?.data?.detail === 'string'
          ? err.response.data.detail
          : err.message || '원인을 알 수 없습니다.');

      const errorText = `서버와 통신이 실패했습니다: ${cause}\n잠시 후 다시 시도해 주세요.`;

      // 토스트 알림
      toast({
        title: '요청 실패',
        description: errorText,
        variant: 'destructive',
      });

      // 오류도 메시지로 표시
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          text: errorText,
          sender: 'ai',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const Bubble: React.FC<{ msg: Message }> = ({ msg }) => {
    const isUser = msg.sender === 'user';
    const bubbleMaxWidth = embedded ? 'max-w-full' : 'max-w-[85%]';
    
    return (
      <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        {msg.sender === 'ai' && (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
        <div
          className={`${bubbleMaxWidth} rounded-lg p-3 ${
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
          
          {/* 첨부파일 표시 */}
          {msg.attachments && msg.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {msg.attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-xs bg-black/10 rounded px-2 py-1">
                  <FileText className="h-3 w-3" />
                  <span className="truncate">{file.name}</span>
                  <span className="text-xs opacity-70">({(file.size / 1024).toFixed(1)}KB)</span>
                </div>
              ))}
            </div>
          )}
          
          <p className="text-xs opacity-70 mt-1">
            {msg.timestamp.toLocaleTimeString()}
          </p>
        </div>
        {msg.sender === 'user' && (
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium">U</span>
          </div>
        )}
      </div>
    );
  };

  const Panel = (
    <div className="w-full h-full flex flex-col">
      <div className="px-2 pb-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Bot className="h-4 w-4" /> AI 어시스턴트
        </div>
        <div className="text-xs text-muted-foreground">개발 관련 질문이나 업무에 대해 도움을 받아보세요.</div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className={embedded ? 'flex-1 p-4' : 'flex-1 rounded-md border p-3'}>
          <div className="flex flex-col">
            {messages.map((m) => (
              <Bubble key={m.id} msg={m} />
            ))}
            <div ref={endRef} />
            {sending && <div className="text-xs opacity-70 mt-2">응답 생성 중…</div>}
          </div>
        </ScrollArea>
        
        {/* 입력창 영역 */}
        <div className="mt-3 px-2 pb-4">
          {!isAuthenticated ? (
            <div className="text-sm text-muted-foreground">
              AI 어시스턴트를 사용하려면 <a href="/login" className="underline">로그인</a> 해주세요.
            </div>
          ) : (
            <div className="space-y-2">
              {/* 첨부파일 표시 영역 */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{file.name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeAttachment(index)}
                        className="ml-auto h-auto p-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 입력창과 버튼 */}
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    placeholder="메시지를 입력하세요... (Shift+Enter로 줄바꿈)"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pr-10 resize-none min-h-[40px] max-h-[120px] overflow-y-auto"
                    rows={1}
                    style={{
                      height: '40px',
                      minHeight: '40px',
                      maxHeight: '120px'
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                    }}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                    id="file-input"
                  />
                  <label htmlFor="file-input">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <span className="cursor-pointer">
                        <Upload className="h-4 w-4" />
                      </span>
                    </Button>
                  </label>
                </div>
                <Button onClick={handleSendMessage} size="sm" disabled={sending || (!input.trim() && attachments.length === 0)}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <div className="h-full flex flex-col">
        {Panel}
      </div>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* 우하단 플로팅 버튼 */}
      <SheetTrigger asChild>
        <Button className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg" size="icon">
          <Bot className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      {/* 사이드 패널 */}
      <SheetContent side="right" className="w-[450px] sm:w-[500px] h-full flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" /> AI 어시스턴트
          </SheetTitle>
          <SheetDescription>개발 관련 질문이나 업무에 대해 도움을 받아보세요.</SheetDescription>
        </SheetHeader>
        {Panel}
      </SheetContent>
    </Sheet>
  );
};

export default AIAssistant;