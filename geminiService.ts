import { GoogleGenAI, Type } from "@google/genai";
import { TOPICS_PER_SUBJECT, QUESTIONS_PER_TOPIC } from '../constants';
import { Question } from '../types';

// The API key is injected from the environment and is assumed to be present.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const questionSchema = {
  type: Type.OBJECT,
  properties: {
    questionText: { type: Type.STRING, description: 'The question itself.' },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'An array of 4 possible answers.'
    },
    correctAnswerIndex: {
      type: Type.INTEGER,
      description: 'The 0-based index of the correct answer in the options array.'
    },
    explanation: {
      type: Type.STRING,
      description: 'A brief explanation for why the answer is correct.'
    }
  },
  required: ['questionText', 'options', 'correctAnswerIndex', 'explanation']
};

export const generateTopics = async (subject: string, grade: number): Promise<string[]> => {
  try {
    const prompt = `צור רשימה של ${TOPICS_PER_SUBJECT} נושאי לימוד בנושא ${subject} המתאימים לתלמיד בכיתה ${grade}', בהתאם לתכנית הלימודים של משרד החינוך הישראלי. החזר את הרשימה בפורמט JSON, כמערך של מחרוזות.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating topics:", error);
    return Array.from({ length: TOPICS_PER_SUBJECT }, (_, i) => `נושא ${i + 1} שנוצר עקב שגיאה`);
  }
};

export const generateQuizQuestions = async (subject: string, topic: string, grade: number): Promise<Question[]> => {
  const isPractice = topic === 'practice';
  const numQuestions = isPractice ? 20 : QUESTIONS_PER_TOPIC;
  const topicDescription = isPractice ? `שאלות מגוונות מתוך כלל הנושאים של ${subject}` : `בנושא "${topic}"`;

  try {
    const prompt = `צור ${numQuestions} שאלות טריוויה עם 4 אפשרויות ותשובה נכונה אחת, ${topicDescription} עבור תלמיד בכיתה ${grade} שלומד ${subject}, בהתאם לתכנית הלימודים של משרד החינוך. השאלות צריכות להיות מאתגרות אך הוגנות. ספק הסבר קצר לכל תשובה.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: questionSchema,
        },
      },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return [];
  }
};

export const generateAvatar = async (prompt: string): Promise<string> => {
   try {
     const fullPrompt = `a 3D rendered avatar of ${prompt}, cute, Pixar style, on a solid light blue background, character only`;
     const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
     });
     
     const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
     return `data:image/jpeg;base64,${base64ImageBytes}`;
   } catch(error) {
     console.error("Error generating avatar:", error);
     return 'https://picsum.photos/seed/error-avatar/512';
   }
};

export const getAiChatResponse = async (history: {role: string, parts: {text: string}[]}[], newMessage: string, subjectContext?: string) => {
    try {
        const aiChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: {
                systemInstruction: `You are 'Smarty', a friendly and encouraging AI tutor for kids in an app called SmartKid. Your language is Hebrew. You help kids with homework, explain topics simply, and answer questions about the app. If a user asks for a visual explanation, suggest searching YouTube and give them a sample search query like: 'חפש ביוטיוב: "איך עובד מחזור המים?"'. Keep answers short, fun, and easy to understand. The current learning context is: ${subjectContext || 'general questions'}.`,
            },
        });
        const response = await aiChat.sendMessage({ message: newMessage });
        return response.text;
    } catch (error) {
        console.error("Error in AI Chat:", error);
        return "אוי, נתקלתי בבעיה קטנה. אפשר לנסות שוב?";
    }
};