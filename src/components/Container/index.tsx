import React from 'react';
import Chat from '../Chat';

interface GradientContainerProps {
  children?: React.ReactNode;
}

const GradientContainer: React.FC<GradientContainerProps> = ({ children }) => {
  return (
    <div className="relative w-screen h-screen grid place-items-center">
      <div 
        className="
          absolute top-0 left-0 w-full h-full 
          bg-gradient-to-br 
          from-rose-gold-dark 
          to-rose-gold-light
          rounded-lg
          p-6
        "
      >
        {children}
      </div>

      <div 
        className="
          absolute 
          inset-y-2 inset-x-[5%] right-2 
          bg-white 
          rounded-lg 
          flex 
          items-center 
          justify-center
        "
      >
        <Chat></Chat>
      </div>
    </div>
  );
};

export default GradientContainer;