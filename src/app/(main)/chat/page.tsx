import { Suspense } from 'react';
import type { Metadata } from 'next';
import ChatListClient from './ChatListClient';

export const metadata: Metadata = {
  title: 'মেসেজসমূহ | বই লাগবে',
  description: 'ক্রেতা ও বিক্রেতার সাথে চ্যাট করুন।',
};

export default function ChatListPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">লোড হচ্ছে...</div>}>
      <ChatListClient />
    </Suspense>
  );
}
