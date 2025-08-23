import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Bot, Calendar, FileText, FolderPlus, FileCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MenuButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { icon: Bot, label: 'AI 챗봇', path: '/' },
    { icon: Calendar, label: '캘린더', path: '/calendar' },
    { icon: FileText, label: '문서 게시판', path: '/board' },
    { icon: FolderPlus, label: '프로젝트 생성', path: '/projects' },
    { icon: FileCode, label: 'Swagger', path: '/swagger' },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground border-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>
      
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-background border rounded-lg shadow-lg p-2 min-w-[150px] animate-scale-in">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-left mb-1 last:mb-0 hover-scale"
              onClick={() => handleMenuClick(item.path)}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuButton;