import { GoogleGenAI, Type } from "@google/genai";
import { LECTURE_NOTES } from "../constants";
import { Question, QuizResult, Flashcard, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateQuestions(
  count: number = 5,
  weakTopics: string[] = [],
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<Question[]> {
  const model = "gemini-2.5-flash";
  
  let prompt = `Generate ${count} multiple choice questions based on the following lecture notes about Electromagnetic Fields and Waves.
  The difficulty level should be: ${difficulty}.
  
  Lecture Notes:
  ${LECTURE_NOTES}
  `;

  if (weakTopics.length > 0) {
    prompt += `\n\nPlease focus at least 60% of the questions on these topics which the user previously struggled with: ${weakTopics.join(", ")}. The remaining questions should be a mix of other topics from the notes.`;
  } else {
    prompt += `\n\nPlease ensure the questions cover a diverse range of topics from the notes.`;
  }

  prompt += `\n\nReturn the response as a JSON array of objects.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            text: { type: Type.STRING, description: "The question text" },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of 4 possible answers"
            },
            correctAnswer: { 
              type: Type.INTEGER, 
              description: "Index of the correct answer (0-3)" 
            },
            explanation: { 
              type: Type.STRING, 
              description: "Brief explanation of why the answer is correct" 
            },
            topic: { 
              type: Type.STRING, 
              description: "The specific topic or concept this question tests (e.g., 'Gauss Law', 'Capacitance')" 
            },
            difficulty: {
              type: Type.STRING,
              description: "The difficulty level of the question",
              enum: ["easy", "medium", "hard"]
            }
          },
          required: ["id", "text", "options", "correctAnswer", "explanation", "topic", "difficulty"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) return [];
  
  try {
    return JSON.parse(text) as Question[];
  } catch (e) {
    console.error("Failed to parse questions", e);
    return [];
  }
}

export async function analyzeResults(
  questions: Question[],
  userAnswers: number[]
): Promise<QuizResult> {
  const model = "gemini-2.5-flash";
  
  const incorrectQuestions = questions.filter((_, i) => userAnswers[i] !== questions[i].correctAnswer);
  const correctCount = questions.length - incorrectQuestions.length;
  
  // Identify weak topics from incorrect answers
  const weakTopics = Array.from(new Set(incorrectQuestions.map(q => q.topic)));

  let feedbackSummary = "Great job! You have a solid understanding of the material.";

  if (incorrectQuestions.length > 0) {
    const prompt = `The user just took a quiz on Electromagnetic Fields.
    Here are the questions they got wrong:
    ${incorrectQuestions.map(q => `- Topic: ${q.topic}. Question: ${q.text}. Correct Answer: ${q.options[q.correctAnswer]}. Explanation: ${q.explanation}`).join("\n")}

    Please provide a concise, encouraging summary (max 3 sentences) identifying the key concepts they need to review. Address the user directly.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    if (response.text) {
      feedbackSummary = response.text;
    }
  }

  return {
    score: correctCount,
    total: questions.length,
    weakTopics,
    feedbackSummary
  };
}

export async function generateFlashcards(count: number = 10): Promise<Flashcard[]> {
  const model = "gemini-2.5-flash";
  
  const prompt = `Generate ${count} flashcards based on the following lecture notes about Electromagnetic Fields and Waves.
  Each flashcard should have a 'term' (concept, law, or formula name) and a 'definition' (explanation or formula).
  
  Lecture Notes:
  ${LECTURE_NOTES}
  
  Return the response as a JSON array of objects.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            term: { type: Type.STRING, description: "The concept or term" },
            definition: { type: Type.STRING, description: "The definition or explanation" },
            topic: { type: Type.STRING, description: "The general topic category" }
          },
          required: ["id", "term", "definition", "topic"]
        }
      }
    }
  });

  const text = response.text;
  if (!text) return [];
  
  try {
    return JSON.parse(text) as Flashcard[];
  } catch (e) {
    console.error("Failed to parse flashcards", e);
    return [];
  }
}

export async function chatWithTutor(history: ChatMessage[], message: string): Promise<string> {
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `You are a helpful and knowledgeable physics tutor specializing in Electromagnetic Fields and Waves.
  Use the following lecture notes as your primary source of truth, but you can explain concepts in simpler terms or provide examples.
  
  Lecture Notes:
  ${LECTURE_NOTES}
  
  Keep your answers concise (under 150 words) unless asked for a detailed explanation.
  Be encouraging and educational.`;

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction,
    },
    history: history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))
  });

  const result = await chat.sendMessage({ message });
  return result.text || "I'm sorry, I couldn't generate a response.";
}
