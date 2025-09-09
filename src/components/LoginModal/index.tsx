// components/LoginModal.tsx
import { Modal, Button, Input, Tabs, Alert } from "antd";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";

const { TabPane } = Tabs;

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

// 注册表单数据类型
interface RegisterForm {
  username: string;
  password: string;
  confirmPassword: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose }) => {
  const [activeKey, setActiveKey] = useState("login");
  const [form, setForm] = useState<RegisterForm>({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<RegisterForm & { general: string }>>({});
  const [loading, setLoading] = useState(false);

  // 从 store 获取 register 方法
  const register = useAuthStore(state => state.register);
  const login = useAuthStore(state => state.login);
  const logout = useAuthStore(state => state.logout);
  const authError = useAuthStore(state => state.error);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isAuthLoading = useAuthStore(state => state.loading);

  // 输入框变化处理
  const handleInputChange = (field: keyof RegisterForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (field === "password" || field === "confirmPassword") {
      if (form.confirmPassword && value !== form.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: "两次密码不一致" }));
      }
    }
  };

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterForm & { general: string }> = {};

    if (!form.username.trim()) {
      newErrors.username = "请输入用户名";
    } else if (form.username.length < 3) {
      newErrors.username = "用户名至少 3 个字符";
    }

    if (!form.password) {
      newErrors.password = "请输入密码";
    } else if (form.password.length < 6) {
      newErrors.password = "密码至少 6 位";
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "两次密码不一致";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交注册
  const handleRegister = async () => {
    if (activeKey === "register") {
      if (!validateForm()) return;

      setLoading(true);
      try {
        await register({
          username: form.username,
          password: form.password,
          confirm_password: form.confirmPassword,
        });
        // ✅ 注册成功：清空表单、关闭弹窗
        setForm({ username: "", password: "", confirmPassword: "" });
        onClose();
        console.log("注册成功");
      } catch (err) {
        // 错误已被 store 处理，这里可以额外处理
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
  };
  const handleLogin = async () => {
    console.log(form, "222");
    if (!form.username.trim() || !form.password) {
      setErrors({
        username: !form.username.trim() ? "请输入用户名" : "",
        password: !form.password ? "请输入密码" : "",
      });
      return;
    }

    setLoading(true);
    try {
      await login({ username: form.username, password: form.password });
      onClose(); // 登录成功关闭弹窗
    } catch (err) {
      // 错误已在 store 中处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      className="rounded-xl"
      style={{ top: 200 }}
    >
      {/* 标题 */}
      <div className="text-center text-lg font-medium mb-4">
        {activeKey === "login" ? "用户登录" : "用户注册"}
      </div>

      <Tabs activeKey={activeKey} onChange={setActiveKey} centered className="text-sm">
        <TabPane tab="登录" key="login" />
        <TabPane tab="注册" key="register" />
      </Tabs>

      <div className="p-4">
        {activeKey === "login" ? (
          <>
            {/* 用户名 */}
            <div className="mb-4">
              <div className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                用户名
              </div>
              <Input
                placeholder="请输入用户名"
                className="rounded-lg h-10"
                value={form.username}
                onChange={e => handleInputChange("username", e.target.value)}
              />
              {errors.username && (
                <div className="text-red-500 text-xs mt-1">{errors.username}</div>
              )}
            </div>

            {/* 密码 */}
            <div className="mb-4">
              <div className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">密码</div>
              <Input.Password
                placeholder="请输入密码"
                className="rounded-lg h-10"
                value={form.password}
                onChange={e => handleInputChange("password", e.target.value)}
              />
              {errors.password && (
                <div className="text-red-500 text-xs mt-1">{errors.password}</div>
              )}
            </div>

            {/* 登录按钮 */}
            <Button
              type="primary"
              className="w-full h-10 rounded-lg mt-2"
              loading={loading}
              onClick={() => void handleLogin()}
            >
              登录
            </Button>
          </>
        ) : (
          <>
            {/* 用户名 */}
            <div className="mb-4">
              <div className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                用户名
              </div>
              <Input
                placeholder="请输入用户名"
                className="rounded-lg h-10"
                value={form.username}
                onChange={e => handleInputChange("username", e.target.value)}
              />
              {errors.username && (
                <div className="text-red-500 text-xs mt-1">{errors.username}</div>
              )}
            </div>

            {/* 密码 */}
            <div className="mb-4">
              <div className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">密码</div>
              <Input.Password
                placeholder="请输入密码"
                className="rounded-lg h-10"
                value={form.password}
                onChange={e => handleInputChange("password", e.target.value)}
              />
              {errors.password && (
                <div className="text-red-500 text-xs mt-1">{errors.password}</div>
              )}
            </div>

            {/* 确认密码 */}
            <div className="mb-4">
              <div className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                确认密码
              </div>
              <Input.Password
                placeholder="请再次输入密码"
                className="rounded-lg h-10"
                value={form.confirmPassword}
                onChange={e => handleInputChange("confirmPassword", e.target.value)}
              />
              {errors.confirmPassword && (
                <div className="text-red-500 text-xs mt-1">{errors.confirmPassword}</div>
              )}
            </div>

            {/* 全局错误提示 */}
            {(authError ?? errors.general) && (
              <Alert
                message={authError ?? errors.general}
                type="error"
                showIcon
                className="mb-4"
                closable
                onClose={() => useAuthStore.setState({ error: null })}
              />
            )}

            {/* 注册按钮 */}
            <Button
              type="primary"
              className="w-full h-10 rounded-lg mt-2"
              loading={loading}
              onClick={() => void handleRegister()}
            >
              注册
            </Button>
          </>
        )}

        <div className="mt-4">
          <Button className="w-full h-10 rounded-lg" onClick={onClose}>
            取消
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;
