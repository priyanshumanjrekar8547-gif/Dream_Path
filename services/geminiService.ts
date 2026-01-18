
import { LearnerProfile, FlashCard, QuizQuestion, GamePair } from '../types';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Using a reliable model available on OpenRouter
const MODEL_NAME = 'google/gemini-2.0-flash-001';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface OpenRouterResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

const callOpenRouter = async (messages: ChatMessage[]): Promise<string> => {
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_api_key') {
        throw new Error('OpenRouter API key not configured. Please add VITE_OPENROUTER_API_KEY to your .env file.');
    }

    const response = await fetch(OPENROUTER_BASE_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Dream Path Education App',
        },
        body: JSON.stringify({
            model: MODEL_NAME,
            messages: messages,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('OpenRouter Error:', error);
        throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data: OpenRouterResponse = await response.json();
    return data.choices[0]?.message?.content || '';
};

const extractJSON = <T,>(text: string): T => {
    let jsonStr = text.trim();

    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    // Try to find JSON array in the text
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
        jsonStr = arrayMatch[0];
    }

    try {
        return JSON.parse(jsonStr) as T;
    } catch (error) {
        console.error('JSON Parse Error. Original text:', text);
        console.error('Attempted to parse:', jsonStr);
        throw new Error('Failed to parse AI response. Please try again.');
    }
};

const getProfileInstruction = (profile: LearnerProfile): string => {
    switch (profile) {
        case LearnerProfile.ADHD:
            return "Adapt for a learner with ADHD. Use short, concise sentences, bullet points, and clear headings. Emphasize key terms using bold formatting (e.g., **Keyword**). Create a strong visual hierarchy to make the content easily scannable.";
        case LearnerProfile.NON_NATIVE_ENGLISH:
            return "Adapt for a non-native English speaker. Simplify vocabulary, use plain English, and avoid complex sentence structures. Provide clear, step-by-step explanations for technical concepts.";
        case LearnerProfile.ADVANCED:
            return "Adapt for an advanced learner. Provide deeper conceptual and technical explanations. Connect concepts to real-world applications and introduce related advanced topics to encourage further exploration.";
        default:
            return "";
    }
}

export const adaptContent = async (
    content: string,
    profile: LearnerProfile,
    question?: string
): Promise<string> => {
    const profileInstruction = getProfileInstruction(profile);
    const questionInstruction = question ? `\n\nAdditionally, the student has a question: "${question}". Based *only* on the provided text, answer this question clearly and concisely. Frame the answer at the end of the adapted content under a heading '### Answering Your Question'.` : '';

    const prompt = `You are an expert in inclusive education. Your task is to adapt the following academic/technical content for a specific learner profile. You must maintain 100% factual accuracy and not remove or distort core concepts.

**Learner Profile:** ${profile}
**Instructions:** ${profileInstruction}
${questionInstruction}

**Original Content:**
---
${content}
---

**Your Adapted Content (in Markdown):**`;

    const result = await callOpenRouter([
        { role: 'user', content: prompt }
    ]);

    return result;
};

export const generateFlashCards = async (content: string): Promise<FlashCard[]> => {
    const prompt = `Based on the following text, create 5-8 flashcards for studying. Each flashcard should have a "term" (the concept) and a "definition" (a clear explanation).

IMPORTANT: Return ONLY a JSON array, no other text. Format:
[
  {"term": "Concept 1", "definition": "Clear explanation of concept 1"},
  {"term": "Concept 2", "definition": "Clear explanation of concept 2"}
]

Content to create flashcards from:
${content}`;

    const result = await callOpenRouter([
        { role: 'user', content: prompt }
    ]);

    console.log('Flashcards raw response:', result);
    return extractJSON<FlashCard[]>(result);
};

export const generateQuiz = async (content: string): Promise<QuizQuestion[]> => {
    const prompt = `Based on the following text, create a 5-question multiple choice quiz. Each question should have exactly 4 options and one correct answer.

IMPORTANT: Return ONLY a JSON array, no other text. Format:
[
  {
    "question": "What is...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A"
  }
]

The correctAnswer MUST exactly match one of the options.

Content to create quiz from:
${content}`;

    const result = await callOpenRouter([
        { role: 'user', content: prompt }
    ]);

    console.log('Quiz raw response:', result);
    return extractJSON<QuizQuestion[]>(result);
};

export const generateGame = async (content: string): Promise<GamePair[]> => {
    const prompt = `Based on the following text, create 6 matching pairs for a memory game. Each pair should have a "term" and a "match" (definition or related concept).

IMPORTANT: Return ONLY a JSON array, no other text. Format:
[
  {"term": "Term 1", "match": "Definition or related concept 1"},
  {"term": "Term 2", "match": "Definition or related concept 2"}
]

Content to create matching game from:
${content}`;

    const result = await callOpenRouter([
        { role: 'user', content: prompt }
    ]);

    console.log('Game raw response:', result);
    return extractJSON<GamePair[]>(result);
};

export const generateImageForConcept = async (concept: string): Promise<string> => {
    // Create a search query based on the concept
    // Clean up the concept to make it more search-friendly
    const searchTerms = concept
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(' ')
        .filter(word => word.length > 2)
        .slice(0, 3)
        .join(',');

    // Use Unsplash Source API for relevant images (no API key required)
    // This returns images based on the search term
    const unsplashUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(searchTerms)},science,education`;

    // Add a unique timestamp to prevent caching of the same image
    const uniqueUrl = `${unsplashUrl}&sig=${Date.now()}-${Math.random().toString(36).substring(7)}`;

    return uniqueUrl;
};
