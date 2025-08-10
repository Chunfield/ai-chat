import { useState, useRef } from "react";
import type { Message } from "../../types";
import MarkdownRenderer from "../MarkdownRenderer";

// DeepSeek API 配置
const API_KEY = "sk-0c8c951339814c7dae821fdee5a3179d";
const API_URL = "https://api.deepseek.com/v1/chat/completions";

function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "你好！我是 DeepSeek AI，有什么可以帮你？" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [...messages, userMessage],
          stream: true, // ✅ 开启流式
        }),
        signal: controller.signal, // ✅ 关键：绑定中断信号
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`请求失败: ${response.status} ${errorText}`);
      }

      // ✅ 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      // 先添加一个空的 assistant 消息，用于后续追加内容
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        // ✅ 检查是否被中止
        if (controller.signal.aborted) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].content += "\n\n（已停止生成）";
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
            const dataStr = line.slice(5).trim(); // 去掉 "data: " 前缀

            if (dataStr === "[DONE]") {
              setLoading(false);
              return;
            }

            try {
              const json = JSON.parse(dataStr);
              const text = json.choices[0]?.delta?.content || "";

              aiResponse += text;

              // ✅ 实时更新最后一条消息（AI 正在“打字”）
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = aiResponse;
                return updated;
              });
            } catch (err) {
              // 忽略非 JSON 数据（如 ping 心跳包）
            }
          }
        }
      }
    } catch (err: any) {
      // ✅ 区分正常中断和真实错误
      if (err.name === "AbortError") {
        // 被用户中断，已处理
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `错误: ${err.message || "请求失败"}` },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex flex-col h-screen w-full  p-4">
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xl lg:max-w-xl px-4 py-2 rounded-lg ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                <MarkdownRenderer content={msg.content} />
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className=" text-black px-4 py-2">
                AI 正在输入...
              </div>
            </div>
          )}
        </div>

        {/* 输入框 */}
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
