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
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, Upload, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

type Sender = 'user' | 'bot';

interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  agents_used?: string[]; // center_agent 응답의 agents_use/agents_used 를 표시
  processing_time?: number;
}

// 게이트웨이 경로 기준(예시): /ai/** → FASTAPI
const ENDPOINT = 'https://fictional-space-bassoon-g4x5wgrv4rx4hjq7-8005.app.github.dev/ai/process'; // center_agent의 /ai/process

const AIAssistant: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: '안녕하세요! 팀 에이전트 시스템입니다. 무엇을 도와드릴까요?\n\n다음과 같은 요청을 해보세요:\n• "코드 리뷰를 해줘" (코드 에이전트)\n• "문서를 작성해줘" (문서 에이전트)\n• "일정을 관리해줘" (일정 에이전트)',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // 스크롤을 항상 최신 메시지로 이동
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Enter 키로 전송
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    const value = input.trim();
    if (!value || sending) return;

    // 인증 체크 (디자인은 그대로, 사용은 로그인 사용자만)
    // if (!isAuthenticated) {
    //   toast({
    //     title: '로그인이 필요합니다',
    //     description: 'AI 어시스턴트를 사용하려면 먼저 로그인하세요.',
    //     variant: 'destructive',
    //   });
    //   return;
    // }

    // 1) 사용자 메시지를 먼저 UI에 추가
    const userMsg: Message = {
      id: `${Date.now()}-user`,
      text: value,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      // 2) center_agent 로직 그대로: { message } 전송
      //    center_agent Chatbot.tsx 기준 응답 필드: response, agents_use
      const res = await api.post(ENDPOINT, { message: value });

      // 안전하게 필드 파싱(agents_use / agents_used 호환)
      const data = res.data || {};
      const botText: string = data.response ?? '(응답이 없습니다)';
      const agents: string[] = Array.isArray(data.agents_used) ? data.agents_used : undefined;
      const processingTime: number = typeof data.processing_time === 'number' ? data.processing_time : undefined;

      const botMsg: Message = {
        id: `${Date.now()}-bot`,
        text: botText,
        sender: 'bot',
        timestamp: new Date(),
        agents_used: agents,
        processing_time: processingTime,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      
      // 한 번만 뽑아서 둘 다 사용
      const cause =
        err?.response?.data?.message ??
        (Array.isArray(err?.response?.data?.detail)
          ? err.response.data.detail.map((d: any) => d?.msg ?? d).join(', ')
          : (typeof err?.response?.data?.detail === 'string'
              ? err.response.data.detail
              : (err?.message || '원인을 알 수 없습니다.')));

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
            id: `${Date.now()}-bot-error`,
            text: errorText, // ← 토스트와 동일 문구
            sender: 'bot',
            timestamp: new Date(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  
  const formatMessage = (message: Message) => {
    let formattedText = message.text;
    
    if (message.agents_used && message.agents_used.length > 0) {
      formattedText += `\n\n🤖 사용된 에이전트: ${message.agents_used.join(', ')}`;
    }
    
    if (message.processing_time) {
      formattedText += `\n⏱️ 처리 시간: ${message.processing_time}초`;
    }
    
    return formattedText;
  };

  const Bubble: React.FC<{ msg: Message }> = ({ msg }) => {
    const isUser = msg.sender === 'user';
    return (
      <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm
            ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}
        >
          {/* 본문 + 사용된 에이전트/처리시간을 한 덩어리로 출력 */}
          <div className="text-sm whitespace-pre-wrap break-words">
            {formatMessage(msg)}
          </div>

          {/* 메타 영역: 타임스탬프만 유지 (배지는 제거) */}
          <div className="mt-1 flex items-center">
            <span className="ml-auto text-xs opacity-60">
              {msg.timestamp.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* 우하단 플로팅 버튼(디자인 유지) */}
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg"
          size="icon"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </SheetTrigger>

      {/* 사이드 패널 */}
      <SheetContent side="right" className="w-[380px] sm:w-[420px] h-full flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" /> AI 어시스턴트
          </SheetTitle>
          <SheetDescription>
            개발 관련 질문이나 업무에 대해 도움을 받아보세요.
          </SheetDescription>
        </SheetHeader>

        {/* 메시지 영역 */}
        <div className="flex-1 flex flex-col min-h-0 mt-2">
          <ScrollArea className="flex-1 rounded-md border p-3">
            <div className="flex flex-col">
              {messages.map((m) => (
                <Bubble key={m.id} msg={m} />
              ))}
              <div ref={endRef} />
              {sending && (
                <div className="text-xs opacity-70 mt-2">응답 생성 중…</div>
              )}
            </div>
          </ScrollArea>

          {/* 입력 영역 */}
          <div className="mt-3">
            {!isAuthenticated ? (
              <div className="text-sm text-muted-foreground">
                AI 어시스턴트를 사용하려면 <a href="/login" className="underline">로그인</a> 해주세요.
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="질문을 입력하세요 (Enter 전송)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="sm" disabled={sending || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
            {/* 파일 업로드/문서 RAG 연동은 추후 확장 (Upload, FileText 아이콘 보존) */}
            <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
              <Upload className="h-4 w-4" /> <FileText className="h-4 w-4" />
              <span>문서 업로드(RAG)는 추후 지원 예정</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AIAssistant;