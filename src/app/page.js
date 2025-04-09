'use client';

import NoteApp from '@/components/NoteApp';

export default function Home() {
  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold mb-4 text-blue-400 flex items-center justify-center">
          Mini Note-Taking
        </h1>
        <NoteApp />
      </div>
    </div>
  );
}