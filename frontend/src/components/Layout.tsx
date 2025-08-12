
import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AIAssistant from './AIAssistant';

interface LayoutProps {
 
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // 사이드바를 숨길 페이지들
  const hideSidebarPaths = [
    '/board/new',
    '/projects/create'
  ];
  
  // 현재 경로가 사이드바를 숨겨야 하는지 확인
  const shouldHideSidebar = hideSidebarPaths.some(path => 
    currentPath === path || currentPath.startsWith('/board/edit/')
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background w-full flex">
        {!shouldHideSidebar && <AppSidebar />}
        <div className={`flex-1 flex flex-col ${shouldHideSidebar ? 'w-full' : ''}`}>
          <header className="h-12 flex items-center border-b bg-card">
            {!shouldHideSidebar && <SidebarTrigger className="ml-2" />}
            <div className="flex-1">
              <Header />
            </div>
          </header>
          <main className="flex-1 p-4">{children}</main>
          <Footer />
          <AIAssistant />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;