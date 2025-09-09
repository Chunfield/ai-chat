// src/stores/authStore.ts

import { create } from "zustand";
import type { RegisterData, LoginData, User as ApiUser, ErrorResponse } from "@/types/auth";
import { register as apiRegister, login as apiLogin } from "@/lib/api/auth";

// 前端用户类型（camelCase）
interface AuthUser {
  id: number;
  username: string;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

function isErrorResponse(data: unknown): data is ErrorResponse {
  if (typeof data !== "object" || data === null || !("error" in data)) {
    return false;
  }

  const errValue = (data as { error: unknown }).error;
  return typeof errValue === "string" || errValue === null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return "网络连接失败，请检查网络";
  }

  if (typeof error === "object" && error !== null) {
    const err = error as { error?: string; message?: string };
    if (err.error) return err.error;
    if (err.message) return err.message;
  }

  return "未知错误，请稍后重试";
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  register: async (data: RegisterData) => {
    set({ loading: true, error: null });

    if (data.password !== data.confirm_password) {
      set({ error: "两次密码输入不一致", loading: false });
      return;
    }

    try {
      const response = await apiRegister(data); // ✅ 类型安全：response: { user: ApiUser }
      const apiUser = response.user;

      set({
        user: {
          id: apiUser.id,
          username: apiUser.username,
          createdAt: apiUser.created_at,
        },
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error) {
      // ✅ 直接使用 error，但在 getErrorMessage 中处理
      const errorMsg = getErrorMessage(error);
      set({ error: errorMsg, loading: false });
    }
  },

  login: async (data: LoginData) => {
    set({ loading: true, error: null });

    try {
      const response = await apiLogin(data); // ✅ 类型安全
      const apiUser = response.user;

      set({
        user: {
          id: apiUser.id,
          username: apiUser.username,
          createdAt: apiUser.created_at,
        },
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      set({ error: errorMsg, loading: false });
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, error: null });
  },

  checkAuth: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/me", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        const errorMsg = isErrorResponse(data) ? data.error : "未登录";
        throw new Error(errorMsg);
      }

      const data = (await res.json()) as { user: ApiUser };
      if (typeof data !== "object" || data === null || !("user" in data)) {
        throw new Error("用户数据格式错误");
      }

      const apiUser = data.user;

      set({
        user: {
          id: apiUser.id,
          username: apiUser.username,
          createdAt: apiUser.created_at,
        },
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        loading: false,
      });
      void error;
    }
  },

  clearError: () => set({ error: null }),
}));
