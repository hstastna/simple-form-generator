import { FC, ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import './globals.css';

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
        <div className="container mx-auto p-4 max-w-3xl" tabIndex={-1}>
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-lime-500 bg-clip-text text-transparent">
                Simple Form Generator
              </h1>
              <p className="text-gray-600">
                Build forms from JSON configuration for your React project!
              </p>
            </div>

            <Image
              src="/fox-image.png"
              alt="Fox mascot for the form generator"
              className="rounded-full ml-2"
              width={200}
              height={200}
              sizes="(max-width: 400px) 150px, 200px"
            />
          </header>

          {children}
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
