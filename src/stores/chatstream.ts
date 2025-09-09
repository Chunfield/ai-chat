// src/store/chat.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Message } from "@/types";
import { API_CONFIGS, type ModelType } from "../config";

/* ---------- 全局声明：给 window._chatAbort 用 ---------- */
declare global {
  interface Window {
    _chatAbort?: AbortController | null;
  }
}

/* ---------- 类型定义 ---------- */
interface ChatState {
  messages: Message[];
  loading: boolean;
  input: string;
  currentModel: ModelType;

  setInput: (v: string) => void;
  setModel: (m: ModelType) => void;
  send: () => Promise<void>;
  regenerate: (userMessage: Message) => Promise<void>;
  abort: () => void;
}

/* ---------- 创建 store ---------- */
export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      /* 初始值 */
      messages: [{ role: "assistant", content: "你好！我是 AI，有什么可以帮你？" }],
      loading: false,
      input: "",
      currentModel: "kimi",

      /* 设置输入框与模型 */
      setInput: v => set({ input: v }),
      setModel: m => set({ currentModel: m }),

      /* 发送新消息 */
      send: async () => {
        const { input, currentModel, loading } = get();
        if (!input.trim() || loading) return;

        const userMsg: Message = { role: "user", content: input };
        const newMessages = [...get().messages, userMsg];
        set({ messages: newMessages, loading: true, input: "" });

        await fetchStream(newMessages, currentModel, set);
      },

      /* 重新生成最后一条回答 */
      regenerate: async (userMessage: Message) => {
        const { currentModel, loading } = get();
        if (loading) return;

        const newMessages = get().messages.slice(0, -1);
        set({ messages: [...newMessages, userMessage], loading: true });

        await fetchStream([...newMessages, userMessage], currentModel, set);
      },

      /* 中止流式请求 */
      abort: () => {
        window._chatAbort?.abort?.();
        set(s => ({ ...s, loading: false }));
      },
    }),
    { name: "chat-store" }
  )
);

let controller: AbortController | null = null;

async function fetchStream(
  msgs: Message[],
  model: ModelType,
  set: (fn: (s: ChatState) => Partial<ChatState>) => void
) {
  controller = new AbortController();
  window._chatAbort = controller; // 🚀 全局暴露，方便 abort

  const cfg = API_CONFIGS[model];

  try {
    const res = await fetch(cfg.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: msgs,
        stream: true,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(await res.text());

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let ai = "";

    set(s => ({ messages: [...s.messages, { role: "assistant", content: "" }] }));

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]" || !data) continue;

        try {
          const json = JSON.parse(data) as {
            choices?: Array<{ delta?: { content?: string } }>;
          };
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            ai += delta;
            set(s => {
              const msgs = [...s.messages];
              msgs[msgs.length - 1].content = ai;
              return { messages: msgs };
            });
          }
        } catch {
          /* 忽略解析错误 */
        }
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name !== "AbortError") {
      set(s => ({
        ...s,
        messages: [...s.messages, { role: "assistant", content: `错误：${err.message}` }],
      }));
    }
  } finally {
    set(s => ({ ...s, loading: false }));
    controller = null;
  }
}
