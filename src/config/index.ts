import type { Message } from "@/types";

export interface ModelConfig {
  name: string;
  apiKey: string;
  apiUrl: string;
  model: string;
  buildPayload: (messages: Message[]) => Record<string, unknown>;
}
export const API_CONFIGS = {
  kimi: {
    name: "Kimi (moonshot-v1-8k)",
    apiKey: import.meta.env.VITE_KIMI_API_KEY as string,
    apiUrl: "https://api.moonshot.cn/v1/chat/completions",
    model: "moonshot-v1-8k",
    buildPayload: (msgs: Message[]) => ({
      model: "moonshot-v1-8k",
      messages: msgs,
      stream: true,
      temperature: 0.7,
    }),
  },
  deepseek: {
    name: "DeepSeek (deepseek-chat)",
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY as string,
    apiUrl: "https://api.deepseek.com/v1/chat/completions ",
    model: "deepseek-chat",
    buildPayload: (msgs: Message[]) => ({
      model: "deepseek-chat",
      messages: msgs,
      stream: true,
      temperature: 0.7,
    }),
  },
  qwen: {
    name: "Qwen (qwen-plus)",
    apiKey: import.meta.env.VITE_QWEN_API_KEY as string,
    apiUrl: "/qwen",
    model: "qwen-plus",
    buildPayload: (messages: Message[]) => ({
      model: "qwen-plus",
      messages,
      stream: true,
      temperature: 0.7,
    }),
  },
} as const;
export type ModelType = keyof typeof API_CONFIGS;
