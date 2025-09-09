import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react({}), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/qwen": {
        target: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/qwen/, ""),
      },
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
