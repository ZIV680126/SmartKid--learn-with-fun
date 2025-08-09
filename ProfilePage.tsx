
import React, { useContext, useState, useRef } from 'react';
import { UserContext } from '../context/UserContext';
import ProgressBar from '../components/ui/ProgressBar';
import { generateAvatar } from '../services/geminiService';
import Spinner from '../components/ui/Spinner';
import { Star, Trophy, Target, UserCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { STAGES_PER_TOPIC } from '../constants';

const ProfilePage: React.FC = () => {
  const userContext = useContext(UserContext);
  const [avatarPrompt, setAvatarPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!userContext) return null;
  const { user, starsToNextLevel, updateAvatar } = userContext;

  const handleAvatarGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarPrompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    toast.loading('יוצר לך אוואטר חדש... זה יכול לקחת רגע', { id: 'avatar-gen' });
    try {
      const imageUrl = await generateAvatar(avatarPrompt);
      updateAvatar(imageUrl);
      toast.success('האוואטר שלך מוכן!', { id: 'avatar-gen' });
    } catch(error) {
      toast.error('אוי, הייתה בעיה ביצירת האוואטר.', { id: 'avatar-gen' });
    } finally {
      setIsGenerating(false);
      setAvatarPrompt('');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('אנא בחר/י קובץ תמונה בלבד.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        updateAvatar(result);
        toast.success('תמונת הפרופיל עודכנה!');
      };
      reader.readAsDataURL(file);
    }
  };


  const levelProgress = (user.stars / starsToNextLevel) * 100;
  const completedTopicsCount = Object.values(user.topicProgress).filter(stage => stage > STAGES_PER_TOPIC).length;


  return (
    <div className="p-8">
      <h1 className="text-4xl font-black text-textPrimary mb-8">הפרופיל שלי</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar */}
        <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold text-primary mb-4">האוואטר שלך</h2>
          
          {user.avatarUrl ? (
             <img src={user.avatarUrl} alt="User Avatar" className="w-48 h-48 rounded-full object-cover border-8 border-secondary mb-6" />
          ) : (
            <div className="w-48 h-48 rounded-full border-8 border-secondary mb-6 bg-gray-100 flex items-center justify-center">
                <UserCircle2 className="w-32 h-32 text-gray-300" />
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <button
            onClick={handleUploadClick}
            className="w-full bg-secondary text-white font-bold py-3 px-6 rounded-full text-lg hover:bg-teal-500 transition-all mb-4"
          >
            העלה תמונה מהמחשב
          </button>

          <div className="w-full text-center my-2">
            <span className="text-textSecondary font-semibold">אוֹ</span>
          </div>

          <h3 className="text-xl font-bold text-primary mb-4">צור אוואטר חדש עם AI!</h3>
          <p className="text-textSecondary text-center mb-4">תאר איך תרצה שהאוואטר שלך יראה (באנגלית)</p>
          <form onSubmit={handleAvatarGeneration} className="w-full">
            <textarea
              value={avatarPrompt}
              onChange={(e) => setAvatarPrompt(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 resize-none focus:outline-none focus:border-primary"
              placeholder="e.g., a happy lion with glasses reading a book"
              rows={3}
              disabled={isGenerating}
            />
            <button
              type="submit"
              className="w-full bg-accent text-white font-bold py-3 px-6 rounded-full text-lg hover:bg-orange-600 transition-all flex items-center justify-center disabled:bg-gray-400"
              disabled={isGenerating || !avatarPrompt.trim()}
            >
              {isGenerating ? <Spinner size="sm" /> : 'צור לי אוואטר!'}
            </button>
          </form>
        </div>

        {/* Right Column: Stats */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-primary mb-6">ההתקדמות שלי</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
            <div className="bg-blue-100 p-6 rounded-xl">
              <Trophy className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <p className="text-4xl font-bold text-blue-600">{user.level}</p>
              <p className="text-textSecondary">רמה</p>
            </div>
            <div className="bg-yellow-100 p-6 rounded-xl">
              <Star className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
              <p className="text-4xl font-bold text-yellow-600">{user.stars}</p>
              <p className="text-textSecondary">כוכבים</p>
            </div>
            <div className="bg-green-100 p-6 rounded-xl">
              <Target className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-4xl font-bold text-green-600">{completedTopicsCount}</p>
              <p className="text-textSecondary">נושאים שהושלמו</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-textPrimary mb-2">התקדמות לרמה הבאה ({user.level + 1})</h3>
            <ProgressBar value={levelProgress} />
            <p className="text-center mt-2 text-textSecondary">{user.stars} / {starsToNextLevel} כוכבים</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;