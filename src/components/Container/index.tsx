import React from "react";
import Chat from "../Chat";
import SideBar from "../SideBar";
interface GradientContainerProps {
  children?: React.ReactNode;
}
const GradientContainer: React.FC<GradientContainerProps> = () => {
  return (
    <div className="relative w-screen h-screen grid place-items-center">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800" />
      <div
        className="
            absolute inset-y-2 inset-x-[5%] 
            bg-white dark:bg-gray-800 
            rounded-lg flex items-center justify-center
            shadow-lg
            overflow-hidden
          "
      >
        <SideBar />
        <div className="w-px bg-gray-200 dark:bg-gray-700 h-full" />
        <div className="w-4/5 h-full">
          <Chat />
        </div>
      </div>
    </div>
  );
};

export default GradientContainer;
