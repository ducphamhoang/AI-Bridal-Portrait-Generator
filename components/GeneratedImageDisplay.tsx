
import React from 'react';
import { DownloadIcon, ArrowPathIcon } from './Icons';

interface GeneratedImageDisplayProps {
  imageUrl: string;
  onReset: () => void;
}

export const GeneratedImageDisplay: React.FC<GeneratedImageDisplayProps> = ({ imageUrl, onReset }) => {
  return (
    <div className="text-center animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-700 mb-4">Your Portrait is Ready!</h2>
      <div className="relative inline-block my-4">
        <img
          src={imageUrl}
          alt="Generated wedding portrait"
          className="rounded-lg shadow-2xl max-w-full h-auto md:max-h-[60vh] border-4 border-white"
        />
      </div>
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a
          href={imageUrl}
          download="bridal-portrait.png"
          className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-bold rounded-full shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
        >
          <DownloadIcon className="w-5 h-5 mr-2" />
          Download
        </a>
        <button
          onClick={onReset}
          className="inline-flex items-center justify-center px-6 py-3 bg-gray-500 text-white font-bold rounded-full shadow-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
        >
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          Create Another
        </button>
      </div>
    </div>
  );
};