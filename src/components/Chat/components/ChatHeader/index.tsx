import { Button, Dropdown, Menu } from 'antd';
import { MoonOutlined, SunOutlined, DownOutlined } from '@ant-design/icons';
import type { ModelType } from '../../config';
import { API_CONFIGS } from '../../config';

interface ChatHeaderProps {
  currentModel: ModelType;
  onModelChange: (model: ModelType) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function ChatHeader({
  currentModel,
  onModelChange,
  darkMode,
  onToggleTheme,
}: ChatHeaderProps) {
  const menu = (
    <Menu
      selectedKeys={[currentModel]}
      onClick={({ key }) => onModelChange(key as ModelType)}
    >
      <Menu.Item key="kimi">{API_CONFIGS.kimi.name}</Menu.Item>
      <Menu.Item key="deepseek">{API_CONFIGS.deepseek.name}</Menu.Item>
    </Menu>
  );

  return (
    <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-tr-lg border-b border-gray-200 dark:border-gray-700 px-4 py-3 mb-4 sticky top-0 z-10">
      <div className="flex items-center space-x-2">
        <span className="text-gray-700 dark:text-gray-200 font-medium">
          当前模型:
        </span>
        <Dropdown overlay={menu} trigger={['click']}>
          <Button
            type="text"
            className="flex items-center px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <span className="dark:text-white">{API_CONFIGS[currentModel].name}</span>
            <DownOutlined className="text-xs ml-1 dark:text-gray-300" />
          </Button>
        </Dropdown>
      </div>

      <Button
        type="text"
        icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
        onClick={onToggleTheme}
      >
        {darkMode ? '亮色主题' : '暗色主题'}
      </Button>
    </div>
  );
}
