
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const OnboardingPage: React.FC = () => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(3);
  const navigate = useNavigate();
  const userContext = useContext(UserContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && userContext) {
      userContext.setUser(prev => ({
        ...prev,
        name: name.trim(),
        grade: grade,
      }));
      navigate('/');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary to-secondary">
      <div className="w-full max-w-md p-10 bg-white rounded-2xl shadow-2xl text-center">
        <h1 className="text-4xl font-black text-primary mb-2">שלום, נעים להכיר!</h1>
        <p className="text-lg text-textSecondary mb-8">בואו נתחיל את המסע שלכם</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-right text-lg font-medium text-textPrimary mb-2">איך קוראים לך?</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg text-right focus:outline-none focus:border-primary transition"
              placeholder="למשל, דני"
              required
            />
          </div>
          <div className="mb-8">
            <label htmlFor="grade" className="block text-right text-lg font-medium text-textPrimary mb-2">באיזו כיתה את/ה?</label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg text-right focus:outline-none focus:border-primary transition appearance-none bg-white bg-no-repeat"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'left 0.5rem center',
                backgroundSize: '1.5em 1.5em',
              }}
            >
              <option value={3}>כיתה ג'</option>
              <option value={4}>כיתה ד'</option>
              <option value={5}>כיתה ה'</option>
              <option value={6}>כיתה ו'</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-accent text-white font-bold py-4 px-6 rounded-full text-xl hover:bg-orange-600 transition-transform transform hover:scale-105"
            disabled={!name.trim()}
          >
            יאללה, מתחילים!
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
