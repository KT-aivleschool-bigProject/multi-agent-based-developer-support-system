
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AIAssistant from './AIAssistant';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background w-full flex">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-12 flex items-center border-b bg-card">
            <SidebarTrigger className="ml-2" />
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