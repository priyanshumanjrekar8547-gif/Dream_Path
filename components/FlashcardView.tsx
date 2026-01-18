
import React, { useState } from 'react';
import { FlashCard } from '../types';

interface FlashcardViewProps {
    cards: FlashCard[];
}

const Flashcard: React.FC<{ card: FlashCard }> = ({ card }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
        <div
            className="w-full h-72 cursor-pointer"
            style={{ perspective: '1000px' }}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div
                className="relative w-full h-full transition-transform duration-700"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
            >
                {/* Front */}
                <div
                    className="absolute w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-center border border-gray-600 shadow-xl overflow-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    {/* Background image with overlay */}
                    {card.imageUrl && !imageError && (
                        <div className="absolute inset-0">
                            <img
                                src={card.imageUrl}
                                alt=""
                                className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-30' : 'opacity-0'}`}
                                onLoad={() => setImageLoaded(true)}
                                onError={() => setImageError(true)}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
                        </div>
                    )}
                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center">
                        {card.imageUrl && !imageError && (
                            <div className="w-20 h-20 rounded-full border-2 border-indigo-500 overflow-hidden mb-4 shadow-lg">
                                <img
                                    src={card.imageUrl}
                                    alt={card.term}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <h3 className="text-2xl font-bold text-white drop-shadow-lg">{card.term}</h3>
                        <p className="text-sm text-indigo-300 mt-2">Click to flip</p>
                    </div>
                </div>

                {/* Back */}
                <div
                    className="absolute w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-6 flex flex-col items-center justify-center text-center border border-indigo-600 shadow-xl"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                    }}
                >
                    <div className="text-indigo-300 text-sm font-medium uppercase tracking-wider mb-3">Definition</div>
                    <p className="text-gray-100 text-lg leading-relaxed">{card.definition}</p>
                    <p className="text-sm text-indigo-300 mt-4">Click to flip back</p>
                </div>
            </div>
        </div>
    );
};

const FlashcardView: React.FC<FlashcardViewProps> = ({ cards }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToNext = () => setCurrentIndex(i => (i + 1) % cards.length);
    const goToPrev = () => setCurrentIndex(i => (i - 1 + cards.length) % cards.length);

    return (
        <div className="flex flex-col items-center w-full">
            <h2 className="text-2xl font-bold mb-6 text-white">Flash Cards</h2>
            <div className="w-full max-w-lg">
                {cards.length > 0 && <Flashcard key={currentIndex} card={cards[currentIndex]} />}
            </div>
            <div className="mt-6 flex items-center justify-center gap-4">
                <button
                    onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                    className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-medium"
                >
                    Prev
                </button>
                <span className="text-gray-400 font-medium">
                    {currentIndex + 1} / {cards.length}
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                    className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-medium"
                >
                    Next
                </button>
            </div>
            {/* Card indicators */}
            <div className="flex gap-2 mt-4">
                {cards.map((_, index) => (
                    <button
                        key={index}
                        onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                        className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                ? 'bg-indigo-500 w-4'
                                : 'bg-gray-600 hover:bg-gray-500'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default FlashcardView;
