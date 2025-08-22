
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import MenuButton from './MenuButton';

interface LayoutProps {
	children: React.ReactNode;
	disableMainScroll?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, disableMainScroll = false }) => {
	return (
		<div className="h-screen w-full bg-background flex flex-col overflow-hidden">
			<div className="shrink-0">
				<Header />
			</div>
			<main className={`flex-1 ${disableMainScroll ? 'overflow-hidden' : 'overflow-y-auto'}`}>
				{children}
			</main>
			<div className="shrink-0">
				<Footer />
			</div>
			<div className="fixed bottom-4 right-4 z-50">
				<MenuButton />
			</div>
		</div>
	);
};

export default Layout;