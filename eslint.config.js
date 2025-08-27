import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default tseslint.config(
  { ignores: ["dist", "node_modules", ".git", "*.config.*"] },

  // 1. 语言基础
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked, // 类型感知
  prettierConfig, // 必须放最后，关闭冲突规则

  // 2. React / TS 专用
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
      prettier: prettierPlugin,
    },
    rules: {
      // React 17+
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",

      // Hooks
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // a11y
      ...jsxA11y.configs.recommended.rules,

      // Prettier 报 error，让 CI 卡住
      "prettier/prettier": "error",

      // TypeScript 相关
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "react/self-closing-comp": [
        "error",
        {
          component: true,
          html: true,
        },
      ],
    },
    settings: { react: { version: "detect" } },
  }
);
