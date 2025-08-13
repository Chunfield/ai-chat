import { useState } from 'react';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import { useChatStream } from './hooks/useChatStream';
import { useTheme } from './hooks/useTheme';
import type { ModelType } from './config';

export default function Chat() {
  const { messages, loading, send, abort, regenerate } = useChatStream();
  const { darkMode, toggleDarkMode } = useTheme();
  const [currentModel, setCurrentModel] = useState<ModelType>('kimi');
  const [input, setInput] = useState<string>('');
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);

  const handleRegenerate = (idx: number) => {
    if (loading || regeneratingIndex !== null) return;
  
    const userMessage = messages[idx - 1];
    if (!userMessage) return;
  
    setRegeneratingIndex(idx);
  
    regenerate(userMessage, currentModel).finally(() => {
      setRegeneratingIndex(null);
    });
  };
  

  const handleSubmit = () => {
    if (!input.trim()) return;
    send(input, currentModel);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full w-full dark:bg-gray-900">
      <ChatHeader
        currentModel={currentModel}
        onModelChange={setCurrentModel}
        darkMode={darkMode}
        onToggleTheme={toggleDarkMode}
      />
      <MessageList
        messages={messages}
        loading={loading}
        onRegenerate={handleRegenerate}
        regeneratingIndex={null}
      />
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        onAbort={abort}
        loading={loading}
      />
    </div>
  );
}
