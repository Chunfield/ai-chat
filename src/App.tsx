import GradientContainer from "./components/Container";
import { ConfigProvider, theme } from "antd";
import { useThemeStore } from "./store/theme";

function App() {
  const currentTheme = useThemeStore(s => s.currentTheme);

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
