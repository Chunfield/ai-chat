import { ConfigProvider, theme } from 'antd';
import { useTheme } from './components/Chat/hooks/useTheme';
import GradientContainer from "./components/Container";

function App() {
  const { darkMode } = useTheme();
  console.log('App darkMode:', darkMode); // 调试用

  return (
    <ConfigProvider
    theme={{
      algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    }}
    >
      <GradientContainer></GradientContainer>
    </ConfigProvider>
  );
}

export default App;
