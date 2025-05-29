// components/MainLoader.tsx
import React from 'react';

const Loader = () => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;