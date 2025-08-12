import React from 'react';
import Chat from '../Chat';

interface GradientContainerProps {
  children?: React.ReactNode;
}

const GradientContainer: React.FC<GradientContainerProps> = ({ children }) => {
  return (
    <div className="relative w-screen h-screen grid place-items-center">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-rose-gold-dark to-rose-gold-lightrounded-lgp-6">
        {children}
      </div>

      <div className="absolute inset-y-2 inset-x-[5%] right-2 bg-white rounded-lg flex items-center justify-center">
        <div className='w-1/5'>
          <div className='text-center'>待开发</div>
        </div>

        <div className="w-px bg-gray-200 h-full"></div>

        <div className='w-4/5 bg-gray-100 h-full rounded-r-lg'>
            <Chat/>
        </div>
      </div>
    </div>
  );
};

export default GradientContainer;