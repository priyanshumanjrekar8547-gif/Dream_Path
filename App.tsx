
import React, { useState, useCallback, useEffect } from 'react';
import { LearnerProfile, LearningType, AppState, OutputType, FileHistoryItem } from './types';
import { adaptContent, generateFlashCards, generateQuiz, generateGame, generateImageForConcept } from './services/geminiService';
import { notebookService } from './services/notebookService';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import OutputPanel from './components/OutputPanel';
import FileHistory from './components/FileHistory';
import Notebooks from './components/Notebooks';
import { useAuth } from './hooks/useAuth';
import LoginPage from './components/LoginPage';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    lessonContent: '',
    learnerProfile: LearnerProfile.ADHD,
    learningType: LearningType.LESSON,
    question: '',
    fileName: null
  });
  const [output, setOutput] = useState<OutputType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notebookRefresh, setNotebookRefresh] = useState(0);

  const {
    user,
    loading: authLoading,
    configError,
    isSupabaseConfigured,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut
  } = useAuth();
  const [fileHistory, setFileHistory] = useState<FileHistoryItem[]>([]);

  useEffect(() => {
    if (user) {
      const storedHistory = localStorage.getItem(`fileHistory_${user.id}`);
      if (storedHistory) {
        setFileHistory(JSON.parse(storedHistory));
      }
    } else {
      setFileHistory([]);
    }
  }, [user]);

  const addToFileHistory = (item: FileHistoryItem) => {
    if (user) {
      const newHistory = [item, ...fileHistory.filter(h => h.fileName !== item.fileName)].slice(0, 10);
      setFileHistory(newHistory);
      localStorage.setItem(`fileHistory_${user.id}`, JSON.stringify(newHistory));
    }
  };

  // Save content as notebook when file is uploaded
  const saveAsNotebook = async (content: string, fileName: string) => {
    try {
      await notebookService.create({
        title: fileName || 'Untitled Notebook',
        content: content,
        fileName: fileName,
      });
      setNotebookRefresh(prev => prev + 1); // Trigger refresh
    } catch (error) {
      console.error('Failed to save notebook:', error);
    }
  };

  // Handle when content changes from file upload
  const handleContentChange = (newContent: string, fileName: string | null) => {
    setAppState(s => ({ ...s, lessonContent: newContent, fileName }));

    // Auto-save as notebook when a file is uploaded
    if (fileName && newContent.trim()) {
      saveAsNotebook(newContent, fileName);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!appState.lessonContent.trim()) {
      setError('Please provide some lesson content.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOutput(null);

    try {
      if (user && appState.fileName) {
        addToFileHistory({ fileName: appState.fileName, content: appState.lessonContent });
      }

      let result: OutputType | null = null;
      switch (appState.learningType) {
        case LearningType.LESSON:
          result = { type: 'lesson', data: await adaptContent(appState.lessonContent, appState.learnerProfile, appState.question) };
          break;
        case LearningType.FLASHCARDS:
          const flashcards = await generateFlashCards(appState.lessonContent);
          for (let card of flashcards) {
            card.imageUrl = await generateImageForConcept(card.term);
          }
          result = { type: 'flashcards', data: flashcards };
          break;
        case LearningType.QUIZ:
          result = { type: 'quiz', data: await generateQuiz(appState.lessonContent) };
          break;
        case LearningType.GAME:
          const gamePairs = await generateGame(appState.lessonContent);
          for (let pair of gamePairs) {
            pair.imageUrl = await generateImageForConcept(pair.term);
          }
          result = { type: 'game', data: gamePairs };
          break;
      }
      setOutput(result);
    } catch (e: any) {
      console.error('Generation error:', e);
      const errorMessage = e?.message || 'An error occurred while generating the content.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [appState, user]);

  // Handle notebook selection
  const handleSelectNotebook = (content: string, title: string) => {
    setAppState(s => ({ ...s, lessonContent: content, fileName: title }));
  };

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show configuration error page
  if (configError || !isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 shadow-2xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Supabase Configuration Required</h1>
          <p className="text-gray-400 mb-6">
            Please update your <code className="bg-gray-700 px-2 py-1 rounded text-indigo-400">.env</code> file with your Supabase credentials.
          </p>
          <div className="bg-gray-900/50 rounded-lg p-4 text-left mb-6">
            <p className="text-gray-300 text-sm font-mono">
              <span className="text-gray-500"># .env file</span><br />
              <span className="text-indigo-400">VITE_SUPABASE_URL</span>=<span className="text-green-400">https://your-project.supabase.co</span><br />
              <span className="text-indigo-400">VITE_SUPABASE_ANON_KEY</span>=<span className="text-green-400">eyJ...</span>
            </p>
          </div>
          <p className="text-gray-500 text-sm">
            After updating .env, restart the dev server and refresh this page.
          </p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return (
      <LoginPage
        onSignInWithGoogle={signInWithGoogle}
        onSignInWithEmail={signInWithEmail}
        onSignUpWithEmail={signUpWithEmail}
      />
    );
  }

  // Main app for authenticated users
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header user={user} onSignOut={signOut} />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <InputPanel
              appState={appState}
              setAppState={setAppState}
              handleGenerate={handleGenerate}
              isLoading={isLoading}
              onContentChange={handleContentChange}
            />
            <Notebooks
              onSelectNotebook={handleSelectNotebook}
              refreshTrigger={notebookRefresh}
            />
            <FileHistory
              history={fileHistory}
              onSelect={(item) => setAppState(s => ({ ...s, lessonContent: item.content, fileName: item.fileName }))}
            />
          </div>
          <div className="lg:col-span-8">
            <OutputPanel output={output} isLoading={isLoading} error={error} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
