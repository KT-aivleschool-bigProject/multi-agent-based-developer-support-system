import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col space-y-4">
          {/* 회사 정보 */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex flex-col space-y-2 mb-4 md:mb-0">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">대표자:</span> 고라니
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">이메일:</span> gorani@devcollab.com
              </div>
            </div>
            <div className="flex flex-col space-y-2 text-sm">
              <Link 
                to="/privacy-policy" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                개인정보처리방침
              </Link>
              <Link 
                to="/terms" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                서비스 이용약관
              </Link>
            </div>
          </div>
          
          {/* 저작권 정보 */}
          <div className="text-sm text-muted-foreground text-center md:text-left">
            © 2024 DevCollab. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;