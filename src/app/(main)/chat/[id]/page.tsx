import { Suspense } from 'react';
import type { Metadata } from 'next';
import ChatConversationClient from './ChatConversationClient';

export const metadata: Metadata = {
  title: 'মেসেজ | বই লাগবে',
  description: 'লাইভ চ্যাটে বিক্রেতা বা ক্রেতার সাথে কথা বলুন।',
};

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatConversationPage({ params }: ChatPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">লোড হচ্ছে...</div>}>
      <ChatConversationClient conversationId={id} />
    </Suspense>
  );
}
