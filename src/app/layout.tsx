import { FC, ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import { FaGithub, FaLinkedin } from 'react-icons/fa6';
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
        <div className="container mx-auto p-4 pb-16 max-w-3xl" tabIndex={-1}>
          <header className="flex flex-wrap justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-green-400 to-lime-500 bg-clip-text text-transparent">
                Simple Form Generator
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Build forms from JSON configuration for your React project!
              </p>
            </div>

            <Image
              src="/fox-image.png"
              alt="Fox mascot for the form generator"
              className="rounded-full basis-full w-full h-auto sm:basis-auto sm:ml-2 sm:w-50"
              width={640}
              height={640}
              sizes="(max-width: 399px) 100vw, 200px"
              priority
            />
          </header>

          {children}

          <footer className="mt-6 flex items-center gap-6 border-t border-gray-200 pt-6 text-gray-700 dark:border-gray-700 dark:text-gray-300">
            <a
              href="https://github.com/hstastna/simple-form-generator"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="hover:text-gray-900 dark:hover:text-white"
            >
              <FaGithub aria-hidden="true" className="h-10 w-10" />
            </a>
            <a
              href="https://www.linkedin.com/in/hstastna/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="hover:text-gray-900 dark:hover:text-white"
            >
              <FaLinkedin aria-hidden="true" className="h-10 w-10" />
            </a>
          </footer>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
