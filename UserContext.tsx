
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, ChestType } from '../types';
import { STARS_PER_LEVEL, CHESTS, LEVEL_UNLOCKS, STAGES_PER_TOPIC, POINTS_TO_UNLOCK_CHEST } from '../constants';
import toast from 'react-hot-toast';

interface UserContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  addPoints: (points: number) => ChestType | null;
  addStars: (stars: number) => void;
  updateAvatar: (url: string) => void;
  updateTopicProgress: (topicId: string, stage: number, passed: boolean) => void;
  starsToNextLevel: number;
  unlockedGames: string[];
  logout: () => void;
}

export const UserContext = createContext<UserContextType | null>(null);

const defaultUser: User = {
  name: '',
  grade: 3,
  avatarUrl: null,
  level: 1,
  stars: 0,
  points: 0,
  topicProgress: {},
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const savedUser = localStorage.getItem('smartkid-user');
    return savedUser ? JSON.parse(savedUser) : defaultUser;
  });

  useEffect(() => {
    localStorage.setItem('smartkid-user', JSON.stringify(user));
  }, [user]);

  const starsToNextLevel = user.level * STARS_PER_LEVEL;

  const unlockedGames = Object.entries(LEVEL_UNLOCKS)
      .filter(([level]) => user.level >= parseInt(level))
      .map(([, gameName]) => gameName);

  const addPoints = (points: number): ChestType | null => {
    let awardedChest: ChestType | null = null;
    setUser(prevUser => {
      const newPoints = prevUser.points + points;
      // Use POINTS_TO_UNLOCK_CHEST from constants
      if (newPoints >= POINTS_TO_UNLOCK_CHEST[ChestType.Gold]) {
        awardedChest = ChestType.Gold;
        return { ...prevUser, points: newPoints - POINTS_TO_UNLOCK_CHEST[ChestType.Gold] };
      }
      if (newPoints >= POINTS_TO_UNLOCK_CHEST[ChestType.Silver]) {
        awardedChest = ChestType.Silver;
        return { ...prevUser, points: newPoints - POINTS_TO_UNLOCK_CHEST[ChestType.Silver] };
      }
      if (newPoints >= POINTS_TO_UNLOCK_CHEST[ChestType.Bronze]) {
        awardedChest = ChestType.Bronze;
        return { ...prevUser, points: newPoints - POINTS_TO_UNLOCK_CHEST[ChestType.Bronze] };
      }
      return { ...prevUser, points: newPoints };
    });
    return awardedChest;
  };

  const addStars = (stars: number) => {
    setUser(prevUser => {
      let newStars = prevUser.stars + stars;
      let newLevel = prevUser.level;
      let requiredStars = newLevel * STARS_PER_LEVEL;

      while (newStars >= requiredStars) {
        newStars -= requiredStars;
        newLevel++;
        toast.success(`🎉 כל הכבוד! עלית לרמה ${newLevel}!`);
        if(LEVEL_UNLOCKS[newLevel]){
            toast.success(`פתחת משחק חדש: ${LEVEL_UNLOCKS[newLevel]}!`);
        }
      }
      return { ...prevUser, stars: newStars, level: newLevel };
    });
  };

  const updateAvatar = (url: string) => {
    setUser(prevUser => ({ ...prevUser, avatarUrl: url }));
  };
  
  const updateTopicProgress = (topicId: string, stage: number, passed: boolean) => {
    setUser(prevUser => {
      const newProgress = { ...prevUser.topicProgress };
      const currentStageUnlocked = newProgress[topicId] || 1;
      
      if (passed && stage === currentStageUnlocked && currentStageUnlocked <= STAGES_PER_TOPIC) {
        newProgress[topicId] = currentStageUnlocked + 1;
        if (currentStageUnlocked < STAGES_PER_TOPIC) {
            toast.success('מעולה! השלב הבא נפתח!');
        } else {
            toast.success('כל הכבוד! סיימת את כל השלבים בנושא זה!');
        }
      }

      return { ...prevUser, topicProgress: newProgress };
    });
  };

  const logout = () => {
    localStorage.removeItem('smartkid-user');
    setUser(defaultUser);
    toast('התנתקת בהצלחה. מקווים לראותך שוב!', { icon: '👋' });
  };

  return (
    <UserContext.Provider value={{ user, setUser, addPoints, addStars, updateAvatar, updateTopicProgress, starsToNextLevel, unlockedGames, logout }}>
      {children}
    </UserContext.Provider>
  );
};
