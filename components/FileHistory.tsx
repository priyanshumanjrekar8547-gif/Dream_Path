
import React from 'react';
import { FileHistoryItem } from '../types';

interface FileHistoryProps {
  history: FileHistoryItem[];
  onSelect: (item: FileHistoryItem) => void;
}

const FileHistory: React.FC<FileHistoryProps> = ({ history, onSelect }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
      <h3 className="text-lg font-bold text-white mb-4">Recent Files</h3>
      <ul className="space-y-2">
        {history.map((item, index) => (
          <li key={index}>
            <button
              onClick={() => onSelect(item)}
              className="w-full text-left p-3 bg-gray-900/50 rounded-md hover:bg-gray-700 transition-colors"
            >
              <p className="text-gray-300 truncate font-medium">{item.fileName}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileHistory;
