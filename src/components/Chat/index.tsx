import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";

export default function Chat() {
  return (
    <div className="flex flex-col h-full w-full  dark:bg-gray-900 bg-white">
      <ChatHeader />
      <MessageList />
      <ChatInput />
    </div>
  );
}
