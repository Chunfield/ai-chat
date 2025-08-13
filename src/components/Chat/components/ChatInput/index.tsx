import { Button } from 'antd';
import { SendOutlined, StopOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onAbort: () => void;
  loading: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  onAbort,
  loading,
}: ChatInputProps) {
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || loading) return;
    onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isComposing) return;

    const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const isEnter = e.key === 'Enter';
    const isShift = e.shiftKey;
    const isMeta = (isMac && e.metaKey) || (!isMac && e.ctrlKey);
    const isPureEnter = isEnter && !isShift && !isMeta && !e.altKey;

    if (isPureEnter) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
      <div className="flex-1 relative border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={handleKeyDown}
          placeholder="输入你的问题（Enter 发送，Shift+Enter 换行）"
          className="w-full px-3 py-2 resize-none focus:outline-none"
          style={{
            minHeight: '80px',
            padding: '0.75rem 0.75rem 3rem 0.75rem',
            border: 'none',
            outline: 'none',
            lineHeight: '1.5',
            backgroundColor: 'transparent',
          }}
          disabled={loading}
        />

        <div className="absolute bottom-2 left-0 right-0 px-3 pb-1 flex justify-end border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
          {loading ? (
            <Button
              type="primary"
              danger
              icon={<StopOutlined />}
              size="middle"
              onClick={onAbort}
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
