export const API_CONFIGS = {
    kimi: {
      name: "Kimi (moonshot-v1-8k)",
      apiKey: import.meta.env.VITE_KIMI_API_KEY,
      apiUrl: "https://api.moonshot.cn/v1/chat/completions",
      model: "moonshot-v1-8k",
    },
    deepseek: {
      name: "DeepSeek (deepseek-chat)",
      apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
      apiUrl: "https://api.deepseek.com/v1/chat/completions",
      model: "deepseek-chat",
    },
  } as const;
  
  export type ModelType = keyof typeof API_CONFIGS;
  