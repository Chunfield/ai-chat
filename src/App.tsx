import GradientContainer from "./components/Container";
import { ConfigProvider, theme } from "antd";
import { useThemeStore } from "./stores/theme";
import { useAuthStore } from "./stores/authStore";
import { useEffect } from "react";

function App() {
  const currentTheme = useThemeStore(s => s.currentTheme);
  const checkAuth = useAuthStore(s => s.checkAuth);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 4,
        },
      }}
    >
      <GradientContainer />
    </ConfigProvider>
  );
}

export default App;
