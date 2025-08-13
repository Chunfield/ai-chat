import MessageItem from '../MessageItem';
import type { Message } from '../../../../types';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  onRegenerate: (index: number) => void;
  regeneratingIndex: number | null;
}

export default function MessageList({
  messages,
  loading,
  onRegenerate,
  regeneratingIndex,
}: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
      {messages.map((msg, idx) => {
        const isLast = idx === messages.length - 1;
        const isAssistant = msg.role === 'assistant';

        const showRegenerate = isAssistant && isLast && idx !== 0;

        return (
          <MessageItem
            key={idx}
            message={msg}
            isLast={isLast}
            loading={loading}
            regenerating={regeneratingIndex !== null}
            onRegenerate={showRegenerate ? () => {
                onRegenerate(idx);
              } : undefined}
          />
        );
      })}

      {loading && (
        <div className="flex justify-start">
          <div className="text-black dark:text-white px-4 py-2">AI 正在输入...</div>
        </div>
      )}
    </div>
  );
}
