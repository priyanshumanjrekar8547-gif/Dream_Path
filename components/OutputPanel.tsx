
import React from 'react';
import { marked } from 'marked';
import { OutputType, FlashCard, QuizQuestion, GamePair } from '../types';
import Spinner from './Spinner';
import FlashcardView from './FlashcardView';
import QuizView from './QuizView';
import GameView from './GameView';
import SparklesIcon from './icons/SparklesIcon';

interface OutputPanelProps {
  output: OutputType | null;
  isLoading: boolean;
  error: string | null;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ output, isLoading, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Spinner />
          <p className="mt-4 text-lg text-gray-400">Your personalized path is being created...</p>
          <p className="text-sm text-gray-500">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>;
    }

    if (!output) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <SparklesIcon className="w-16 h-16 text-indigo-500 mb-4" />
            <h3 className="text-2xl font-bold text-white">Your Learning Path Awaits</h3>
            <p className="mt-2 text-gray-400 max-w-md">Fill in the details on the left and click "Create My Path" to see the magic happen.</p>
        </div>
      );
    }

    switch (output.type) {
      case 'lesson':
        const htmlContent = marked.parse(output.data as string);
        return <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-strong:text-indigo-400 prose-blockquote:border-indigo-500" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
      case 'flashcards':
        return <FlashcardView cards={output.data as FlashCard[]} />;
      case 'quiz':
        return <QuizView questions={output.data as QuizQuestion[]} />;
      case 'game':
        return <GameView pairs={output.data as GamePair[]} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 sm:p-8 border border-gray-700 shadow-lg min-h-[600px] flex flex-col">
      {renderContent()}
    </div>
  );
};

export default OutputPanel;
