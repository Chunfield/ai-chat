export interface RegisterData {
  username: string;
  password: string;
  confirm_password: string;
}

export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface LoginResponse {
  token?: string;
  user: User;
}
export interface RegisterResponse {
  message: string;
  user: User;
}
export interface ErrorResponse {
  error?: string;
}
export interface LoginData {
  username: string;
  password: string;
}
export type MeResponse = {
  user: User;
};
