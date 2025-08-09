import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { generateQuizQuestions } from '../services/geminiService';
import { Question, ChestType } from '../types';
import Spinner from '../components/ui/Spinner';
import ProgressBar from '../components/ui/ProgressBar';
import { UserContext } from '../context/UserContext';
import { POINTS_FOR_CORRECT_ANSWER, SUBJECTS, QUESTIONS_PER_STAGE, STAGES_PER_TOPIC, PASSING_SCORE_PERCENTAGE } from '../constants';
import { useSound } from '../hooks/useSound';
import ChestOpeningModal from '../components/ChestOpeningModal';
import { Check, X } from 'lucide-react';


const processQuestions = (questions: Question[]): Question[] => {
    return questions.map(q => {
        if (!q.options || q.correctAnswerIndex === undefined) return q;
        const correctAnswerText = q.options[q.correctAnswerIndex];
        
        const shuffledOptions = [...q.options];
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
        
        const newCorrectIndex = shuffledOptions.findIndex(opt => opt === correctAnswerText);
        
        return {
            ...q,
            options: shuffledOptions,
            correctAnswerIndex: newCorrectIndex,
        };
    });
};


const QuizPage: React.FC = () => {
  const { subjectId, topicId } = useParams<{ subjectId: string, topicId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { topicTitle: passedTopicTitle } = (location.state || {}) as { topicTitle?: string };
  
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentStageQuestions, setCurrentStageQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [awardedChest, setAwardedChest] = useState<ChestType | null>(null);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [finalResult, setFinalResult] = useState<{passed: boolean; percentage: number} | null>(null);
  const [stage, setStage] = useState(1);
  const [topicTitle, setTopicTitle] = useState(passedTopicTitle || '');

  const isPracticeMode = topicId === 'practice';
  const userContext = useContext(UserContext);
  const { playCorrect, playIncorrect } = useSound();
  
  const subject = SUBJECTS.find(s => s.id === subjectId);

  const fetchAndSetQuestions = useCallback(async () => {
      if (subject && userContext?.user.grade) {
        setIsLoading(true);
        const quizId = isPracticeMode ? `quiz-practice-${subject.id}` : `quiz-${subjectId}-${topicId}`;
        
        // Use a different topic title for practice mode
        const currentTopicTitle = isPracticeMode ? 'אתגר המחשב' : topicTitle;

        if (!currentTopicTitle) {
          // fetch topic title if not passed in state
          const cachedTopics = sessionStorage.getItem(`topics-${subject.id}-${userContext.user.grade}`);
          if (cachedTopics) {
            const topics = JSON.parse(cachedTopics);
            setTopicTitle(topics[Number(topicId)]);
          } else {
             // Fallback, should ideally not happen if flow is correct
             setTopicTitle(`נושא ${Number(topicId) + 1}`);
          }
          return; // Rerun effect when title is set
        }

        const cachedQuestions = sessionStorage.getItem(quizId);
        let generatedQuestions: Question[];

        if(cachedQuestions){
            generatedQuestions = JSON.parse(cachedQuestions);
        } else {
            generatedQuestions = await generateQuizQuestions(subject.title, isPracticeMode ? 'practice' : currentTopicTitle, userContext.user.grade);
            if (generatedQuestions.length > 0) {
              sessionStorage.setItem(quizId, JSON.stringify(generatedQuestions));
            }
        }

        if (generatedQuestions.length === 0) {
           setIsLoading(false);
           return;
        }

        const processed = processQuestions(generatedQuestions);
        setAllQuestions(processed);
        
        if (!isPracticeMode) {
            const topicIdentifier = `${subjectId}-${topicId}`;
            const currentStage = userContext.user.topicProgress[topicIdentifier] || 1;
            setStage(currentStage);

            if (currentStage <= STAGES_PER_TOPIC) {
                const start = (currentStage - 1) * QUESTIONS_PER_STAGE;
                const end = start + QUESTIONS_PER_STAGE;
                setCurrentStageQuestions(processed.slice(start, end));
            } else {
                // Topic already completed
                setIsQuizFinished(true);
            }
        } else {
            setCurrentStageQuestions(processed);
        }

        setIsLoading(false);
      }
  }, [subjectId, topicId, userContext, subject, isPracticeMode, topicTitle]);

  useEffect(() => {
    fetchAndSetQuestions();
  }, [fetchAndSetQuestions]);

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);

    const isCorrect = index === currentStageQuestions[currentQuestionIndex].correctAnswerIndex;
    if (isCorrect) {
      setScore(prev => prev + POINTS_FOR_CORRECT_ANSWER);
      playCorrect();
    } else {
      playIncorrect();
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentStageQuestions.length - 1) {
      setIsAnswered(false);
      setSelectedAnswer(null);
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Quiz finished
      const totalScore = currentStageQuestions.length * POINTS_FOR_CORRECT_ANSWER;
      const percentage = totalScore > 0 ? (score / totalScore) * 100 : 0;
      const passed = percentage >= PASSING_SCORE_PERCENTAGE;
      
      setFinalResult({ passed, percentage });

      if(userContext){
          const chest = userContext.addPoints(score);
          setAwardedChest(chest);
          if (!isPracticeMode) {
            userContext.updateTopicProgress(`${subjectId}-${topicId}`, stage, passed);
          }
      }
      setIsQuizFinished(true);
    }
  };
  
  const closeChestModalAndExit = () => {
    setAwardedChest(null);
    if (!isQuizFinished) { // if modal is shown mid-quiz for some reason
        setIsQuizFinished(true);
    }
  };

  const navigateToSubject = () => navigate(`/subject/${subjectId}`);


  if (isLoading || !userContext) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Spinner size="lg" />
        <p className="mt-4 text-xl text-textPrimary">מכין לך שאלות...</p>
      </div>
    );
  }

  if (currentStageQuestions.length === 0 && !isLoading) {
    return <div className="p-8 text-center text-xl">
        <p>לא הצלחנו לטעון שאלות עבור נושא זה.</p>
        <button onClick={navigateToSubject} className="mt-8 bg-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-blue-600 transition-colors">
            חזרה לנושאים
        </button>
    </div>
  }

  if (isQuizFinished) {
      return (
        <>
        <ChestOpeningModal chestType={awardedChest} onClose={closeChestModalAndExit} />
        {!awardedChest && (
            <div className="flex flex-col justify-center items-center h-screen text-center p-8 bg-gradient-to-b from-blue-100 to-white">
                <h2 className="text-5xl font-black text-primary mb-4">
                  {isPracticeMode ? "תרגול הושלם!" : `שלב ${stage} הושלם!`}
                </h2>
                <p className="text-2xl text-textSecondary mb-8">"{topicTitle}"</p>
                {finalResult && (
                    <div className={`p-6 rounded-2xl shadow-lg mb-8 ${finalResult.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                        <div className="text-3xl font-bold mb-2">
                            הציון שלך: <span className={finalResult.passed ? 'text-green-600' : 'text-red-600'}>{Math.round(finalResult.percentage)}%</span>
                        </div>
                        <p className={`text-xl font-semibold ${finalResult.passed ? 'text-green-700' : 'text-red-700'}`}>
                            {finalResult.passed ? 'עברת את השלב! כל הכבוד!' : 'לא נורא, נסה שוב כדי לעבור!'}
                        </p>
                    </div>
                )}
                <button onClick={navigateToSubject} className="mt-8 bg-primary text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-blue-600 transition-colors">
                {isPracticeMode || finalResult?.passed ? 'חזרה לנושאים' : 'נסה שוב'}
                </button>
            </div>
        )}
        </>
      );
  }

  const currentQuestion = currentStageQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / currentStageQuestions.length) * 100;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center text-primary mb-2">
            {topicTitle}
            {!isPracticeMode && ` - שלב ${stage}`}
        </h2>
        <ProgressBar value={progress} />
        <p className="text-center text-sm mt-1 text-textSecondary">שאלה {currentQuestionIndex + 1} מתוך {currentStageQuestions.length}</p>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-xl" dir="ltr">
        <h3 className="text-3xl font-semibold text-right leading-relaxed mb-8" dir="rtl">{currentQuestion.questionText}</h3>
        <div className="grid grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => {
            let buttonClass = 'bg-gray-100 hover:bg-gray-200 text-textPrimary';
            let icon = null;
            if (isAnswered) {
              if (index === currentQuestion.correctAnswerIndex) {
                buttonClass = 'bg-correct text-white';
                icon = <Check />;
              } else if (index === selectedAnswer) {
                buttonClass = 'bg-incorrect text-white';
                icon = <X />;
              } else {
                buttonClass = 'bg-gray-100 text-gray-400';
              }
            }
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswered}
                dir="rtl"
                className={`p-5 rounded-lg text-xl font-medium text-right transition-all duration-300 flex justify-between items-center ${buttonClass}`}
              >
                <span>{option}</span>
                {icon && <span className="ml-4">{icon}</span>}
              </button>
            );
          })}
        </div>
        
        {isAnswered && (
          <div className="mt-8 text-center">
             <div className="p-4 bg-blue-50 rounded-lg text-lg text-textSecondary mb-4 text-right" dir="rtl">
                <h4 className="font-bold text-primary mb-1">הסבר:</h4>
                {currentQuestion.explanation}
             </div>
             <button onClick={handleNextQuestion} className="bg-accent text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-orange-600 transition-colors">
              {currentQuestionIndex === currentStageQuestions.length - 1 ? 'סיים תרגול' : 'השאלה הבאה'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;