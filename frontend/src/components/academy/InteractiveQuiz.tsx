"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  answers: Answer[];
}

interface QuizProps {
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    questions: Question[];
  };
  onComplete: (passed: boolean, score: number) => void;
}

export default function InteractiveQuiz({ quiz, onComplete }: QuizProps) {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const question = quiz.questions[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx === quiz.questions.length - 1;
  const currentSelection = selectedAnswers[question.id];

  const handleSelect = (answerId: string) => {
    if (currentSelection) return; // Prevent changing after selection
    setSelectedAnswers(prev => ({ ...prev, [question.id]: answerId }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      calculateResults();
    } else {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const calculateResults = () => {
    let correctCount = 0;
    quiz.questions.forEach(q => {
      const selected = selectedAnswers[q.id];
      const answer = q.answers.find(a => a.id === selected);
      if (answer?.isCorrect) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / quiz.questions.length) * 100);
    setShowResults(true);
    onComplete(percentage >= quiz.passingScore, percentage);
  };

  if (showResults) {
    let correctCount = 0;
    quiz.questions.forEach(q => {
      const selected = selectedAnswers[q.id];
      const answer = q.answers.find(a => a.id === selected);
      if (answer?.isCorrect) correctCount++;
    });
    const percentage = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = percentage >= quiz.passingScore;

    return (
      <div className="mt-12 p-8 border border-white/10 bg-[#0A0A0A] rounded-2xl text-center shadow-xl">
        <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6">
          {passed ? (
            <Trophy className="w-12 h-12 text-[#D4AF37]" />
          ) : (
            <XCircle className="w-12 h-12 text-destructive" />
          )}
        </div>
        <h2 className="text-3xl font-bold mb-2">{passed ? "Quiz Passed!" : "Quiz Failed"}</h2>
        <p className="text-muted-foreground mb-8">
          You scored {percentage}% (Required: {quiz.passingScore}%)
        </p>
        
        {!passed && (
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedAnswers({});
              setCurrentQuestionIdx(0);
              setShowResults(false);
              onComplete(false, 0); // Reset completion status
            }}
          >
            Retry Quiz
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-12 p-6 md:p-8 border border-white/10 bg-[#0A0A0A]/50 backdrop-blur-sm rounded-2xl">
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <h3 className="text-xl font-bold text-primary">{quiz.title}</h3>
        <span className="text-sm text-muted-foreground font-medium">
          Question {currentQuestionIdx + 1} of {quiz.questions.length}
        </span>
      </div>

      <div className="mb-8">
        <h4 className="text-2xl font-bold leading-relaxed mb-6">{question.text}</h4>
        <div className="space-y-3">
          {question.answers.map((answer) => {
            const isSelected = currentSelection === answer.id;
            
            // Determine styling based on whether an answer has been selected for this question
            let btnStyle = "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20";
            let iconColor = "border-white/20";
            
            if (currentSelection) {
              if (answer.isCorrect) {
                // Highlight correct answer in green (whether selected or not)
                btnStyle = "border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.15)]";
                iconColor = "border-green-500 text-green-500";
              } else if (isSelected && !answer.isCorrect) {
                // Highlight wrong selection in red
                btnStyle = "border-red-500 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]";
                iconColor = "border-red-500 text-red-500";
              } else {
                // Dim other unselected incorrect answers
                btnStyle = "border-white/5 bg-transparent opacity-50";
              }
            } else if (isSelected) {
               btnStyle = "border-primary bg-primary/10";
            }

            return (
              <button
                key={answer.id}
                onClick={() => handleSelect(answer.id)}
                disabled={!!currentSelection}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all duration-200",
                  btnStyle,
                  currentSelection ? "cursor-default" : "cursor-pointer"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    iconColor
                  )}>
                    {currentSelection && answer.isCorrect && <CheckCircle2 className="w-5 h-5" />}
                    {currentSelection && isSelected && !answer.isCorrect && <XCircle className="w-5 h-5" />}
                  </div>
                  <span className={isSelected || (currentSelection && answer.isCorrect) ? "text-white font-medium" : "text-muted-foreground"}>
                    {answer.text}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-white/10">
        <Button 
          onClick={handleNext} 
          disabled={!currentSelection}
          className="bg-primary hover:bg-primary/90 px-8"
        >
          {isLastQuestion ? "Submit Quiz" : "Next Question"}
        </Button>
      </div>
    </div>
  );
}
