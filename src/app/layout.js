// app/layout.js
import { Inter } from 'next/font/google';
import '../global.css';
// Import Font Awesome CSS (make sure @fortawesome/fontawesome-free is installed)
import '@fortawesome/fontawesome-free/css/all.min.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Mini Note-Taking (Next.js)',
  description: 'A simple note-taking app built with Next.js and SQLite',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen p-4 md:p-6 bg-gray-900 text-white`}>
        <div className="max-w-xl mx-auto">
            <h1 className="text-xl md:text-2xl font-bold mb-4 text-blue-400 flex items-center justify-center">
                Mini Note-Taking (Next.js)
            </h1>
            {children}
        </div>
      </body>
    </html>
  );
}
