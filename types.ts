
import type React from 'react';

export interface User {
  name: string;
  grade: number;
  avatarUrl: string | null;
  level: number;
  stars: number;
  points: number;
  topicProgress: { [topicId: string]: number }; // Key: topicId, Value: highest unlocked stage (e.g., 1, 2, 3. 4 means completed)
}

export interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface Topic {
  id: string;
  title: string;
  questions?: Question[];
}

export interface Subject {
  id: string;
  title: string;
  icon: (props: { className?: string }) => React.ReactNode;
  color: string;
  description: string;
}

export enum ChestType {
  Bronze = 'ארד',
  Silver = 'כסף',
  Gold = 'זהב'
}

export interface Chest {
  type: ChestType;
  minStars: number;
  maxStars: number;
  icon: string;
}