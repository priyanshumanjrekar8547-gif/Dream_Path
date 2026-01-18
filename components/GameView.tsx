
import React, { useState, useEffect } from 'react';
import { GamePair } from '../types';

interface Card {
  id: number;
  content: string;
  type: 'term' | 'match';
  pairId: number;
  imageUrl?: string;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  return array.map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

// Confetti component for celebration
const Confetti: React.FC = () => {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
  const confettiCount = 50;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: confettiCount }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            width: `${Math.random() * 8 + 4}px`,
            height: `${Math.random() * 8 + 4}px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            transform: `rotate(${Math.random() * 360}deg)`,
            animationDuration: `${Math.random() * 2 + 2}s`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
};

const GameView: React.FC<{ pairs: GamePair[] }> = ({ pairs }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<Card[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [moves, setMoves] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [wrongMatch, setWrongMatch] = useState(false);

  useEffect(() => {
    const gameCards: Card[] = [];
    pairs.forEach((pair, index) => {
      gameCards.push({ id: index * 2, content: pair.term, type: 'term', pairId: index, imageUrl: pair.imageUrl });
      gameCards.push({ id: index * 2 + 1, content: pair.match, type: 'match', pairId: index });
    });
    setCards(shuffleArray(gameCards));
    setSelected([]);
    setMatchedPairs([]);
    setIsCompleted(false);
    setMoves(0);
    setShowConfetti(false);
  }, [pairs]);

  const handleCardClick = (card: Card) => {
    if (selected.length === 2 || matchedPairs.includes(card.pairId) || selected[0]?.id === card.id) {
      return;
    }
    const newSelected = [...selected, card];
    setSelected(newSelected);
  };

  useEffect(() => {
    if (selected.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = selected;
      if (first.pairId === second.pairId && first.type !== second.type) {
        // Correct match!
        setTimeout(() => {
          setMatchedPairs(prev => [...prev, first.pairId]);
          setSelected([]);
        }, 500);
      } else {
        // Wrong match
        setWrongMatch(true);
        setTimeout(() => {
          setWrongMatch(false);
          setSelected([]);
        }, 800);
      }
    }
  }, [selected]);

  useEffect(() => {
    if (pairs.length > 0 && matchedPairs.length === pairs.length) {
      setIsCompleted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }, [matchedPairs, pairs.length]);

  const resetGame = () => {
    const gameCards: Card[] = [];
    pairs.forEach((pair, index) => {
      gameCards.push({ id: index * 2, content: pair.term, type: 'term', pairId: index, imageUrl: pair.imageUrl });
      gameCards.push({ id: index * 2 + 1, content: pair.match, type: 'match', pairId: index });
    });
    setCards(shuffleArray(gameCards));
    setSelected([]);
    setMatchedPairs([]);
    setIsCompleted(false);
    setMoves(0);
  };

  const getCardStyle = (card: Card) => {
    const isSelected = selected.some(s => s.id === card.id);
    const isMatched = matchedPairs.includes(card.pairId);
    const isWrong = wrongMatch && isSelected;

    if (isMatched) {
      return {
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.4))',
        borderColor: '#10b981',
        transform: 'scale(0.95)',
        opacity: 0.7,
      };
    }
    if (isWrong) {
      return {
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(185, 28, 28, 0.4))',
        borderColor: '#ef4444',
        transform: 'scale(1.02)',
        animation: 'shake 0.5s ease-in-out',
      };
    }
    if (isSelected) {
      return {
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(139, 92, 246, 0.5))',
        borderColor: '#818cf8',
        transform: 'scale(1.05)',
        boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
      };
    }
    if (card.type === 'term') {
      return {
        background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.8), rgba(31, 41, 55, 0.9))',
        borderColor: '#4b5563',
      };
    }
    return {
      background: 'linear-gradient(135deg, rgba(49, 46, 129, 0.6), rgba(30, 58, 138, 0.7))',
      borderColor: '#4338ca',
    };
  };

  return (
    <div className="w-full flex flex-col items-center">
      {showConfetti && <Confetti />}

      {/* Header */}
      <div className="flex items-center justify-between w-full mb-6">
        <h2 className="text-2xl font-bold text-white">🎮 Matching Game</h2>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
            <span className="text-gray-400 text-sm">Moves:</span>
            <span className="text-white font-bold ml-2">{moves}</span>
          </div>
          <div className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
            <span className="text-gray-400 text-sm">Pairs:</span>
            <span className="text-green-400 font-bold ml-2">{matchedPairs.length}/{pairs.length}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-700 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
          style={{ width: `${(matchedPairs.length / pairs.length) * 100}%` }}
        />
      </div>

      {isCompleted ? (
        <div className="text-center p-8 bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-2xl border border-green-500 shadow-2xl">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-3xl font-bold text-green-300">Congratulations!</h3>
          <p className="text-green-200 mt-2 text-lg">You've matched all the pairs!</p>
          <p className="text-green-300 mt-2">
            Completed in <span className="font-bold text-white">{moves}</span> moves
          </p>
          <button
            onClick={resetGame}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            🔄 Play Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              className="relative h-40 p-4 rounded-xl border-2 text-center flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl cursor-pointer group overflow-hidden"
              style={getCardStyle(card)}
              disabled={matchedPairs.includes(card.pairId)}
            >
              {/* Background glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent" />
              </div>

              {/* Card type indicator */}
              <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium ${card.type === 'term'
                  ? 'bg-indigo-500/30 text-indigo-200'
                  : 'bg-purple-500/30 text-purple-200'
                }`}>
                {card.type === 'term' ? '📚 Term' : '💡 Definition'}
              </div>

              {/* Image for term cards */}
              {card.imageUrl && card.type === 'term' && (
                <div className="w-16 h-16 rounded-full border-2 border-white/20 overflow-hidden mb-2 shadow-lg">
                  <img
                    src={card.imageUrl}
                    alt={card.content}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Card content */}
              <span className={`text-sm font-medium leading-tight relative z-10 ${matchedPairs.includes(card.pairId) ? 'text-green-300' : 'text-white'
                }`}>
                {card.content}
              </span>

              {/* Matched checkmark */}
              {matchedPairs.includes(card.pairId) && (
                <div className="absolute bottom-2 right-2 text-green-400 text-xl">✓</div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Instructions */}
      {!isCompleted && (
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>Click on cards to match terms with their definitions!</p>
          <p className="text-indigo-400 mt-1">📚 Term cards match with 💡 Definition cards</p>
        </div>
      )}

      {/* Add CSS for animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) scale(1.02); }
          25% { transform: translateX(-5px) scale(1.02); }
          75% { transform: translateX(5px) scale(1.02); }
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
};

export default GameView;
