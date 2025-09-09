import { Input, Button } from "antd";
import { SendOutlined, StopOutlined } from "@ant-design/icons";
import { useRef, useState } from "react";
import { useChatStore } from "../../../../stores/chatstream";

export default function ChatInput() {
  const { input, loading, setInput, send, abort } = useChatStore();

  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    await send();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isComposing) return;
    const isPureEnter = e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey;
    if (isPureEnter) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <form onSubmit={e => void handleSubmit(e)} className="flex gap-2 pt-2">
      <div className="flex-1 relative border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
        <Input.TextArea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={handleKeyDown}
          variant="borderless"
          placeholder="输入你的问题（Enter 发送，Shift+Enter 换行）"
          className=" w-full px-3 py-2 dark:bg-gray-800 dark:text-white"
          style={{ paddingRight: "3.5rem", minHeight: 80, resize: "none" }}
          disabled={loading}
        />

        <div className=" bottom-2 left-0 right-0 px-3 pb-1 flex justify-end">
          {loading ? (
            <Button
              type="primary"
              danger
              icon={<StopOutlined />}
              size="middle"
              onClick={abort}
              htmlType="button"
              className="bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-800 border border-red-300 rounded-md flex items-center gap-1 px-4 py-1"
            >
              停止
            </Button>
          ) : (
            <Button
              htmlType="submit"
              type="primary"
              icon={<SendOutlined />}
              size="middle"
              className="flex items-center gap-1 px-4 py-1"
            >
              发送
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
