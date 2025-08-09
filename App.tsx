import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserContext } from './context/UserContext';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import SubjectPage from './pages/SubjectPage';
import QuizPage from './pages/QuizPage';
import ProfilePage from './pages/ProfilePage';
import AchievementsPage from './pages/AchievementsPage';
import GamesPage from './pages/GamesPage';
import Sidebar from './components/layout/Sidebar';
import { Toaster } from 'react-hot-toast';
import FloatingChatButton from './components/FloatingChatButton';
import TicTacToeGamePage from './pages/TicTacToeGamePage';

const App: React.FC = () => {
  const userContext = useContext(UserContext);

  if (!userContext) {
    return <div>Loading...</div>; // Or some other loading state
  }

  const { user } = userContext;

  return (
    <HashRouter>
      <div className="flex h-screen bg-background font-sans text-textPrimary">
        {user.name && <Sidebar />}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            {!user.name ? (
              <>
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="*" element={<Navigate to="/onboarding" />} />
              </>
            ) : (
              <>
                <Route path="/" element={<HomePage />} />
                <Route path="/subject/:subjectId" element={<SubjectPage />} />
                <Route path="/quiz/:subjectId/:topicId" element={<QuizPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/achievements" element={<AchievementsPage />} />
                <Route path="/games" element={<GamesPage />} />
                <Route path="/game/tictactoe/:subjectId" element={<TicTacToeGamePage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}
          </Routes>
        </main>
        {user.name && <FloatingChatButton />}
        <Toaster position="top-center" reverseOrder={false} />
      </div>
    </HashRouter>
  );
};

export default App;