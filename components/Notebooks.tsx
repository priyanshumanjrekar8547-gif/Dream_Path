
import React, { useState, useEffect } from 'react';
import { notebookService, Notebook } from '../services/notebookService';

interface NotebooksProps {
    onSelectNotebook: (content: string, fileName: string) => void;
    refreshTrigger?: number;
}

const Notebooks: React.FC<NotebooksProps> = ({ onSelectNotebook, refreshTrigger }) => {
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    const loadNotebooks = async () => {
        setLoading(true);
        try {
            const data = await notebookService.getAll();
            setNotebooks(data);
        } catch (error) {
            console.error('Failed to load notebooks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotebooks();
    }, [refreshTrigger]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this notebook?')) {
            await notebookService.delete(id);
            loadNotebooks();
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (notebooks.length === 0 && !loading) {
        return null;
    }

    return (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-left"
            >
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="font-semibold text-white">My Notebooks</span>
                    <span className="text-sm text-gray-400">({notebooks.length})</span>
                </div>
                <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isExpanded && (
                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                        </div>
                    ) : (
                        notebooks.map((notebook) => (
                            <div
                                key={notebook.id}
                                onClick={() => onSelectNotebook(notebook.content, notebook.title)}
                                className="group p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-indigo-500 cursor-pointer transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-white truncate">{notebook.title}</h4>
                                        {notebook.file_name && (
                                            <p className="text-xs text-indigo-400 mt-1 truncate">
                                                📎 {notebook.file_name}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDate(notebook.updated_at)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(notebook.id, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 transition-all"
                                        title="Delete notebook"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                                    {notebook.content.substring(0, 100)}...
                                </p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Notebooks;
