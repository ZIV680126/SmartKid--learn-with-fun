
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SUBJECTS, STAGES_PER_TOPIC } from '../constants';
import { generateTopics } from '../services/geminiService';
import Spinner from '../components/ui/Spinner';
import { UserContext } from '../context/UserContext';
import { CheckCircle2, Lock, Star } from 'lucide-react';
import ProgressBar from '../components/ui/ProgressBar';

const SubjectPage: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const [topics, setTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userContext = useContext(UserContext);
  
  const subject = SUBJECTS.find(s => s.id === subjectId);

  useEffect(() => {
    const fetchTopics = async () => {
      if (subject && userContext?.user.grade) {
        setIsLoading(true);
        // Caching topics in session storage to avoid repeated API calls
        const cachedTopics = sessionStorage.getItem(`topics-${subject.id}-${userContext.user.grade}`);
        if (cachedTopics) {
          setTopics(JSON.parse(cachedTopics));
        } else {
          const generatedTopics = await generateTopics(subject.title, userContext.user.grade);
          setTopics(generatedTopics);
          sessionStorage.setItem(`topics-${subject.id}-${userContext.user.grade}`, JSON.stringify(generatedTopics));
        }
        setIsLoading(false);
      }
    };
    fetchTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, userContext?.user.grade]);

  if (!subject || !userContext) {
    return <div>נושא לא נמצא</div>;
  }

  const { user } = userContext;

  return (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <div className={`p-4 rounded-full text-white ${subject.color} mr-4`}>
            {subject.icon({ className: "w-12 h-12"})}
        </div>
        <div>
            <h1 className="text-4xl font-black text-textPrimary">{subject.title}</h1>
            <p className="text-xl text-textSecondary">בחר נושא כדי להתחיל לתרגל</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
          <p className="mr-4 text-xl">טוען נושאים בשבילך...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {topics.map((topic, index) => {
            const topicIdentifier = `${subject.id}-${index}`;
            const stage = user.topicProgress[topicIdentifier] || 1;
            const isCompleted = stage > STAGES_PER_TOPIC;
            const isLocked = index > 0 && !(user.topicProgress[`${subject.id}-${index - 1}`] > STAGES_PER_TOPIC);
            const progressPercentage = isCompleted ? 100 : ((stage - 1) / STAGES_PER_TOPIC) * 100;

            return (
              <div key={topicIdentifier}>
                {isLocked ? (
                  <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-100 text-gray-400 rounded-2xl shadow-sm text-center">
                    <Lock className="w-8 h-8 mb-2"/>
                    <span className="font-bold">{topic}</span>
                    <span className="text-sm">נעל את הנושא הקודם כדי לפתוח</span>
                  </div>
                ) : (
                  <Link
                    to={`/quiz/${subject.id}/${index}`}
                    state={{ topicTitle: topic }}
                    className={`block p-6 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full ${isCompleted ? 'bg-green-100 border-2 border-green-500' : 'bg-white'}`}
                  >
                    <div className="flex justify-between items-start">
                        <span className="font-bold text-lg text-textPrimary flex-1">{topic}</span>
                        {isCompleted && <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />}
                    </div>
                    <div className="mt-auto pt-4">
                        <p className="text-sm text-textSecondary mb-2">
                          {isCompleted ? "הושלם בהצלחה!" : `שלב ${stage} מתוך ${STAGES_PER_TOPIC}`}
                        </p>
                        <ProgressBar value={progressPercentage} color={isCompleted ? 'bg-green-500' : 'bg-secondary'} />
                    </div>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubjectPage;
