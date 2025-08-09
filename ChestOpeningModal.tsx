
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { Chest, ChestType } from '../types';
import { CHESTS } from '../constants';
import { useSound } from '../hooks/useSound';
import { Star } from 'lucide-react';

interface ChestOpeningModalProps {
  chestType: ChestType | null;
  onClose: () => void;
}

const ChestOpeningModal: React.FC<ChestOpeningModalProps> = ({ chestType, onClose }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [starsWon, setStarsWon] = useState(0);
  const userContext = useContext(UserContext);
  const { playChestOpen } = useSound();
  
  const chest: Chest | null = chestType ? CHESTS[chestType] : null;

  useEffect(() => {
    if (chest) {
      const won = Math.floor(Math.random() * (chest.maxStars - chest.minStars + 1)) + chest.minStars;
      setStarsWon(won);
    }
  }, [chest]);

  if (!userContext || !chestType || !chest) return null;

  const handleOpenChest = () => {
    if (isOpening || isRevealed) return;
    setIsOpening(true);
    playChestOpen();
    setTimeout(() => {
      userContext.addStars(starsWon);
      setIsRevealed(true);
    }, 1000);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {!isRevealed ? (
          <>
            <h2 className="text-3xl font-bold mb-4 text-primary">קיבלת תיבת {chest.type}! {chest.icon}</h2>
            <p className="text-lg text-textSecondary mb-6">לחץ על התיבה כדי לפתוח אותה!</p>
            <div className={`cursor-pointer transition-transform duration-200 ${!isOpening && 'hover:scale-110'}`} onClick={handleOpenChest}>
              <div className={`text-9xl ${isOpening ? 'animate-chest-shake' : ''}`}>🎁</div>
            </div>
          </>
        ) : (
          <div>
            {[...Array(15)].map((_, i) => (
              <Star key={i} className="absolute text-yellow-400 animate-star-burst" style={{top: '50%', left: '50%', animationDelay: `${i * 0.05}s`}}/>
            ))}
            <h2 className="text-4xl font-black text-accent mb-4">כל הכבוד!</h2>
            <p className="text-2xl text-textPrimary mb-6">זכית ב-</p>
            <div className="flex justify-center items-center text-6xl font-bold text-yellow-500 mb-8">
              {starsWon} <Star className="w-16 h-16 ml-2 fill-current" />
            </div>
            <button onClick={onClose} className="bg-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-blue-600 transition-colors">
              להמשיך
            </button>
          </div>
        )}
         {isOpening && !isRevealed && <div className="absolute inset-0 bg-white animate-chest-open"></div>}
      </div>
    </div>
  );
};

export default ChestOpeningModal;
