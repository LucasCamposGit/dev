import '../global.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Mini Note-Taking',
  description: 'A simple note-taking app built with Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" 
          rel="stylesheet" 
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}