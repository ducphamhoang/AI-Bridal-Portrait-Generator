
import React from 'react';
import { CameraIcon } from './Icons';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <CameraIcon className="w-8 h-8 text-pink-500 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight text-center">
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
};
