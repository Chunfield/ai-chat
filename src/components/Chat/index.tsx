import { useState, useRef, useEffect } from "react";
import { Button, Tooltip, Input, Dropdown, Menu } from 'antd';
import { RedoOutlined, DownOutlined, MoonOutlined, SendOutlined,StopOutlined } from '@ant-design/icons';
import clsx from "clsx";
import type { Message } from "../../types";
import MarkdownRenderer from "../MarkdownRenderer";

const { TextArea } = Input;

const API_CONFIGS = {
  kimi: {
    name: "Kimi (moonshot-v1-8k)",
    apiKey: "sk-",
    apiUrl: "https://api.moonshot.cn/v1/chat/completions",
    model: "moonshot-v1-8k",
  },
  deepseek: {
    name: "DeepSeek (deepseek-chat)",
    apiKey: "sk-",
    apiUrl: "https://api.deepseek.com/v1/chat/completions",
    model: "deepseek-chat",
  },
} as const;

type ModelType = keyof typeof API_CONFIGS;

function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "你好！我是 AI，有什么可以帮你？" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<ModelType>("kimi");
  const [isComposing, setIsComposing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

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

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    await fetchWithMessages([...messagesRef.current, userMessage],currentModel);
  };

  const fetchWithMessages = async (currentMessages: Message[],model: ModelType) => {
    const config = API_CONFIGS[model];
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(config.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
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

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
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
            const dataStr = line.slice(5).trim();
            if (dataStr === "[DONE]" || !dataStr) continue;
            try {
              const json = JSON.parse(dataStr);
              const delta = json.choices[0]?.delta;
              const finishReason = json.choices[0]?.finish_reason;
  
              if (delta?.content) {
                aiResponse += delta.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last.role === "assistant") {
                    last.content = aiResponse;
                  }
                  return updated;
                });
              }
  
              if (finishReason) {
                return;
              }
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
  const menu = (
    <Menu
      selectedKeys={[currentModel]}
      onClick={({ key }) => setCurrentModel(key as ModelType)}
    >
      <Menu.Item key="kimi">{API_CONFIGS.kimi.name}</Menu.Item>
      <Menu.Item key="deepseek">{API_CONFIGS.deepseek.name}</Menu.Item>
    </Menu>
  );

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between items-center bg-white rounded-tr-lg border-b border-gray-200 px-4 py-3 mb-4  sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-medium">
            当前模型:
          </span>
          <Dropdown overlay={menu} trigger={['click']}>
            <Button type="text" className="flex items-center px-2 py-1 hover:bg-gray-100 rounded">
              <span>{API_CONFIGS[currentModel].name}</span>
              <DownOutlined className="text-xs ml-1" />
            </Button>
          </Dropdown>
        </div>
        <Button
          type="text"
          icon={<MoonOutlined />}
          className="text-gray-600 hover:text-gray-800"
        >
          切换主题
        </Button>
      </div>
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
                    'px-4 py-3 rounded-lg',
                    'break-words',
                    'prose prose-sm dark:prose-invert max-w-none',
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white max-w-xl lg:max-w-3xl'
                      : 'bg-white text-black w-full max-w-4xl'
                  )}
                  style={{ wordBreak: 'break-word' }}
                >
                  <MarkdownRenderer content={msg.content} />
                </div>

                {/* 按钮容器：通过 flex 和 margin 定位 */}
                {isAssistant && !loading && idx > 0 && (
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
      <form onSubmit={handleSubmit} className="flex gap-2 pt-2">
  <div
    className="flex-1 relative border border-gray-300 rounded-lg bg-white overflow-hidden"
    style={{ minHeight: '80px' }}
  >
    {/* TextArea 占满主体，预留底部空间 */}
    <TextArea
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onCompositionStart={() => setIsComposing(true)}
      onCompositionEnd={() => setIsComposing(false)}
      onKeyDown={(e) => {
        if (isComposing) return;
        const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
        if (
          e.key === 'Enter' &&
          !e.shiftKey &&
          !(isMac && e.metaKey) &&
          !e.ctrlKey &&
          !e.altKey
        ) {
          e.preventDefault();
          handleSubmit(e);
        }
      }}
      placeholder="输入你的问题（Enter 发送，Shift+Enter 换行）"
      autoSize={{ minRows: 3, maxRows: 6 }}
      className="px-3 py-2"
      style={{
        padding: '0.75rem 0.75rem 3rem 0.75rem',
        border: 'none',
        outline: 'none',
        resize: 'none',
        lineHeight: '1.5',
      }}
      disabled={loading}
    />
    <div
      className="absolute bottom-2 left-0 right-0 px-2 pt-1 bg-white flex justify-end items-center"
      style={{
        height: '2.5rem',
        backgroundColor: loading ? '#f5f5f5' : '#fff',
        transition: 'background-color 0.2s',
      }}
    >
      {loading ? (
        <Button
          type="primary"
          danger
          icon={<StopOutlined />}
          size="middle"
          onClick={() => abortControllerRef.current?.abort()}
          className="bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-800 
          border border-red-300 rounded-md transition-all duration-150
          flex items-center gap-1 px-4 py-1"
        >
          停止
        </Button>
      ) : (
        <Button
          htmlType="submit"
          type="primary"
          size="middle"
          icon={<SendOutlined />}
        >
          发送
        </Button>
      )}
    </div>
  </div>
</form>
    </div>
  );
}

export default Chat;
