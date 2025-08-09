
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { SUBJECTS } from '../constants';
import { ArrowLeft } from 'lucide-react';

const HomePage: React.FC = () => {
  const userContext = useContext(UserContext);

  if (!userContext) return null;
  const { user } = userContext;

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-textPrimary">ברוך הבא, {user.name}!</h1>
        <p className="text-xl text-textSecondary">מוכנים ללמוד ולהנות?</p>
      </header>
      
      <div className="flex-1 flex flex-col gap-8">
        <div className="w-full flex flex-col">
           <h2 className="text-2xl font-bold text-textPrimary mb-4">בואו נבחר נושא ללמוד</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SUBJECTS.map(subject => (
                    <Link to={`/subject/${subject.id}`} key={subject.id} className={`p-6 rounded-2xl text-white ${subject.color} hover:scale-105 transform transition-transform duration-300 shadow-lg`}>
                        <div className="flex items-center mb-2">
                           {subject.icon({className: "w-10 h-10"})}
                           <h3 className="text-2xl font-bold mr-4">{subject.title}</h3>
                        </div>
                        <p className="mb-4">{subject.description}</p>
                        <div className="flex items-center font-semibold">
                            <span>התחל ללמוד</span>
                            <ArrowLeft className="mr-2"/>
                        </div>
                    </Link>
                ))}
           </div>
           <div className="mt-8 p-6 bg-white rounded-2xl shadow-md">
                <h3 className="text-xl font-bold text-primary mb-2">אתגר יומי 🧠</h3>
                <p className="text-textSecondary">חידת היגיון: מה עולה אבל אף פעם לא יורד?</p>
                <details className="mt-2 text-sm">
                    <summary className="cursor-pointer text-accent font-semibold">גלה את התשובה</summary>
                    <p className="mt-1 text-textPrimary">הגיל שלך!</p>
                </details>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
