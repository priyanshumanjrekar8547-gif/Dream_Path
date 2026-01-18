
import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizViewProps {
  questions: QuizQuestion[];
}

const QuizView: React.FC<QuizViewProps> = ({ questions }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelectAnswer = (questionIndex: number, option: string) => {
    if (submitted) return;
    setAnswers({ ...answers, [questionIndex]: option });
  };

  const handleSubmit = () => {
    let newScore = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) {
        newScore++;
      }
    });
    setScore(newScore);
    setSubmitted(true);
  };

  const getOptionClass = (questionIndex: number, option: string) => {
    if (!submitted) {
      return answers[questionIndex] === option ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600';
    }
    const isCorrect = option === questions[questionIndex].correctAnswer;
    const isSelected = answers[questionIndex] === option;
    if (isCorrect) return 'bg-green-700';
    if (isSelected && !isCorrect) return 'bg-red-700';
    return 'bg-gray-700';
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">Knowledge Check</h2>
      {submitted && (
        <div className="bg-indigo-900/50 p-4 rounded-lg mb-6 text-center">
          <h3 className="text-xl font-bold">Your Score: {score} / {questions.length}</h3>
        </div>
      )}
      <div className="space-y-6">
        {questions.map((q, i) => (
          <div key={i} className="bg-gray-900/50 p-4 rounded-lg">
            <p className="font-semibold mb-3">{i + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((option, j) => (
                <button
                  key={j}
                  onClick={() => handleSelectAnswer(i, option)}
                  disabled={submitted}
                  className={`w-full text-left p-3 rounded-md transition-colors ${getOptionClass(i, option)}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!submitted && (
        <button
          onClick={handleSubmit}
          className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-md font-bold transition-colors"
        >
          Submit Answers
        </button>
      )}
    </div>
  );
};

export default QuizView;
