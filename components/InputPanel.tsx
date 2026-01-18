
import React, { useRef } from 'react';
import { AppState, LearnerProfile, LearningType } from '../types';
import { LEARNER_PROFILES, LEARNING_TYPES } from '../constants';
import UploadIcon from './icons/UploadIcon';
import SparklesIcon from './icons/SparklesIcon';

// Fix: Declare pdfjsLib to inform TypeScript that it's available as a global variable.
declare const pdfjsLib: any;

interface InputPanelProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  handleGenerate: () => void;
  isLoading: boolean;
  onContentChange?: (content: string, fileName: string | null) => void;
}

const InputPanel: React.FC<InputPanelProps> = ({ appState, setAppState, handleGenerate, isLoading, onContentChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    setAppState(s => ({ ...s, fileName }));

    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let content = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          content += textContent.items.map((item: any) => item.str).join(' ');
        }
        setAppState(s => ({ ...s, lessonContent: content }));
        // Notify parent about the content change for notebook saving
        if (onContentChange) {
          onContentChange(content, fileName);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setAppState(s => ({ ...s, lessonContent: content }));
        // Notify parent about the content change for notebook saving
        if (onContentChange) {
          onContentChange(content, fileName);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 space-y-6 border border-gray-700 shadow-lg">
      <h2 className="text-xl font-bold text-white">Customize Your Learning Path</h2>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Lesson Content</label>
        <textarea
          value={appState.lessonContent}
          onChange={(e) => setAppState(s => ({ ...s, lessonContent: e.target.value }))}
          placeholder="Paste your lesson text here, or upload a file below."
          className="w-full h-40 p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-200"
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.pdf"
        />
        <button onClick={() => fileInputRef.current?.click()} className="mt-2 w-full flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
          <UploadIcon className="w-5 h-5" />
          {appState.fileName ? `File: ${appState.fileName}` : 'Upload .txt or .pdf'}
        </button>
      </div>

      <div>
        <label htmlFor="learner-profile" className="block text-sm font-medium text-gray-300 mb-2">Learner Profile</label>
        <select
          id="learner-profile"
          value={appState.learnerProfile}
          onChange={(e) => setAppState(s => ({ ...s, learnerProfile: e.target.value as LearnerProfile }))}
          className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-200"
        >
          {LEARNER_PROFILES.map(profile => <option key={profile} value={profile}>{profile}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="learning-type" className="block text-sm font-medium text-gray-300 mb-2">Learning Type</label>
        <select
          id="learning-type"
          value={appState.learningType}
          onChange={(e) => setAppState(s => ({ ...s, learningType: e.target.value as LearningType }))}
          className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-200"
        >
          {LEARNING_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="question" className="block text-sm font-medium text-gray-300 mb-2">Ask a Question (Optional)</label>
        <input
          type="text"
          id="question"
          value={appState.question}
          onChange={(e) => setAppState(s => ({ ...s, question: e.target.value }))}
          placeholder="e.g., 'What is the main idea?'"
          className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-gray-200"
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={isLoading || !appState.lessonContent}
        className="w-full flex justify-center items-center gap-2 px-4 py-3 text-base font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
      >
        <SparklesIcon className="w-5 h-5" />
        {isLoading ? 'Generating...' : 'Create My Path'}
      </button>
    </div>
  );
};

export default InputPanel;
