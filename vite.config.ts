import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react({}), tailwindcss()],
  server: {
    proxy: {
      "/qwen": {
        target: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/qwen/, ""),
      },
    },
  },
});
