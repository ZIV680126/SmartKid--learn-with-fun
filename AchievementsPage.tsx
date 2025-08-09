
import React, { useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { CHESTS, MAX_LEVEL, SUBJECTS, TOPICS_PER_SUBJECT, STAGES_PER_TOPIC } from '../constants';
import { Award, CheckCircle2, Star } from 'lucide-react';

const AchievementsPage: React.FC = () => {
  const userContext = useContext(UserContext);
  if (!userContext) return null;
  const { user } = userContext;

  const totalTopics = SUBJECTS.length * TOPICS_PER_SUBJECT;
  const completedTopicsCount = Object.values(user.topicProgress).filter(stage => stage > STAGES_PER_TOPIC).length;
  const completionPercentage = Math.round((completedTopicsCount / totalTopics) * 100);

  const goal = `להגיע לרמה ${MAX_LEVEL} ולהשלים את כל המשימות!`;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-black text-textPrimary mb-8">ההישגים שלי</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
            <Award className="w-8 h-8 mr-3" />
            הדרגה שלי
          </h2>
          <div className="text-center">
            <p className="text-6xl font-black text-accent">{user.level}</p>
            <p className="text-lg text-textSecondary">מתוך {MAX_LEVEL}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
            <CheckCircle2 className="w-8 h-8 mr-3" />
            התקדמות כללית
          </h2>
          <div className="text-center">
            <p className="text-6xl font-black text-green-500">{completionPercentage}%</p>
            <p className="text-lg text-textSecondary">{completedTopicsCount} מתוך {totalTopics} נושאים</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
            <Star className="w-8 h-8 mr-3" />
            המטרה הסופית
          </h2>
          <div className="text-center">
             <p className="text-xl font-semibold text-textPrimary h-full flex items-center justify-center">{goal}</p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold text-textPrimary mb-6">התיבות שלי</h2>
        <div className="flex justify-around items-center bg-white p-8 rounded-2xl shadow-lg">
            {Object.values(CHESTS).map(chest => (
              <div key={chest.type} className="text-center">
                <span className="text-8xl">{chest.icon}</span>
                <p className="text-2xl font-bold mt-2 text-textPrimary">{chest.type}</p>
                <p className="text-textSecondary">זכייה של {chest.minStars}-{chest.maxStars} כוכבים</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;
