import type { LoginData, LoginResponse } from "@/types/auth";

// ✅ 类型守卫：复用 ErrorResponse
function isErrorResponse(data: unknown): data is { error: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as { error?: unknown }).error === "string"
  );
}

export const login = async (data: LoginData): Promise<LoginResponse> => {
  let res: Response;
  try {
    res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include", // ✅ 关键：携带 Cookie
    });
  } catch (error) {
    throw new Error("网络连接失败，请检查网络");
  }

  let responseData: unknown;
  try {
    responseData = await res.json();
  } catch (error) {
    throw new Error("服务器响应格式错误，请稍后重试");
  }

  if (!res.ok) {
    if (isErrorResponse(responseData)) {
      throw new Error(responseData.error);
    }
    throw new Error("登录失败");
  }

  return responseData as LoginResponse;
};
