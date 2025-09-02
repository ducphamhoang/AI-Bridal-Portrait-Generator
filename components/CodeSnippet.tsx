
import React, { useState } from 'react';
import { DocumentDuplicateIcon } from './Icons';

interface CodeSnippetProps {
  language: string;
  code: string;
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({ language, code }) => {
  const [copyText, setCopyText] = useState('Copy');

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopyText('Copied!');
      setTimeout(() => setCopyText('Copy'), 2000);
    }, (err) => {
        console.error('Failed to copy text: ', err);
        setCopyText('Error');
        setTimeout(() => setCopyText('Copy'), 2000);
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg my-4 overflow-hidden relative border border-gray-700 shadow-md">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-900 text-xs">
        <span className="text-gray-400 font-semibold uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center text-gray-400 hover:text-white transition-colors duration-200 px-2 py-1 rounded"
          aria-label="Copy code to clipboard"
        >
          <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
          <span>{copyText}</span>
        </button>
      </div>
      <pre className="p-4 text-sm text-white overflow-x-auto bg-gray-800">
        <code>{code}</code>
      </pre>
    </div>
  );
};
