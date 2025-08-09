import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import { generateQuizQuestions } from '../services/geminiService';
import { Question, Subject } from '../types';
import { SUBJECTS } from '../constants';
import Spinner from '../components/ui/Spinner';
import { X, RefreshCw, Home } from 'lucide-react';

const PLAYER = 'X';
const COMPUTER = 'O';

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

const TicTacToeGamePage: React.FC = () => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const userContext = useContext(UserContext);
    
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [winner, setWinner] = useState<string | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [selectedCell, setSelectedCell] = useState<number | null>(null);
    const [shuffledAnswers, setShuffledAnswers] = useState<{ text: string, originalIndex: number }[]>([]);

    const subject = SUBJECTS.find(s => s.id === subjectId);

    const initGame = useCallback(() => {
        setBoard(Array(9).fill(null));
        setWinner(null);
        setIsPlayerTurn(true);
        setCurrentQuestion(null);
        setSelectedCell(null);
    }, []);

    const fetchQuestions = useCallback(async () => {
        if (subject && userContext?.user.grade) {
            setIsLoading(true);
            const cachedQuestions = sessionStorage.getItem(`tictactoe-questions-${subject.id}`);
            if (cachedQuestions) {
                setQuestions(JSON.parse(cachedQuestions));
            } else {
                const fetchedQuestions = await generateQuizQuestions(subject.title, 'practice', userContext.user.grade);
                if (fetchedQuestions.length > 0) {
                    setQuestions(fetchedQuestions);
                    sessionStorage.setItem(`tictactoe-questions-${subject.id}`, JSON.stringify(fetchedQuestions));
                }
            }
            setIsLoading(false);
            initGame();
        }
    }, [subject, userContext?.user.grade, initGame]);
    
    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const checkWinner = (currentBoard: (string | null)[]) => {
        for (let combination of winningCombinations) {
            const [a, b, c] = combination;
            if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
                return currentBoard[a];
            }
        }
        if (currentBoard.every(cell => cell !== null)) {
            return 'Draw';
        }
        return null;
    };

    const handleCellClick = (index: number) => {
        if (board[index] || winner || !isPlayerTurn) return;

        setSelectedCell(index);
        const question = questions[Math.floor(Math.random() * questions.length)];
        setCurrentQuestion(question);
        
        // Shuffle answers
        const mappedOptions = question.options.map((opt, i) => ({ text: opt, originalIndex: i }));
        for (let i = mappedOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [mappedOptions[i], mappedOptions[j]] = [mappedOptions[j], mappedOptions[i]];
        }
        setShuffledAnswers(mappedOptions);

        setShowQuestionModal(true);
    };
    
    const handleAnswerSubmit = (selectedIndex: number) => {
        setShowQuestionModal(false);
        const correct = selectedIndex === currentQuestion?.correctAnswerIndex;

        if (correct && selectedCell !== null) {
            const newBoard = [...board];
            newBoard[selectedCell] = PLAYER;
            setBoard(newBoard);
            const gameWinner = checkWinner(newBoard);
            if(gameWinner) {
                setWinner(gameWinner);
            } else {
                setIsPlayerTurn(false);
            }
        } else {
            // Wrong answer, computer's turn
            setIsPlayerTurn(false);
        }
        setCurrentQuestion(null);
        setSelectedCell(null);
    }
    
    const computerMove = useCallback(() => {
        if (winner) return;

        let bestMove = -1;

        // 1. Win
        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                const tempBoard = [...board]; tempBoard[i] = COMPUTER;
                if (checkWinner(tempBoard) === COMPUTER) { bestMove = i; break; }
            }
        }
        // 2. Block
        if (bestMove === -1) {
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    const tempBoard = [...board]; tempBoard[i] = PLAYER;
                    if (checkWinner(tempBoard) === PLAYER) { bestMove = i; break; }
                }
            }
        }
        // 3. Center
        if (bestMove === -1 && !board[4]) { bestMove = 4; }
        // 4. Random available
        if (bestMove === -1) {
            const availableCells = board.map((c, i) => c === null ? i : null).filter(c => c !== null);
            bestMove = availableCells[Math.floor(Math.random() * availableCells.length)];
        }

        if (bestMove !== -1) {
            const newBoard = [...board];
            newBoard[bestMove] = COMPUTER;
            setBoard(newBoard);
            const gameWinner = checkWinner(newBoard);
            if(gameWinner) {
                setWinner(gameWinner);
            } else {
                setIsPlayerTurn(true);
            }
        }
    }, [board, winner]);


    useEffect(() => {
        if (!isPlayerTurn && !winner) {
            const timer = setTimeout(computerMove, 1000);
            return () => clearTimeout(timer);
        }
    }, [isPlayerTurn, winner, computerMove]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    }

    if (!subject) {
        return <div className="text-center p-8">נושא לא נמצא.</div>;
    }
    
    const getStatusMessage = () => {
        if (winner) {
            if (winner === 'Draw') return "תיקו!";
            return winner === PLAYER ? "ניצחת! כל הכבוד!" : "המחשב ניצח. נסה שוב!";
        }
        return isPlayerTurn ? "תורך! בחר משבצת" : "תורו של המחשב...";
    }

    return (
        <div className="p-4 sm:p-8 flex flex-col items-center h-full bg-gray-50">
            <h1 className="text-3xl sm:text-4xl font-black text-textPrimary mb-2">איקס עיגול לימודי</h1>
            <h2 className={`text-xl sm:text-2xl font-bold mb-6 text-white px-4 py-1 rounded-full ${subject.color}`}>{subject.title}</h2>

            <div className="w-full max-w-md bg-white p-4 rounded-2xl shadow-lg mb-6">
                <p className="text-center text-xl font-bold text-primary">{getStatusMessage()}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-md aspect-square mb-6">
                {board.map((value, index) => (
                    <button key={index} onClick={() => handleCellClick(index)} className="bg-white rounded-2xl shadow-md flex justify-center items-center hover:bg-blue-50 transition-colors disabled:cursor-not-allowed" disabled={!isPlayerTurn || !!value || !!winner}>
                        {value === PLAYER && <X className="w-1/2 h-1/2 text-secondary" strokeWidth={3} />}
                        {value === COMPUTER && <span className="text-6xl sm:text-8xl font-bold text-accent">O</span>}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-4">
                 <Link to="/games" className="bg-primary text-white font-bold py-3 px-6 rounded-full text-lg hover:bg-blue-600 transition-all flex items-center gap-2">
                    <Home className="w-6 h-6"/>
                    חזור למשחקים
                </Link>
                <button onClick={initGame} className="bg-accent text-white font-bold py-3 px-6 rounded-full text-lg hover:bg-orange-600 transition-all flex items-center gap-2">
                    <RefreshCw className="w-6 h-6"/>
                    שחק שוב
                </button>
            </div>
            
             {/* Question Modal */}
            {showQuestionModal && currentQuestion && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full" dir="ltr">
                        <h3 className="text-xl sm:text-2xl font-semibold text-right leading-relaxed mb-6" dir="rtl">{currentQuestion.questionText}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {shuffledAnswers.map((answer, index) => (
                                <button key={index} onClick={() => handleAnswerSubmit(answer.originalIndex)} className="w-full p-4 rounded-lg text-lg text-right font-medium bg-gray-100 hover:bg-primary hover:text-white transition-all">
                                    {answer.text}
                                </button>
                            ))}
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default TicTacToeGamePage;