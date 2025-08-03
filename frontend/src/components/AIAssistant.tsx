import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, Upload, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIAssistant = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: user?.role === 'team_leader' 
        ? "안녕하세요! AI 어시스턴트입니다. 개발 관련 질문이나 업무에 대해 도움이 필요하시면 언제든 말씀해주세요. 팀장님은 프로젝트 계획서를 업로드하여 프로젝트와 팀을 자동 생성할 수 있습니다."
        : "안녕하세요! AI 어시스턴트입니다. 개발 관련 질문이나 업무에 대해 도움이 필요하시면 언제든 말씀해주세요.",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast({
        title: "파일 업로드 완료",
        description: `${file.name}이 업로드되었습니다.`,
      });
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() && !uploadedFile) return;

    let messageText = inputValue;
    
    if (uploadedFile && user?.role === 'team_leader') {
      messageText += uploadedFile ? ` [첨부파일: ${uploadedFile.name}]` : '';
    }

    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // AI 응답 시뮬레이션
    setTimeout(() => {
      let aiResponseText = "죄송합니다. 현재 AI 기능은 개발 중입니다. 곧 더 나은 서비스로 찾아뵙겠습니다!";
      
      if (uploadedFile && user?.role === 'team_leader') {
        aiResponseText = `프로젝트 계획서 "${uploadedFile.name}"을 분석했습니다. 다음과 같이 프로젝트와 팀을 생성하겠습니다:

📋 **프로젝트 정보**
- 프로젝트명: 새로운 웹 애플리케이션
- 예상 기간: 5주
- 필요 인력: 프론트엔드 개발자 2명, 백엔드 개발자 2명, 디자이너 1명

👥 **팀 구성 제안**
- 팀장: ${user.username} (현재 사용자)
- 필요 역할: Frontend Developer, Backend Developer, UI/UX Designer

🚀 **다음 단계**
1. 팀 멤버 초대
2. 개발 환경 설정
3. 프로젝트 일정 계획

프로젝트를 생성하시겠습니까?`;
        setUploadedFile(null);
      }
      
      const aiResponse: Message = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);

    toast({
      title: "메시지 전송됨",
      description: "AI가 응답을 준비하고 있습니다.",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-6 right-6 z-50 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 rounded-full w-14 h-14 p-0"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI 어시스턴트
          </DialogTitle>
          <DialogDescription>
            개발 관련 질문이나 업무에 대해 도움을 받아보세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col gap-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="space-y-2">
            {user?.role === 'team_leader' && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">팀장 전용: 프로젝트 계획서 업로드</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="ghost" size="sm" asChild>
                    <span className="cursor-pointer">
                      <Upload className="h-3 w-3" />
                    </span>
                  </Button>
                </label>
                {uploadedFile && (
                  <span className="text-xs text-primary">{uploadedFile.name}</span>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                placeholder="메시지를 입력하세요..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistant;