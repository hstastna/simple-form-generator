import { FC, ReactNode } from 'react';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Simple Form Generator',
  description: 'Generate forms based on JSON configuration',
};

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: '#22c55e',
  width: 'device-width',
};

type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main
          id="main-content"
          className="container mx-auto p-4 max-w-3xl"
          tabIndex={-1}
        >
          {children}
        </main>
      </body>
    </html>
  );
};

export default RootLayout;
