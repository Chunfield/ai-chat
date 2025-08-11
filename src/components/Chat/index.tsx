import { useState, useRef, useEffect } from "react";
import { Button, Tooltip } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import clsx from "clsx";
import type { Message } from "../../types";
import MarkdownRenderer from "../MarkdownRenderer";
// DeepSeek API 配置
// const API_KEY = "";
// const API_URL = "https://api.deepseek.com/v1/chat/completions";

//Kimi API 配置
const API_KEY = "";
const API_URL = "https://api.moonshot.cn/v1/chat/completions";


function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "你好！我是 DeepSeek AI，有什么可以帮你？" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

  // ✅ 用 ref 保存最新的 messages
  const messagesRef = useRef<Message[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const sendQuestion = async (question: string) => {
    if (!question.trim() || loading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMessage: Message = { role: "user", content: question };

    // ✅ 先更新 UI
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // ✅ 发起请求（使用当前 messages + 新消息）
    await fetchWithMessages([...messagesRef.current, userMessage]);
  };

  const fetchWithMessages = async (currentMessages: Message[]) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        // body: JSON.stringify({
        //   model: "deepseek-chat",
        //   messages: currentMessages,
        //   stream: true,
        // }),
        body: JSON.stringify({
          model: "moonshot-v1-8k",
          messages: currentMessages,
          stream: true,
          temperature: 0.7,
          top_p: 1.0,
        }),

        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      // 添加空 AI 消息
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        // ✅ 检查是否被中止
        if (controller.signal.aborted) {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === "assistant") {
              last.content += "\n\n（已停止生成）";
            }
            return updated;
          });
          break;
        }

        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data:")) {
            const dataStr = line.slice(5).trim();
            if (dataStr === "[DONE]" || !dataStr) continue;
            // try {
            //   const json = JSON.parse(dataStr);
            //   const text = json.choices[0]?.delta?.content || "";
            //   aiResponse += text;

            //   // ✅ 只更新最后一条消息
            //   setMessages((prev) => {
            //     const updated = [...prev];
            //     const lastMsg = updated[updated.length - 1];
            //     if (lastMsg.role === "assistant") {
            //       lastMsg.content = aiResponse;
            //     }
            //     return updated;
            //   });
            // } 
            try {
              const json = JSON.parse(dataStr);
              const text = json.choices[0]?.delta?.content || json.choices[0]?.content || "";
              aiResponse += text;

              // ✅ 只更新最后一条消息
              setMessages((prev) => {
                const updated = [...prev];
                const lastMsg = updated[updated.length - 1];
                if (lastMsg.role === "assistant") {
                  lastMsg.content = aiResponse;
                }
                return updated;
              });
            } catch (e) {
              // 忽略
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `错误: ${err.message || "请求失败"}` },
        ]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendQuestion(input);
  };

  return (
    <div className="flex flex-col h-screen w-full p-4">
<div className="flex-1 overflow-y-auto space-y-4 p-4">
  {messages.map((msg, idx) => {
    const userMessage = idx > 0 ? messages[idx - 1] : null;
    const isAssistant = msg.role === "assistant";
    return (
      <div
        key={idx}
        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
      >
        {/* 外层容器：控制消息块整体对齐 */}
        <div className="relative flex flex-col items-end">
          {/* 气泡容器 */}
          <div
            className={clsx(
              'max-w-xl lg:max-w-3xl px-4 py-3 rounded-lg',
              'break-words',
              'prose prose-sm dark:prose-invert max-w-none',
              msg.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-black'
            )}
            style={{ wordBreak: 'break-word' }}
          >
            <MarkdownRenderer content={msg.content} />
          </div>

          {/* 按钮容器：通过 flex 和 margin 定位 */}
          {isAssistant && !loading && (
            <div className="flex items-center ml-2 mt-1">
              <Tooltip title="重新生成">
                <Button
                  type="text"
                  size="small"
                  icon={<RedoOutlined style={{ color: "black" }} />}
                  onClick={() => {
                    if (!userMessage || regeneratingIndex !== null) return;
                    setRegeneratingIndex(idx);
                    setMessages((prev) => prev.filter((_, i) => i !== idx));
                    sendQuestion(userMessage.content).finally(() =>
                      setRegeneratingIndex(null)
                    );
                  }}
                  disabled={loading || regeneratingIndex !== null}
                />
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    );
  })}
  {loading && (
    <div className="flex justify-start">
      <div className="text-black px-4 py-2">AI 正在输入...</div>
    </div>
  )}
</div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t pt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        {loading ? (
          <button
            type="button"
            onClick={() => {
              if (abortControllerRef.current) {
                abortControllerRef.current.abort();
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            停止
          </button>
        ) : (
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            发送
          </button>
        )}
      </form>
    </div>
  );
}

export default Chat;
