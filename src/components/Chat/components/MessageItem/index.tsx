import { Button, Tooltip } from "antd";
import { RedoOutlined } from "@ant-design/icons";
import clsx from "clsx";
import MarkdownRenderer from "../../../MarkdownRenderer";
import type { Message } from "../../../../types";

interface MessageItemProps {
  message: Message;
  isLast: boolean;
  loading: boolean;
  onRegenerate?: () => void;
  regenerating: boolean;
}

export default function MessageItem({
  message,
  loading,
  onRegenerate,
  regenerating,
}: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="relative flex flex-col items-end max-w-full">
        <div
          className={clsx(
            "px-4 py-3 rounded-lg break-words prose prose-sm max-w-none",
            "dark:prose-invert",
            isUser
              ? "bg-blue-500 text-white max-w-xl lg:max-w-3xl"
              : "bg-gray-200 dark:bg-gray-800 text-black dark:text-white w-full max-w-4xl"
          )}
        >
          <MarkdownRenderer content={message.content} />
        </div>

        {!isUser && !loading && onRegenerate && (
          <div className="flex items-center ml-2 mt-1">
            <Tooltip title="重新生成">
              <Button
                type="text"
                size="small"
                icon={<RedoOutlined />}
                onClick={onRegenerate}
                disabled={regenerating}
                className="dark:text-white"
              />
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}
