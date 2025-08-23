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
import { Bot, Send } from 'lucide-react';
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
  const endRef = useRef<HTMLDivElement>(null);
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



  // 입력창 높이 초기화
  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }
  };

  const handleSendMessage = async () => {
    const value = input.trim();
    if (!value) return;

    // 1) 사용자 메시지를 먼저 UI에 추가
    const userMsg: Message = {
      id: Date.now(),
      text: value,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
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
    // embedded 모드에서는 전체 너비 사용, 일반 모드에서는 반응형 최대 너비 설정
    const bubbleMaxWidth = embedded 
      ? 'max-w-full' 
      : 'max-w-[95%] xs:max-w-[90%] sm:max-w-[85%] md:max-w-[80%] lg:max-w-[75%] xl:max-w-[70%]';
    
    return (
      <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4 w-full`}>
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
          <p className="text-sm whitespace-pre-wrap break-words overflow-hidden leading-relaxed word-break-keep-all">
            {msg.text}
          </p>
          
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
      {/* 대화 내용 영역 - 스크롤 가능 */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 pb-20 max-w-full">
          {messages.map((m) => (
            <Bubble key={m.id} msg={m} />
          ))}
          <div ref={endRef} />
          {sending && <div className="text-xs opacity-70 mt-2">응답 생성 중…</div>}
        </div>
      </div>
      
      {/* 입력창 영역 - 하단 고정 */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-10">
        <div className="max-w-4xl mx-auto w-full">
          {!isAuthenticated ? (
            <div className="text-sm text-muted-foreground text-center">
              AI 어시스턴트를 사용하려면 <a href="/login" className="underline">로그인</a> 해주세요.
            </div>
          ) : (
            <div className="space-y-2">
              {/* 입력창과 버튼 */}
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative min-w-0">
                  <Textarea
                    ref={textareaRef}
                    placeholder="메시지를 입력하세요..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pr-10 resize-none min-h-[40px] max-h-[120px] overflow-y-auto w-full"
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

                </div>
                <Button onClick={handleSendMessage} size="sm" disabled={sending || !input.trim()}>
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
      <div className="h-full flex flex-col relative overflow-hidden">
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