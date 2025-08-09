import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { LEVEL_UNLOCKS, SUBJECTS } from '../constants';
import { Gamepad2, Lock, Sparkles, BrainCircuit } from 'lucide-react';
import Modal from '../components/ui/Modal';


const GamesPage: React.FC = () => {
  const userContext = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!userContext) return null;
  const { user } = userContext;

  return (
    <div className="p-8">
       <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="בחר נושא לאתגר">
        <div className="grid grid-cols-2 gap-4">
          {SUBJECTS.map(subject => (
            <Link
              key={subject.id}
              to={`/game/tictactoe/${subject.id}`}
              className={`flex flex-col items-center justify-center p-6 rounded-lg text-white font-bold text-xl ${subject.color} hover:scale-105 transition-transform`}
              onClick={() => setIsModalOpen(false)}
            >
              {subject.icon({className: "w-10 h-10 mb-2"})}
              {subject.title}
            </Link>
          ))}
        </div>
      </Modal>

      <h1 className="text-4xl font-black text-textPrimary mb-8">אזור המשחקים</h1>
      <p className="text-xl text-textSecondary mb-12">כאן תמצאו משחקים חינוכיים שפתחתם על ידי עלייה בדרגות. המשיכו ללמוד כדי לפתוח עוד!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Always Unlocked Game */}
        <div className="p-8 rounded-2xl shadow-lg text-center flex flex-col items-center justify-center transition-all duration-300 bg-gradient-to-br from-primary to-blue-600 text-white">
            <BrainCircuit className="w-16 h-16 mb-4" />
            <h2 className="text-3xl font-bold mb-2">איקס עיגול לימודי</h2>
            <p className="text-lg mb-4">זמין תמיד! שחקו נגד המחשב.</p>
            <button onClick={() => setIsModalOpen(true)} className="bg-white text-primary font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition">שחק עכשיו</button>
        </div>

        {/* Level-based Unlocks */}
        {Object.entries(LEVEL_UNLOCKS).map(([level, gameName]) => {
          const isUnlocked = user.level >= parseInt(level);
          return (
            <div
              key={level}
              className={`p-8 rounded-2xl shadow-lg text-center flex flex-col items-center justify-center transition-all duration-300 ${isUnlocked ? 'bg-gradient-to-br from-secondary to-green-400 text-white' : 'bg-gray-100 text-gray-500'}`}
            >
              {isUnlocked ? (
                <>
                  <Sparkles className="w-16 h-16 mb-4" />
                  <h2 className="text-3xl font-bold mb-2">{gameName}</h2>
                  <p className="text-lg mb-4">זמין למשחק!</p>
                  <button className="bg-white text-primary font-bold py-2 px-6 rounded-full hover:bg-gray-200 transition cursor-not-allowed" disabled>בקרוב!</button>
                </>
              ) : (
                <>
                  <Lock className="w-16 h-16 mb-4" />
                  <h2 className="text-3xl font-bold mb-2">{gameName}</h2>
                  <p className="text-lg">נעול</p>
                  <p className="font-semibold mt-2">הגיעו לרמה {level} כדי לפתוח</p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GamesPage;