'use client';

import { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Message } from '@/types';
import Avatar from '@/components/ui/Avatar';
import { formatPrice, timeAgo } from '@/lib/utils';
import { TrendingDown } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  language: string;
}

// Group consecutive messages from the same sender within a 5‑minute window
function groupMessages(messages: Message[], currentUserId: string) {
  const groups: { msgs: Message[]; isMe: boolean }[] = [];
  let currentGroup: Message[] = [];
  let lastMsg: Message | null = null;
  for (const msg of messages) {
    if (
      lastMsg &&
      msg.sender_id === lastMsg.sender_id &&
      new Date(msg.created_at).getTime() - new Date(lastMsg.created_at).getTime() < 5 * 60 * 1000
    ) {
      currentGroup.push(msg);
    } else {
      if (currentGroup.length) {
        groups.push({ msgs: currentGroup, isMe: currentGroup[0].sender_id === currentUserId });
      }
      currentGroup = [msg];
    }
    lastMsg = msg;
  }
  if (currentGroup.length) {
    groups.push({ msgs: currentGroup, isMe: currentGroup[0].sender_id === currentUserId });
  }
  return groups;
}

export default function MessageList({ messages, currentUserId, language }: MessageListProps) {
  const grouped = useMemo(() => groupMessages(messages, currentUserId), [messages, currentUserId]);

  // Approximate row height – 80px works for most messages; adjust if needed
  const itemHeight = 80;
  const height = Math.min(grouped.length * itemHeight, 400);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const group = grouped[index];
    const first = group.msgs[0];
    const time = timeAgo(first.created_at);
    return (
      <div style={style} className={`flex flex-col ${group.isMe ? 'items-end' : 'items-start'} px-2`}>
        {!group.isMe && <Avatar name={first.sender_id} size="sm" className="mb-1" />}
        {group.msgs.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.is_offer
                ? 'bg-accent-50 border-2 border-accent-100 text-text-main shadow-xs'
                : group.isMe
                ? 'bg-primary text-white rounded-br-none'
                : 'bg-white border border-border-warm text-text-main rounded-bl-none shadow-xs'
            }`}
          >
            {msg.is_offer && (
              <div className="flex items-center gap-1 text-xs font-bold text-accent-dark mb-1">
                <TrendingDown size={14} /> মূল্য অফার: {formatPrice(msg.offer_amount || 0)}
              </div>
            )}
            <span>{msg.content}</span>
          </div>
        ))}
        <span className="text-[10px] text-text-muted mt-1 px-1">
          {language === 'bn' ? time.bn : time.en}
        </span>
      </div>
    );
  };

  return (
    <List
      height={height}
      itemCount={grouped.length}
      itemSize={itemHeight}
      width="100%"
      className="flex-1 overflow-y-auto"
    >
      {Row}
    </List>
  );
}
