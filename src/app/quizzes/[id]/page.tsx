'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Question {
  id: number;
  text: string;
  type: string;
  options: string[];
  correctAnswer: string; // String index like "0", "1", "2" from database
  explanation?: string;
  points: number;
}

interface Quiz {
  id: number;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  timeLimit?: number;
  passingScore: number;
  totalPoints: number;
  weekReference?: string;
  questions: Question[];
  creator: {
    name: string;
  };
  _count: {
    questions: number;
    attempts: number;
  };
}

export default function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [results, setResults] = useState<{
    score: number;
    isPassed: boolean;
    correctAnswers: number;
    totalQuestions?: number;
    timeSpent?: number;
    responses: Array<{
      questionId: number;
      userAnswer: string;
      isCorrect: boolean;
      question: {
        id: number;
        questionText: string;
        correctAnswer: string;
        explanation?: string;
      };
    }>;
    quiz: { title: string; passingScore: number; };
  } | null>(null);
  const [showExplanations, setShowExplanations] = useState(false);
  const [celebrationPlayed, setCelebrationPlayed] = useState(false);

  const resolvedParams = React.use(params);

  // Play celebration sound (simulated)
  const playCelebrationSound = useCallback(() => {
    if (typeof window !== 'undefined' && !celebrationPlayed) {
      // Create audio context for celebration sound
      try {
        // Define the window interface extension
        interface ExtendedWindow extends Window {
          AudioContext?: typeof AudioContext;
          webkitAudioContext?: typeof AudioContext;
        }
        const AudioContextClass = (window as ExtendedWindow).AudioContext || (window as ExtendedWindow).webkitAudioContext;
        if (!AudioContextClass) return;
        
        const audioContext = new AudioContextClass();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Play a cheerful sequence of notes
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        let noteIndex = 0;
        
        const playNote = () => {
          if (noteIndex < notes.length) {
            oscillator.frequency.setValueAtTime(notes[noteIndex], audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            noteIndex++;
            setTimeout(playNote, 150);
          }
        };
        
        oscillator.start();
        playNote();
        setTimeout(() => oscillator.stop(), 800);
        setCelebrationPlayed(true);
      } catch {
        console.log('Audio not supported in this browser');
      }
    }
  }, [celebrationPlayed]);

  const fetchQuiz = useCallback(async () => {
    try {
      const response = await fetch(`/api/quizzes/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        
        // Process questions to match frontend interface and ensure options are arrays
        if (data.questions) {
          data.questions = data.questions.map((question: {
            id: number;
            questionText: string;
            questionType: string;
            options: string | string[];
            correctAnswer?: string; // Optional since not included when showAnswers=false
            explanation?: string;
            points: number;
          }) => ({
            id: question.id,
            text: question.questionText,
            type: question.questionType,
            options: Array.isArray(question.options) 
              ? question.options 
              : typeof question.options === 'string' 
                ? JSON.parse(question.options)
                : [],
            correctAnswer: question.correctAnswer || '', // Keep as string or empty string
            explanation: question.explanation,
            points: question.points
          }));
        }
        
        setQuiz(data);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  const submitQuiz = useCallback(async () => {
    if (!quiz || !attemptId) return;
    
    try {
      // Convert answers to the format expected by the API
      const responses = Object.entries(answers).map(([questionId, answerIndex]) => ({
        questionId: parseInt(questionId),
        answer: answerIndex.toString() // Convert to string to match correctAnswer format
      }));

      console.log('Submitting quiz with responses:', responses);

      const response = await fetch(`/api/quizzes/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          timeSpent: quiz.timeLimit ? (quiz.timeLimit * 60) - (timeLeft || 0) : 0
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setResults(result);
        setQuizCompleted(true);
      } else {
        const errorData = await response.text();
        console.error('Failed to submit quiz:', response.status, response.statusText, errorData);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  }, [quiz, attemptId, answers, timeLeft]);

  useEffect(() => {
    if (resolvedParams.id) {
      fetchQuiz();
    }
  }, [resolvedParams.id, fetchQuiz]);

  // Timer effect
  useEffect(() => {
    if (quizStarted && !quizCompleted && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev <= 1) {
            submitQuiz();
            return 0;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quizStarted, quizCompleted, timeLeft, submitQuiz]);

  // Celebration effect for passing
  useEffect(() => {
    if (results && results.isPassed && !celebrationPlayed) {
      playCelebrationSound();
    }
  }, [results, celebrationPlayed, playCelebrationSound]);

  const startQuiz = async () => {
    if (!quiz) return;
    
    try {
      const response = await fetch(`/api/quizzes/${quiz.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 1 }) // Mock user ID
      });
      
      if (response.ok) {
        const attemptData = await response.json();
        setAttemptId(attemptData.id);
        setQuizStarted(true);
        setTimeLeft(quiz.timeLimit ? quiz.timeLimit * 60 : null);
      } else {
        console.error('Failed to start quiz:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-mono animate-pulse mb-4">Loading quiz...</div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Quiz Not Found</h1>
          <Link href="/quizzes" className="text-blue-400 hover:text-blue-300">
            ← Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  // Results view
  if (quizCompleted && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-green-600/10" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
        
        {/* Celebration Animation for Passing */}
        {results.isPassed && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {/* Main celebration emoji */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-9xl animate-bounce" style={{animationDuration: '1s'}}>🎉</div>
            </div>
            
            {/* Floating celebration elements */}
            <div className="absolute top-10 left-10 text-6xl animate-bounce" style={{animationDelay: '0s'}}>⭐</div>
            <div className="absolute top-20 right-20 text-6xl animate-bounce" style={{animationDelay: '0.5s'}}>✨</div>
            <div className="absolute bottom-20 left-20 text-6xl animate-bounce" style={{animationDelay: '1s'}}>🏆</div>
            <div className="absolute bottom-10 right-10 text-6xl animate-pulse" style={{animation: 'float 3s ease-in-out infinite 1.5s'}}>�</div>
            
            {/* Additional floating elements */}
            <div className="absolute top-1/3 left-10 text-4xl animate-pulse" style={{animationDelay: '0.3s'}}>🌟</div>
            <div className="absolute top-10 right-1/3 text-4xl animate-pulse" style={{animationDelay: '0.7s'}}>💎</div>
            <div className="absolute bottom-1/3 right-10 text-4xl animate-pulse" style={{animationDelay: '0.9s'}}>🎯</div>
            <div className="absolute bottom-10 left-1/3 text-4xl animate-pulse" style={{animationDelay: '1.2s'}}>🚀</div>
            
            {/* Confetti-like elements */}
            <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-green-400 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
            <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
            <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '0.9s'}}></div>
            <div className="absolute top-2/3 left-1/6 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '1.2s'}}></div>
            <div className="absolute top-1/6 right-1/6 w-4 h-4 bg-orange-400 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
          </div>
        )}
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 mb-8">
              <div className="text-center">
                {results.isPassed ? (
                  <div className="mb-6">
                    <div className="text-6xl mb-4 animate-bounce">🎉</div>
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 via-yellow-400 to-green-400 bg-clip-text text-transparent animate-pulse">
                      Congratulations!
                    </h1>
                    <p className="text-2xl text-green-300 mb-2">You passed the quiz!</p>
                    <div className="text-lg text-slate-300 bg-green-500/20 rounded-lg p-3 inline-block">
                      🏆 Great job! You&apos;ve mastered this topic!
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="text-6xl mb-4">📚</div>
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                      Keep Learning!
                    </h1>
                    <p className="text-xl text-orange-300 mb-2">Don&apos;t give up - you&apos;re getting there!</p>
                    <div className="text-lg text-slate-300 bg-orange-500/20 rounded-lg p-3 inline-block">
                      💪 Review the material and try again!
                    </div>
                  </div>
                )}
                
                <h2 className="text-xl text-slate-300 mb-6">{quiz.title}</h2>
                
                <div className="flex justify-center items-center gap-12 mb-8">
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${results.isPassed ? 'text-green-400' : 'text-orange-400'}`}>
                      {results.score}%
                    </div>
                    <div className="text-slate-400">Your Score</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl mb-2 ${results.isPassed ? 'text-green-400' : 'text-red-400'}`}>
                      {results.isPassed ? '✅' : '❌'}
                    </div>
                    <div className="text-slate-400">{results.isPassed ? 'Passed' : 'Failed'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-slate-300 mb-2">
                      {results.correctAnswers}/{quiz.questions.length}
                    </div>
                    <div className="text-slate-400">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-slate-300 mb-2">
                      {results.timeSpent ? formatTime(results.timeSpent) : 'N/A'}
                    </div>
                    <div className="text-slate-400">Time Spent</div>
                  </div>
                </div>
                
                <div className="flex gap-4 justify-center flex-wrap">
                  <button
                    onClick={() => setShowExplanations(!showExplanations)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    <span>{showExplanations ? '👁️‍🗨️ Hide' : '👁️ Show'} Correct Answers</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Reset quiz state for re-attempt
                      setQuizCompleted(false);
                      setQuizStarted(false);
                      setCurrentQuestion(0);
                      setAnswers({});
                      setResults(null);
                      setAttemptId(null);
                      setTimeLeft(null);
                      setShowExplanations(false);
                      setCelebrationPlayed(false);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    <span>🔄 Re-attempt Quiz</span>
                  </button>
                  
                  <Link
                    href="/quizzes"
                    className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    <span>📚 Back to Quizzes</span>
                  </Link>
                </div>
              </div>
            </div>

            {showExplanations && (
              <div className="space-y-6">
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 mb-6">
                  <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    📋 Review Your Answers
                  </h2>
                  <p className="text-center text-slate-400 mb-4">
                    Check your responses and learn from the explanations below
                  </p>
                  <div className="flex justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-600 rounded"></div>
                      <span className="text-green-300">Correct Answer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-600 rounded"></div>
                      <span className="text-red-300">Your Wrong Answer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-600 rounded"></div>
                      <span className="text-slate-300">Other Options</span>
                    </div>
                  </div>
                </div>

                {quiz.questions.map((question, index) => {
                  // Find the user's response for this question from the API results
                  const userResponse = results?.responses?.find(r => r.questionId === question.id);
                  const userAnswer = userResponse ? parseInt(userResponse.userAnswer) : undefined;
                  const isCorrect = userResponse?.isCorrect || false;
                  
                  // Get the correct answer index from the API response
                  // The API response includes correctAnswer as a string index when showCorrectAnswers is true
                  const correctAnswerFromAPI = userResponse?.question?.correctAnswer;
                  const correctAnswerIndex = correctAnswerFromAPI ? parseInt(correctAnswerFromAPI) : -1;
                  
                  return (
                    <div key={question.id} className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 transform transition-all hover:scale-[1.01]">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                          isCorrect ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {isCorrect ? '✓' : '✗'}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-semibold text-white">Question {index + 1}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                            }`}>
                              {isCorrect ? '✅ Correct' : '❌ Incorrect'}
                            </span>
                          </div>
                          
                          <p className="text-slate-200 mb-4 text-base leading-relaxed">{question.text}</p>
                          
                          <div className="space-y-2 mb-6">
                            {Array.isArray(question.options) ? question.options.map((option, optionIndex) => {
                              // Default styling
                              let bgColor = 'bg-slate-700/30 border-slate-600/50 text-slate-300';
                              let icon = '';
                              
                              // SIMPLE LOGIC:
                              // 1. If this option is the correct answer -> GREEN
                              // 2. If this option is user's wrong answer -> RED
                              // 3. Otherwise -> GRAY (default)
                              
                              const isCorrectOption = optionIndex === correctAnswerIndex;
                              const isUserWrongAnswer = optionIndex === userAnswer && !isCorrectOption;
                              
                              if (isCorrectOption) {
                                bgColor = 'bg-green-500/20 border-green-500/50 text-green-300';
                                icon = '✅ ';
                              } else if (isUserWrongAnswer) {
                                bgColor = 'bg-red-500/20 border-red-500/50 text-red-300';
                                icon = '❌ ';
                              }
                              
                              return (
                                <div
                                  key={optionIndex}
                                  className={`p-4 rounded-lg border transition-all ${bgColor}`}
                                >
                                  <span className="font-medium">{icon}{String.fromCharCode(65 + optionIndex)}.</span> {option}
                                </div>
                              );
                            }) : (
                              <div className="text-red-400 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                                ⚠️ Error: Question options are not properly formatted
                              </div>
                            )}
                          </div>
                          
                          {question.explanation && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-blue-400 text-lg">💡</span>
                                <h4 className="font-semibold text-blue-300">Explanation</h4>
                              </div>
                              <p className="text-blue-100 leading-relaxed">{question.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Quiz taking view
  if (quizStarted && !quizCompleted) {
    const question = quiz.questions[currentQuestion];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-green-600/10" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
                  <p className="text-slate-400">Question {currentQuestion + 1} of {quiz.questions.length}</p>
                </div>
                <div className="text-right">
                  {timeLeft !== null && (
                    <div className="text-lg font-mono text-blue-400">
                      ⏰ {formatTime(timeLeft)}
                    </div>
                  )}
                  <div className="text-sm text-slate-400">
                    {quiz._count.questions} Questions • {quiz.totalPoints} Points
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6 text-white">{question.text}</h2>
              
              <div className="space-y-3">
                {Array.isArray(question.options) ? question.options.map((option, index) => (
                  <label key={index} className="flex items-center p-4 border border-slate-600/50 rounded-lg hover:bg-slate-700/30 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={index}
                      checked={answers[question.id] === index}
                      onChange={() => setAnswers(prev => ({ ...prev, [question.id]: index }))}
                      className="mr-3 w-4 h-4 text-blue-600"
                    />
                    <span className="text-white">{option}</span>
                  </label>
                )) : (
                  <div className="text-red-400">Error: Question options are not properly formatted</div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <span className="text-slate-400 font-mono">
                {currentQuestion + 1} / {quiz.questions.length}
              </span>
              
              {currentQuestion === quiz.questions.length - 1 ? (
                <button
                  onClick={submitQuiz}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz overview/start view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/5 to-green-600/10" />
      <div className="absolute inset-0 backdrop-blur-3xl" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8 mb-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                {quiz.title}
              </h1>
              {quiz.description && (
                <p className="text-xl text-slate-300 mb-6 max-w-2xl mx-auto">{quiz.description}</p>
              )}
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <span className="px-3 py-1 rounded-full border border-blue-500/50 text-blue-400">
                {quiz.difficulty.toUpperCase()}
              </span>
              <span className="text-slate-400">Category: {quiz.category}</span>
              <span className="text-slate-400">{quiz._count.questions} Questions</span>
              <span className="text-slate-400">{quiz.totalPoints} Points</span>
              {quiz.timeLimit && (
                <span className="text-slate-400">Time Limit: {quiz.timeLimit} min</span>
              )}
              {quiz.weekReference && (
                <span className="text-slate-400">Week: {quiz.weekReference}</span>
              )}
            </div>
          </div>

          {/* Quiz Info */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 text-blue-400">📋 Quiz Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-white">Quiz Details:</h4>
                <ul className="space-y-1 text-slate-300">
                  <li>• {quiz._count.questions} questions</li>
                  <li>• {quiz.totalPoints} total points</li>
                  <li>• {quiz.passingScore}% passing score</li>
                  {quiz.timeLimit && <li>• {quiz.timeLimit} minute time limit</li>}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-white">Instructions:</h4>
                <ul className="space-y-1 text-slate-300">
                  <li>• Read each question carefully</li>
                  <li>• Select the best answer for each question</li>
                  <li>• You can navigate between questions</li>
                  <li>• Submit when you&apos;re ready</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Start Quiz */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-semibold text-blue-300 mb-4">Ready to Start?</h3>
            <p className="text-slate-300 mb-6 max-w-lg mx-auto">
              Once you start the quiz, {quiz.timeLimit ? `you&apos;ll have ${quiz.timeLimit} minutes to complete it` : 'you can take as much time as you need'}.
              Make sure you&apos;re ready before beginning.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={startQuiz}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 font-semibold transition-all"
              >
                🚀 Start Quiz
              </button>
              <Link
                href="/quizzes"
                className="px-8 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                ← Back to Quizzes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}