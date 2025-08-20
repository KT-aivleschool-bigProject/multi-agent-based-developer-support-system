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
          : err?.message || '원인을 알 수 없습니다.');

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
    const bubbleMaxWidth = embedded ? 'max-w-full' : 'max-w-[80%]';
    return (
      <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
        <div
          className={`${bubbleMaxWidth} rounded-2xl px-4 py-2 shadow-sm ${
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
          }`}
        >
          <div className="text-sm whitespace-pre-wrap break-words">{msg.text}</div>
          <div className="mt-1 flex items-center">
            <span className="ml-auto text-xs opacity-60">{msg.timestamp.toLocaleTimeString()}</span>
          </div>
        </div>
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
        <div className="mt-3 px-2">
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
      <SheetContent side="right" className="w-[380px] sm:w-[420px] h-full flex flex-col">
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