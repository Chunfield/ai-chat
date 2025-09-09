import MessageItem from "../MessageItem";
import { useChatStore } from "../../../../stores/chatstream";

export default function MessageList() {
  /* ---------- 全局订阅 ---------- */
  const { messages, loading, regenerate } = useChatStore();

  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
      {messages.map((msg, idx) => {
        const isLast = idx === messages.length - 1;
        const isAssistant = msg.role === "assistant";
        const showRegenerate = isAssistant && isLast && idx !== 0;

        return (
          <MessageItem
            key={idx}
            message={msg}
            isLast={isLast}
            loading={loading}
            regenerating={loading && isLast} // 正在重新生成即最后一条且 loading
            onRegenerate={
              showRegenerate
                ? () => {
                    void regenerate(messages[idx - 1]);
                  }
                : undefined
            }
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
