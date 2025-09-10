import type { RegisterData, RegisterResponse } from "@/types/auth";
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || ("" as string);

export const register = async (data: RegisterData): Promise<RegisterResponse> => {
  const res = await fetch(API_BASE ? `${API_BASE}/api/register` : "/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const responseData = (await res.json()) as unknown;

  if (!res.ok) {
    // 类型守卫：检查是否是错误响应
    if (isErrorResponse(responseData)) {
      throw new Error(responseData.error);
    }
    throw new Error("注册失败");
  }

  return responseData as RegisterResponse;
};

// 类型守卫
function isErrorResponse(data: unknown): data is { error: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error?: unknown }).error === "string"
  );
}
