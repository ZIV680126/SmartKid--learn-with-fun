import React from 'react';
import { BrainCircuit, BookOpen, FlaskConical, Languages } from 'lucide-react';
import { Subject, ChestType, Chest } from './types';

export const SUBJECTS: Subject[] = [
  { id: 'math', title: 'מתמטיקה', icon: (props) => React.createElement(BrainCircuit, props), color: "bg-blue-500", description: "חיבור, חיסור, שברים ועוד" },
  { id: 'hebrew', title: 'עברית', icon: (props) => React.createElement(BookOpen, props), color: "bg-orange-500", description: "קריאה, הבנת הנקרא ודקדוק" },
  { id: 'science', title: 'מדעים', icon: (props) => React.createElement(FlaskConical, props), color: "bg-green-500", description: "גוף האדם, חלל וכדור הארץ" },
  { id: 'english', title: 'אנגלית', icon: (props) => React.createElement(Languages, props), color: "bg-red-500", description: "אוצר מילים, קריאה ושיחה" },
];

export const TOPICS_PER_SUBJECT = 20;
export const QUESTIONS_PER_TOPIC = 20;
export const QUESTIONS_PER_STAGE = 10;
export const STAGES_PER_TOPIC = 2;
export const PASSING_SCORE_PERCENTAGE = 80;


export const POINTS_FOR_CORRECT_ANSWER = 10;
export const POINTS_TO_UNLOCK_CHEST: { [key in ChestType]: number } = {
  [ChestType.Bronze]: 100,
  [ChestType.Silver]: 250,
  [ChestType.Gold]: 500,
};

export const CHESTS: { [key in ChestType]: Chest } = {
  [ChestType.Bronze]: { type: ChestType.Bronze, minStars: 10, maxStars: 25, icon: '🥉' },
  [ChestType.Silver]: { type: ChestType.Silver, minStars: 30, maxStars: 50, icon: '🥈' },
  [ChestType.Gold]: { type: ChestType.Gold, minStars: 60, maxStars: 100, icon: '🥇' },
};

export const LEVEL_UNLOCKS: { [level: number]: string } = {
  5: 'משחק זיכרון',
  30: 'מרוץ נגד השעון',
  100: 'חידון הבונוסים',
};

export const STARS_PER_LEVEL = 100;
export const MAX_LEVEL = 200;