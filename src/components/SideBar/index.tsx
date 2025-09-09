// components/SideBar.tsx
import { Button } from "antd";
import { useState } from "react";
import LoginModal from "../LoginModal";
import { useAuthStore } from "@/stores/authStore"; // 引入 store

const SideBar = () => {
  const [open, setOpen] = useState(false);

  // 从 store 获取状态和方法
  const { isAuthenticated, user, logout } = useAuthStore();

  const showLoginModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    logout(); // 更新 store 状态
  };

  return (
    <div className="w-1/5 h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <span className="text-gray-700 dark:text-gray-300">待开发</span>
      </div>

      <div className="flex justify-center p-3">
        {/* 根据登录状态切换按钮 */}
        {isAuthenticated ? (
          <Button
            type="default" // 保持浅色背景
            danger // 红色文字和边框
            size="large"
            onClick={handleLogout}
            className="w-4/5 h-10 rounded-lg"
          >
            退出登录 ({user?.username})
          </Button>
        ) : (
          <Button
            type="primary"
            size="large"
            onClick={showLoginModal}
            className="w-4/5 h-10 rounded-lg"
          >
            立即登录
          </Button>
        )}
      </div>

      {/* 登录弹窗 */}
      <LoginModal open={open} onClose={handleCancel} />
    </div>
  );
};

export default SideBar;
