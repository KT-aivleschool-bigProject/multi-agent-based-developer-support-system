
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
		<div className="min-h-screen w-full bg-background flex flex-col">
			<div className="fixed top-0 left-0 right-0 z-40 bg-background border-b">
				<Header />
			</div>
			<div className="pt-16 flex-1 flex flex-col">
				<main className={`flex-1 ${disableMainScroll ? 'overflow-hidden' : ''}`}>
					{children}
				</main>
				{/* disableMainScroll이 true일 때는 푸터를 숨김 */}
				{!disableMainScroll && (
					<div className="shrink-0 mt-auto">
						<Footer />
					</div>
				)}
			</div>
			<div className="fixed bottom-4 right-4 z-50">
				<MenuButton />
			</div>
		</div>
	);
};

export default Layout;