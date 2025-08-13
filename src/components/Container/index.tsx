import React from 'react';
import Chat from '../Chat';

interface GradientContainerProps {
  children?: React.ReactNode;
}

const GradientContainer: React.FC<GradientContainerProps> = () => {
  return (
    <div className="relative w-screen h-screen grid place-items-center">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-rose-100 to-rose-200 dark:from-gray-900 dark:to-gray-800"></div>
      <div 
        className="
          absolute inset-y-2 inset-x-[5%] 
          bg-white dark:bg-gray-800 
          rounded-lg flex items-center justify-center
          shadow-lg
        "
      >
        <div className='w-1/5'>
          <div className='text-center text-gray-700 dark:text-gray-300'>待开发</div>
        </div>

        <div className='w-px bg-gray-200 dark:bg-gray-700 h-full'></div>

        <div className='w-4/5 h-full rounded-r-lg'>
            <Chat></Chat>
        </div>
      </div>
    </div>
  );
};

export default GradientContainer;